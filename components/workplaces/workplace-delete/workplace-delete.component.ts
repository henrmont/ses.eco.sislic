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
import { Workplace } from '../../../models/workplace.model';

// Services
import { WorkplaceService } from '../../../services/workplace.service';

export type WorkplaceDeleteDialogData = {
  workplace?: Workplace;
};

@Component({
  selector: 'app-workplace-delete',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './workplace-delete.component.html',
  styleUrl: './workplace-delete.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkplaceDeleteComponent {
  // ==========================================
  // Injeção de Dependências
  // ==========================================
  protected readonly data = inject<WorkplaceDeleteDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly workplaceService = inject(WorkplaceService);
  private readonly messageService = inject(MessageService);
  private readonly dialogRef = inject(MatDialogRef<WorkplaceDeleteComponent>);
  private readonly destroyRef = inject(DestroyRef);

  // ==========================================
  // Propriedades e Estado Reativo
  // ==========================================
  protected readonly isSubmitting = signal<boolean>(false);

  // ==========================================
  // Getters para Facilitação do Template
  // ==========================================
  protected get workplaceName(): string {
    return this.data?.workplace?.name || 'Local de Trabalho';
  }

  // ==========================================
  // Métodos Acessíveis pelo Template (Protected)
  // ==========================================
  protected onSubmit(): void {
    const workplaceId = this.data?.workplace?.id;

    if (!workplaceId) {
      this.messageService.showMessage('Identificador do local de trabalho inválido.');
      return;
    }

    this.isSubmitting.set(true);

    this.workplaceService.deleteWorkplace(workplaceId)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ApiResponse) => {
          this.messageService.showMessage(response?.message || 'Local de trabalho removido com sucesso!');
          this.dialogRef.close(true);
        },
        error: (err) => {
          const fallbackError = 'Erro ao tentar remover o local de trabalho.';
          this.messageService.showMessage(err?.error?.message || fallbackError);
        }
      });
  }
}