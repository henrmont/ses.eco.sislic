import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, OnInit, effect, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ComponentType } from '@angular/cdk/portal';
import { Overlay } from '@angular/cdk/overlay';
import { finalize } from 'rxjs';

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
import { Workplace } from '../../models/workplace.model';
import { AuthService } from '../../services/auth.service';
import { WorkplaceService } from '../../services/workplace.service';

// Dialog Components (Ajuste as importações conforme forem criados)
import { WorkplaceDetailComponent } from '../../components/workplaces/workplace-detail/workplace-detail.component';
import { WorkplaceUpdateComponent } from '../../components/workplaces/workplace-update/workplace-update.component';
import { WorkplaceDeleteComponent } from '../../components/workplaces/workplace-delete/workplace-delete.component';
import { WorkplaceCreateComponent } from '../../components/workplaces/workplace-create/workplace-create.component';
import { NgxMaskPipe } from 'ngx-mask';

export interface WorkplaceTableRow extends Workplace {
  parent_name: string;
}

export interface WorkplacesDialogData {
  workplace?: Workplace;
}

@Component({
  selector: 'app-workplaces-page',
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
    NgxMaskPipe
  ],
  templateUrl: './workplaces.page.html',
  styleUrl: './workplaces.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkplacesPage implements OnInit, OnDestroy {
  // Canais de Comunicação Externa
  private readonly workplacesChannel = new BroadcastChannel('sislic-workplaces-channel');

  // Injeção de Dependências
  private readonly workplaceService = inject(WorkplaceService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly overlay = inject(Overlay);
  private readonly destroyRef = inject(DestroyRef);

  // Queries Reativas da View
  private readonly workplaceSort = viewChild<MatSort>('workplaceSort');
  private readonly workplacePaginator = viewChild<MatPaginator>('workplacePaginator');

  // Estado e Controle
  private loadingDialog?: MatDialogRef<LoadingComponent>;
  private readonly currentUser: SislicUser | null = this.authService.getCurrentUser();

  protected readonly displayedColumns: string[] = [
    'budget_entity',
    'name',
    'parent_name',
    'actions'
  ];

  protected readonly dataSource = new MatTableDataSource<WorkplaceTableRow>([]);

  constructor() {
    effect(() => {
      const sort = this.workplaceSort();
      const paginator = this.workplacePaginator();

      if (sort) this.dataSource.sort = sort;
      if (paginator) this.dataSource.paginator = paginator;
    });
  }

  ngOnInit(): void {
    this.fetchWorkplaces(true);
    this.listenToBroadcastChannel();
  }

  ngOnDestroy(): void {
    this.workplacesChannel.close();
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

  // Ações da Tabela e Página
  protected workplaceCreate(): void {
    this.openDialog(WorkplaceCreateComponent, {}, '700px');
  }

  protected workplaceDetail(workplace: Workplace): void {
    this.openDialog(WorkplaceDetailComponent, { workplace }, '700px');
  }

  protected workplaceUpdate(workplace: Workplace): void {
    this.openDialog(WorkplaceUpdateComponent, { workplace }, '700px');
  }

  protected workplaceDelete(workplace: Workplace): void {
    this.openDialog(WorkplaceDeleteComponent, { workplace });
  }

  // ==========================================
  // Métodos Privados
  // ==========================================
  private fetchWorkplaces(showLoading = false): void {
    if (showLoading) this.openLoading();

    this.workplaceService.getWorkplaces()
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
          this.dataSource.data = rawData.map((item) => this.mapWorkplaceToRow(item));
        },
        error: () => {
          this.dataSource.data = [];
        }
      });
  }

  private listenToBroadcastChannel(): void {
    this.workplacesChannel.onmessage = (message: MessageEvent<string>) => {
      if (message.data === 'update') {
        this.fetchWorkplaces(false);
      }
    };
  }

  private mapWorkplaceToRow(item: Workplace): WorkplaceTableRow {
    return {
      ...item,
      parent_name: item.parent?.name || '-'
    };
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
    data: WorkplacesDialogData,
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
        this.handleWorkplaceChange();
      }
    });
  }

  private handleWorkplaceChange(): void {
    this.fetchWorkplaces(false);
    this.workplacesChannel.postMessage('update');
  }
}