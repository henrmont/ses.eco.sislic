import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { MessageService } from '../../core/services/message-service';

export const professionalGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const messageService = inject(MessageService);

  // 1. Recupera as configurações passadas no 'data' da rota
  const requiredTypes = route.data['types'] as string[] | undefined;
  const requiredPermission = route.data['permission'] as string | undefined;

  // 2. Busca o usuário subindo toda a árvore de rotas ativas (Root -> Child)
  let user: any = null;
  let curr: ActivatedRouteSnapshot | null = route;
  while (curr) {
    if (curr.data && curr.data['user']) {
      user = curr.data['user'];
      break;
    }
    curr = curr.parent;
  }

  if (!user) {
    console.error('[ProfessionalGuard] Usuário não encontrado no data da rota.');
    messageService.showMessage('Sessão inválida ou dados do usuário não encontrados.');
    router.navigate(['/']); // Redireciona para a raiz genérica
    return false;
  }

  // ==========================================
  // Validação 1: Tipos Profissionais (Types)
  // ==========================================
  const userProfessionalTypes: string[] = (user?.professional?.types || []).map(
    (item: any) => (typeof item === 'string' ? item : item.type)
  );

  const hasValidType = !requiredTypes || requiredTypes.length === 0 
    ? true 
    : requiredTypes.some(type => userProfessionalTypes.includes(type));

  if (!hasValidType) {
    console.warn('[ProfessionalGuard] Tipo profissional inválido:', userProfessionalTypes, 'Exigidos:', requiredTypes);
    messageService.showMessage('Seu perfil profissional não possui acesso a este recurso.');
    return false;
  }

  // ==========================================
  // Validação 2: Permissões de Acesso (Permissions)
  // ==========================================
  if (requiredPermission) {
    const roles: any[] = user?.roles || [];

    // Consolida todas as permissões das roles do usuário
    const userPermissions: string[] = roles.flatMap((role: any) =>
      (role.permissions || []).map((p: any) => p.name)
    );

    // Identifica o módulo atual a partir do caminho do nó pai ou padrão 'sislic'
    const module = route.parent?.routeConfig?.path || 'sislic';

    // Testa os formatos possíveis da permissão:
    // 1. Nome exato ("usuário listar")
    // 2. Com módulo relativo ("usuarios/usuário listar")
    // 3. Com prefixo do SISLIC ("sislic/usuário listar")
    const hasValidPermission = 
      userPermissions.includes(requiredPermission) ||
      userPermissions.includes(`${module}/${requiredPermission}`) ||
      userPermissions.includes(`sislic/${requiredPermission}`);

    if (!hasValidPermission) {
      console.warn('[ProfessionalGuard] Permissão negada. Usuário tem:', userPermissions, 'Requerida:', requiredPermission);
      messageService.showMessage('Você não possui a permissão necessária para acessar esta página.');
      return false;
    }
  }

  return true;
};