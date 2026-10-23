import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { NgxMaskPipe } from 'ngx-mask';

// Angular Material Modules
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// Core & Models
import { Dfd } from '../../../models/dfd.model';
import { AuthService } from '../../../services/auth.service';

export interface ObjectTypeOption {
  key: string;
  label: string;
}

export interface ProcurementMethodOption {
  key: string;
  label: string;
  requiresArpFields?: boolean;
}

@Component({
  selector: 'app-dfd-create',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    NgxMaskPipe,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule
  ],
  templateUrl: './dfd-create.component.html',
  styleUrl: './dfd-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DfdCreateComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dialogRef = inject(MatDialogRef<DfdCreateComponent>);
  
  protected readonly data = inject<{ dfd?: Dfd }>(MAT_DIALOG_DATA, { optional: true });
  protected readonly currentUser = computed(() => this.authService.currentUser());
  protected readonly orgaoFixo = 'SECRETARIA DE ESTADO DE SAÚDE – SES/MT';

  protected dfd?: Dfd;

  // Opções do Item 1 (Objeto)
  protected readonly objectTypeOptions: ObjectTypeOption[] = [
    { key: 'MATERIAL_CONSUMO', label: 'Material de consumo' },
    { key: 'MATERIAL_PERMANENTE', label: 'Material permanente' },
    { key: 'EQUIPAMENTO_TI', label: 'Equipamento/Dispositivo de TI (Não Patrimoniável)' },
    { key: 'SERVICO_NAO_CONTINUADO', label: 'Serviço não continuado' },
    { key: 'SERVICO_CONTINUADO_SEM_DEDICACAO', label: 'Serviço continuado SEM dedicação exclusiva de mão de obra' },
    { key: 'SERVICO_CONTINUADO_COM_DEDICACAO', label: 'Serviço continuado COM dedicação exclusiva de mão de obra' }
  ];

  // Opções do Item 2 (Forma de Contratação) conforme o documento oficial
  protected readonly procurementMethodOptions: ProcurementMethodOption[] = [
    { key: 'MODALIDADES_14133', label: 'Modalidades da Lei nº 14.133/21 e (Decreto nº 1.525/2022 – Regulamentação)' },
    { key: 'UTILIZACAO_ARP', label: 'Utilização à ARP - Órgão Participante', requiresArpFields: true },
    { key: 'ADESAO_ARP', label: 'Adesão à ARP de outro Órgão', requiresArpFields: true },
    { key: 'DISPENSA_INEXIGIBILIDADE', label: 'Dispensa/Inexigibilidade (Lei nº 14.133/21 e Decreto Estadual/MT nº 1.126 de 2021)' }
  ];

  ngOnInit(): void {
    if (this.data?.dfd) {
      this.dfd = this.data.dfd;
    }
  }

  // Métodos de verificação do Item 1
  protected isObjectTypeSelected(key: string): boolean {
    if (!this.dfd?.object_type) return false;
    if (Array.isArray(this.dfd.object_type)) {
      return this.dfd.object_type.includes(key);
    }
    return this.dfd.object_type.split(',').map(s => s.trim()).includes(key);
  }

  // Métodos de verificação do Item 2
  protected isProcurementMethodSelected(key: string): boolean {
    if (!this.dfd?.procurement_method) return false;
    return this.dfd.procurement_method === key;
  }

  protected changeWorkplace(): void {
    // Modal para alterar Unidade Orçamentária
  }

  // Ações do Item 1
  protected editObjectTypes(): void {
    // Modal para editar opções do objeto
  }

  protected editDemandDescription(): void {
    // Modal para editar justificativa/descrição da demanda (1.1)
  }

  // Ação para editar somente a Forma de Contratação / ARP
  protected editProcurementMethod(): void {
    // Lógica para abrir modal de seleção da forma de contratação (e dados de ARP se aplicável)
  }

  // Ação dedicada para editar a necessidade e justificativa do ETP
  protected editEtpRequirement(): void {
    // Lógica para abrir modal da necessidade de ETP (Sim/Não) e justificativa
  }

  protected close(): void {
    this.dialogRef.close(false);
  }
}