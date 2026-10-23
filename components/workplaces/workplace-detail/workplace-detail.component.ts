import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgxMaskPipe } from 'ngx-mask';

// Models
import { Workplace } from '../../../models/workplace.model';

export type WorkplaceDetailDialogData = {
  workplace?: Workplace;
};

@Component({
  selector: 'app-workplace-detail',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    NgxMaskPipe
  ],
  templateUrl: './workplace-detail.component.html',
  styleUrl: './workplace-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkplaceDetailComponent {
  // ==========================================
  // Injeção de Dependências e Dados
  // ==========================================
  protected readonly data = inject<WorkplaceDetailDialogData | null>(MAT_DIALOG_DATA, { optional: true });

  // ==========================================
  // Getters para Facilitação do Template
  // ==========================================
  protected get workplace(): Workplace | undefined {
    return this.data?.workplace;
  }

  protected get parentName(): string {
    return this.workplace?.parent?.name || 'Sem unidade superior';
  }
}