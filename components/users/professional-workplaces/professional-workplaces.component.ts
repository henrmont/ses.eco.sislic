import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

// Angular Material & CDK
import { Overlay } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

// Core, Services & Models
import { MessageService } from '../../../../core/services/message-service';
import { Professional } from '../../../models/professional.model';
import { ProfessionalWorkplace } from '../../../models/professional-workplace.model';
import { Workplace } from '../../../models/workplace.model';
import { UserService } from '../../../services/user.service';
import { ProfessionalWorkplaceAttachComponent } from '../professional-workplace-attach/professional-workplace-attach.component';
import { ProfessionalWorkplaceDetachComponent } from '../professional-workplace-detach/professional-workplace-detach.component';
import { NgxMaskPipe } from 'ngx-mask';

// Dialog Components

type ProfessionalWorkplaceDialogData = {
  professional?: Professional;
  workplace?: Workplace;
  currentWorkplaces?: ProfessionalWorkplace[];
};

@Component({
  selector: 'app-professional-workplaces',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    NgxMaskPipe
  ],
  templateUrl: './professional-workplaces.component.html',
  styleUrl: './professional-workplaces.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfessionalWorkplacesComponent implements OnInit {
  // ==========================================
  // Instância do Broadcast Channel
  // ==========================================
  private readonly usersChannel = new BroadcastChannel('sislic-users-channel');

  // ==========================================
  // Injeção de Dependências
  // ==========================================
  protected readonly data = inject<ProfessionalWorkplaceDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly dialog = inject(MatDialog);
  private readonly overlay = inject(Overlay);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  // ==========================================
  // Propriedades e Estado Reativo
  // ==========================================
  protected readonly displayedColumns: string[] = ['budget_entity', 'name', 'actions'];
  protected readonly dataSource = new MatTableDataSource<ProfessionalWorkplace>([]);
  protected readonly isLoading = signal<boolean>(true);

  private readonly professionalId = computed(() => this.data?.professional?.id ?? null);

  // ==========================================
  // Ciclo de Vida (Hooks)
  // ==========================================
  ngOnInit(): void {
    this.setupBroadcastChannel();
    this.fetchProfessionalWorkplaces(true);
  }

  // ==========================================
  // Métodos Acessíveis pelo Template (Protected)
  // ==========================================
  protected professionalWorkplaceAttach(): void {
    this.openDialog(
      ProfessionalWorkplaceAttachComponent, 
      { 
        professional: this.data?.professional, 
        currentWorkplaces: this.dataSource.data 
      }, 
      '600px'
    );
  }

  protected professionalWorkplaceDetach(professionalWorkplace: ProfessionalWorkplace): void {
    this.openDialog(
      ProfessionalWorkplaceDetachComponent, 
      { 
        professional: this.data?.professional, 
        workplace: professionalWorkplace 
      }, 
      '400px', 
      'auto', 
      true
    );
  }

  // ==========================================
  // Métodos Privados / Auxiliares
  // ==========================================
  private fetchProfessionalWorkplaces(showLoading = false): void {
    const professionalId = this.professionalId();

    if (!professionalId) {
      this.isLoading.set(false);
      return;
    }

    if (showLoading) {
      this.isLoading.set(true);
    }

    this.userService.getProfessionalWorkplaces(professionalId)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ProfessionalWorkplace[]) => {
          this.dataSource.data = response || [];
        },
        error: (err) => {
          this.dataSource.data = [];
          const fallbackError = 'Não foi possível carregar os locais de trabalho vinculados ao profissional.';
          this.messageService.showMessage(err?.error?.message || fallbackError);
        }
      });
  }

  private setupBroadcastChannel(): void {
    this.usersChannel.onmessage = (message: MessageEvent<string>) => {
      if (message.data === 'update') {
        this.fetchProfessionalWorkplaces(false);
      }
    };

    this.destroyRef.onDestroy(() => {
      this.usersChannel.close();
    });
  }

  private openDialog<T>(
    component: ComponentType<T>,
    data: ProfessionalWorkplaceDialogData,
    width = '600px',
    height = 'auto',
    requiresRefresh = true
  ): void {
    this.dialog.open(component, {
      width,
      height,
      disableClose: true,
      autoFocus: false,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      data
    })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result && requiresRefresh) {
          this.handleWorkplaceChange();
        }
      });
  }

  private handleWorkplaceChange(): void {
    this.fetchProfessionalWorkplaces(false);
    this.usersChannel.postMessage('update');
  }
}