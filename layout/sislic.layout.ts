import { 
  ChangeDetectionStrategy, 
  Component, 
  ElementRef, 
  inject, 
  viewChild, 
  DestroyRef, 
  computed, 
  OnInit, 
  OnDestroy 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Angular Material
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Modais (Dialogs)
import { UserCreateComponent } from '../components/users/user-create/user-create.component';
import { RoleCreateComponent } from '../components/roles/role-create/role-create.component';
import { WorkplaceCreateComponent } from '../components/workplaces/workplace-create/workplace-create.component';

// Enums Locais, Tipos e Serviços
import { Professionals } from '../enums/professionals';
import { SislicUser } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { DfdCreateComponent } from '../components/dfds/dfd-create/dfd-create.component';

// Nomes dos canais do módulo SISLIC
type SislicChannelKey = 'ROLES' | 'USERS' | 'WORKPLACES' | 'DFDS';

const SISLIC_CHANNEL_NAMES: Record<SislicChannelKey, string> = {
  ROLES: 'sislic-roles-channel',
  USERS: 'sislic-users-channel',
  WORKPLACES: 'sislic-workplaces-channel',
  DFDS: 'sislic-dfds-channel'
};

interface MenuItem {
  label: string;
  icon: string;
  types?: string[];        // Tipos de profissional autorizados (opcional)
  permissions?: string[];  // Permissões de acesso autorizadas (opcional)
  routerLink?: string[];
  action?: () => void;
}

interface MenuGroup {
  subHeader: string;
  requiredTypes?: string[];       // Tipos exigidos para o grupo
  requiredPermissions?: string[]; // Permissões exigidas para o grupo
  items: MenuItem[];
}

@Component({
  selector: 'app-sislic-layout',
  standalone: true,
  imports: [
    CommonModule, 
    MatSidenavModule, 
    MatListModule, 
    MatIconModule, 
    RouterModule, 
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './sislic.layout.html',
  styleUrl: './sislic.layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SislicLayout implements OnInit, OnDestroy {
  // 🔒 Injeções de dependência
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  // Captura do input HTML
  protected readonly competence = viewChild.required<ElementRef>('competence');

  // 📡 Mapa de instâncias dos BroadcastChannels do SISLIC
  private readonly channels = new Map<SislicChannelKey, BroadcastChannel>();

  // ==========================================
  // REATIVIDADE VIA SIGNALS (Resolve o atraso com OnPush)
  // ==========================================

  /**
   * Reage dinamicamente a alterações no usuário logado dentro do AuthService do SISLIC
   */
  protected readonly currentUser = computed(() => this.authService.currentUser() as SislicUser | null);

  /**
   * Extrai a lista de tipos de profissional atrelados ao usuário de forma resiliente
   */
  protected readonly userProfessionalTypes = computed<string[]>(() => {
    const user = this.currentUser();
    const professional = user?.professional;

    if (!professional) return [];

    const rawTypes = (professional as any)?.types || (professional as any)?.type || [];
    const typesList = Array.isArray(rawTypes) ? rawTypes : [rawTypes];

    return typesList
      .map((item: any) => {
        if (typeof item === 'string') return item;
        return item?.type || item?.name || item?.description || '';
      })
      .filter((type): type is string => Boolean(type))
      .map((type) => type.trim());
  });

  // ==========================================
  // Ciclo de Vida (Inicialização e Finalização dos Canais)
  // ==========================================
  ngOnInit(): void {
    (Object.keys(SISLIC_CHANNEL_NAMES) as SislicChannelKey[]).forEach(key => {
      this.channels.set(key, new BroadcastChannel(SISLIC_CHANNEL_NAMES[key]));
    });
  }

  ngOnDestroy(): void {
    this.channels.forEach(channel => channel.close());
    this.channels.clear();
  }

  /**
   * Método auxiliar para emitir mensagens com segurança no canal especificado
   */
  public postMessage(channelKey: SislicChannelKey, message: any = 'update'): void {
    const channel = this.channels.get(channelKey);
    if (channel) {
      channel.postMessage(message);
    }
  }

  // ==========================================
  // Métodos de Verificação de Acesso (Reativos)
  // ==========================================

  /**
   * Verifica se o usuário possui ao menos um dos tipos de profissional informados.
   */
  protected checkProfessionalType(allowedTypes?: string[]): boolean {
    if (!allowedTypes || allowedTypes.length === 0) return true;

    const currentTypes = this.userProfessionalTypes();
    return allowedTypes.some(type => 
      currentTypes.some(uType => uType.toLowerCase().trim() === type.toLowerCase().trim())
    );
  }

  /**
   * Verifica se o usuário possui ao menos uma das permissões informadas.
   */
  protected checkPermission(names?: string[]): boolean {
    if (!names || names.length === 0) return true;

    const user = this.currentUser();
    const roles: any[] = user?.roles || [];

    if (!roles.length) return false;

    const module = this.route.snapshot.routeConfig?.path || this.route.parent?.snapshot.routeConfig?.path || '';

    const userPermissions = roles.flatMap((role: any) => 
      (role.permissions || []).map((p: any) => p.name?.trim())
    );

    return names.some(name => {
      const fullPermissionName = module ? `${module}/${name}` : name;
      return userPermissions.includes(fullPermissionName) || userPermissions.includes(name);
    });
  }

  /**
   * Combina a verificação de Tipo de Profissional E Permissões.
   */
  protected hasAccess(types?: string[], permissions?: string[]): boolean {
    return this.checkProfessionalType(types) && this.checkPermission(permissions);
  }

  private openDialog(component: any, width = '500px', height = 'auto', channelKey?: SislicChannelKey): void {
    this.dialog.open(component, {
      width,
      height,
      disableClose: true,
      autoFocus: false,
    }).afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result && channelKey) {
          this.postMessage(channelKey, 'update');
        }
      });
  }

  // ==========================================
  // MENU DO TEMPLATE HTML
  // ==========================================
  protected readonly menuGroups: MenuGroup[] = [
    {
      subHeader: 'Usuários',
      requiredTypes: [Professionals.ADMINISTRADOR],
      requiredPermissions: ['usuário listar', 'usuário criar'],
      items: [
        { 
          label: 'Usuários', 
          icon: 'groups', 
          types: [Professionals.ADMINISTRADOR], 
          permissions: ['usuário listar'], 
          routerLink: ['usuarios'] 
        },
        { 
          label: 'Novo usuário', 
          icon: 'person_add', 
          types: [Professionals.ADMINISTRADOR], 
          permissions: ['usuário criar'], 
          action: () => this.userCreate() 
        }
      ]
    },
    {
      subHeader: 'Regras',
      requiredTypes: [Professionals.ADMINISTRADOR],
      requiredPermissions: ['regra listar', 'regra criar'],
      items: [
        { 
          label: 'Regras', 
          icon: 'security', 
          types: [Professionals.ADMINISTRADOR], 
          permissions: ['regra listar'], 
          routerLink: ['regras'] 
        },
        { 
          label: 'Nova regra', 
          icon: 'add_moderator', 
          types: [Professionals.ADMINISTRADOR], 
          permissions: ['regra criar'], 
          action: () => this.roleCreate() 
        }
      ]
    },
    {
      subHeader: 'Locais de trabalho',
      requiredTypes: [Professionals.ADMINISTRADOR],
      requiredPermissions: ['local de trabalho listar', 'local de trabalho criar'],
      items: [
        { 
          label: 'Locais de trabalho', 
          icon: 'workspaces', 
          types: [Professionals.ADMINISTRADOR], 
          permissions: ['local de trabalho listar'], 
          routerLink: ['locais-de-trabalho'] 
        },
        { 
          label: 'Novo local de trabalho', 
          icon: 'add_circle_outline', 
          types: [Professionals.ADMINISTRADOR], 
          permissions: ['local de trabalho criar'], 
          action: () => this.workplaceCreate() 
        },
      ]
    },
    {
      subHeader: 'DFD\'s',
      requiredTypes: [Professionals.DFD],
      requiredPermissions: ['dfd listar', 'dfd criar', 'dfd validar'],
      items: [
        { 
          label: 'DFD\'s', 
          icon: 'assignment', 
          types: [Professionals.DFD], 
          permissions: ['dfd listar'], 
          routerLink: ['dfds'] 
        },
        { 
          label: 'Novo dfd', 
          icon: 'assignment_add', 
          types: [Professionals.DFD], 
          permissions: ['dfd criar'], 
          action: () => this.dfdCreate() 
        },
        { 
          label: 'Validar DFD\'s', 
          icon: 'assignment_turned_in', 
          types: [Professionals.DFD], 
          permissions: ['dfd validar'], 
          routerLink: ['validate-dfds'] 
        },
      ]
    },
  ];

  // --- MÉTODOS DE AÇÃO DO TEMPLATE HTML ---
  protected userCreate(): void {
    this.openDialog(UserCreateComponent, '700px', 'auto', 'USERS');
  }

  protected roleCreate(): void {
    this.openDialog(RoleCreateComponent, '900px', 'auto', 'ROLES');
  }
        
  protected workplaceCreate(): void {
    this.openDialog(WorkplaceCreateComponent, '700px', 'auto', 'WORKPLACES');
  }

  protected dfdCreate(): void {
    this.openDialog(DfdCreateComponent, '1000px', 'auto', 'DFDS');
  }
}