import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, OnInit, effect, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ComponentType } from '@angular/cdk/portal';
import { Overlay } from '@angular/cdk/overlay';
import { finalize } from 'rxjs';
import { DatePipe } from '@angular/common';

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

// Core & Models
import { LoadingComponent } from '../../../core/components/loading-component/loading-component';
import { Permission } from '../../../core/models/permission.model';
import { Role } from '../../../core/models/role.model';
import { SislicUser } from '../../models/user.model';
import { Dfd } from '../../models/dfd.model'; // Substitua pelo caminho correto da model de DFD
import { DfdService } from '../../services/dfd.service'; // Substitua pelo serviço real
import { AuthService } from '../../services/auth.service';

// Dialog Components (Ajuste para seus diálogos de DFD)

interface DfdTableRow extends Dfd {
  is_editable: boolean;
}

interface DfdsDialogData {
  dfd?: Dfd;
}

@Component({
  selector: 'app-dfds-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    DatePipe
  ],
  templateUrl: './dfds.page.html',
  styleUrl: './dfds.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DfdsPage implements OnInit, OnDestroy {
  // Canais de Comunicação Externa
  private readonly dfdsChannel = new BroadcastChannel('sislic-dfds-channel');

  // Injeção de Dependências
  private readonly dfdService = inject(DfdService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly overlay = inject(Overlay);
  private readonly destroyRef = inject(DestroyRef);

  // Queries Reativas da View
  private readonly dfdSort = viewChild<MatSort>('dfdSort');
  private readonly dfdPaginator = viewChild<MatPaginator>('dfdPaginator');

  // Estado e Controle
  private loadingDialog?: MatDialogRef<LoadingComponent>;
  private readonly currentUser: SislicUser | null = this.authService.getCurrentUser();

  protected readonly displayedColumns: string[] = [
    'code',
    'title',
    'sector',
    'created_at',
    'status',
    'actions'
  ];

  protected readonly dataSource = new MatTableDataSource<DfdTableRow>([]);

  constructor() {
    effect(() => {
      const sort = this.dfdSort();
      const paginator = this.dfdPaginator();

      if (sort) this.dataSource.sort = sort;
      if (paginator) this.dataSource.paginator = paginator;
    });
  }

  ngOnInit(): void {
    this.fetchDfds(true);
    this.listenToBroadcastChannel();
  }

  ngOnDestroy(): void {
    this.dfdsChannel.close();
  }

  // ==========================================
  // Métodos Acessíveis no Template
  // ==========================================
  protected applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  protected checkPermissions(permissionName: string): boolean {
    if (!this.currentUser?.roles) return true;

    const hasPermission = this.currentUser.roles.some((role: Role) =>
      role.permissions?.some((perm: Permission) => perm.name === permissionName)
    );

    return !hasPermission;
  }

  // Ações do DFD
  protected dfdDetail(dfd: Dfd): void {
    // this.openDialog(DfdDetailComponent, { dfd }, '800px', 'auto', false);
  }

  protected dfdUpdate(dfd: Dfd): void {
    // this.openDialog(DfdUpdateComponent, { dfd }, '800px');
  }

  protected dfdDelete(dfd: Dfd): void {
    // this.openDialog(DfdDeleteComponent, { dfd });
  }

  // ==========================================
  // Métodos Privados
  // ==========================================
  private fetchDfds(showLoading = false): void {
    if (showLoading) this.openLoading();

    this.dfdService.getDfds()
      .pipe(
        finalize(() => {
          if (showLoading && this.loadingDialog) {
            this.loadingDialog.close();
          }
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          const rawData = response || [];
          this.dataSource.data = rawData.map((item) => this.mapDfdToRow(item));
        },
        error: () => {
          this.dataSource.data = [];
        }
      });
  }

  private listenToBroadcastChannel(): void {
    this.dfdsChannel.onmessage = (message: MessageEvent<string>) => {
      if (message.data === 'update') {
        this.fetchDfds(false);
      }
    };
  }

  private mapDfdToRow(item: Partial<Dfd>): DfdTableRow {
    return {
      ...(item as Dfd),
      is_editable: this.calculateEditable(item)
    };
  }

  private calculateEditable(dfd: Partial<Dfd>): boolean {
    // Exemplo de regra: DFDs finalizados ou cancelados não são editáveis
    if (dfd.status) {
      return false;
    }
    return true;
  }

  private openLoading(): void {
    this.loadingDialog = this.dialog.open(LoadingComponent, {
      height: '200px',
      disableClose: true,
      autoFocus: false
    });
  }

  private openDialog<T>(
    component: ComponentType<T>,
    data: DfdsDialogData,
    width = '400px',
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
        this.handleDfdChange();
      }
    });
  }

  private handleDfdChange(): void {
    this.fetchDfds(false);
    this.dfdsChannel.postMessage('update');
  }
}