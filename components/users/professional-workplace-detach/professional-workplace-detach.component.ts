import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Core & Models
import { ApiResponse } from '../../../../core/models/api-response.model';
import { MessageService } from '../../../../core/services/message-service';
import { Professional } from '../../../models/professional.model';
import { ProfessionalWorkplace } from '../../../models/professional-workplace.model';

// Services
import { UserService } from '../../../services/user.service';

// ============================================================================
// Tipos e Interfaces
// ============================================================================

export type ProfessionalWorkplaceDetachDialogData = {
  professional?: Professional;
  workplace?: ProfessionalWorkplace;
};

@Component({
  selector: 'app-professional-workplace-detach',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './professional-workplace-detach.component.html',
  styleUrl: './professional-workplace-detach.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfessionalWorkplaceDetachComponent {
  // ==========================================
  // Injeção de Dependências
  // ==========================================
  protected readonly data = inject<ProfessionalWorkplaceDetachDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly dialogRef = inject(MatDialogRef<ProfessionalWorkplaceDetachComponent>);
  private readonly destroyRef = inject(DestroyRef);

  // ==========================================
  // Propriedades e Estado Reativo
  // ==========================================
  protected readonly isSubmitting = signal<boolean>(false);

  // ==========================================
  // Getters para Facilitação do Template
  // ==========================================
  protected get professionalName(): string {
    return this.data?.professional?.name || 'Profissional';
  }

  protected get workplaceName(): string {
    return this.data?.workplace?.workplace?.name || 'Local de Trabalho';
  }

  // ==========================================
  // Métodos Acessíveis pelo Template (Protected)
  // ==========================================
  protected onSubmit(): void {
    const professionalId = this.data?.professional?.id;
    const professionalWorkplaceId = this.data?.workplace?.pivot?.id;

    if (!professionalId || !professionalWorkplaceId) {
      this.messageService.showMessage('Parâmetros inválidos para desvincular o local de trabalho.');
      return;
    }

    this.isSubmitting.set(true);

    this.userService.detachWorkplace(professionalId, professionalWorkplaceId)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ApiResponse) => {
          this.messageService.showMessage(response?.message || 'Local de trabalho desvinculado com sucesso!');
          this.dialogRef.close(true);
        },
        error: (err) => {
          const fallbackError = 'Erro ao tentar desvincular o local de trabalho.';
          this.messageService.showMessage(err?.error?.message || fallbackError);
        }
      });
  }
}