import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Role, Permission, UserRoleState, PermissionAction } from '../interfaces/role.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthRoleService {
  private readonly STORAGE_KEY = 'app_simulated_role';
  
  private readonly defaultRoles: Role[] = [
    {
      id: 'admin',
      name: 'admin',
      displayName: 'Administrador',
      description: 'Acceso completo a todos los módulos',
      level: 1,
      permissions: [
        {
          id: 'carta-presentacion-full',
          name: 'Carta Presentación - Completo',
          resource: 'carta-presentacion',
          actions: ['read', 'write', 'create', 'update', 'delete', 'approve', 'export']
        },
        {
          id: 'gestion-practicas-full',
          name: 'Gestión Prácticas - Completo',
          resource: 'gestion-practicas',
          actions: ['read', 'write', 'create', 'update', 'delete', 'approve', 'export']
        },
        {
          id: 'empresa-full',
          name: 'Empresa - Completo',
          resource: 'empresa',
          actions: ['read', 'write', 'create', 'update', 'delete', 'approve', 'export']
        },
        {
          id: 'admin-panel',
          name: 'Panel Administrativo',
          resource: 'admin',
          actions: ['read', 'write', 'create', 'update', 'delete']
        }
      ]
    },
    {
      id: 'reviewer',
      name: 'reviewer', 
      displayName: 'Revisor/Docente',
      description: 'Puede revisar y aprobar cartas de estudiantes',
      level: 2,
      permissions: [
        {
          id: 'carta-presentacion-review',
          name: 'Carta Presentación - Revisión',
          resource: 'carta-presentacion',
          actions: ['read', 'approve', 'export']
        },
        {
          id: 'gestion-practicas-review',
          name: 'Gestión Prácticas - Revisión',
          resource: 'gestion-practicas',
          actions: ['read', 'approve', 'export']
        },
        {
          id: 'empresa-read',
          name: 'Empresa - Solo Lectura',
          resource: 'empresa',
          actions: ['read']
        }
      ]
    },
    {
      id: 'student',
      name: 'student',
      displayName: 'Estudiante',
      description: 'Acceso limitado a sus propias prácticas y cartas',
      level: 3,
      permissions: [
        {
          id: 'carta-presentacion-own',
          name: 'Carta Presentación - Propia',
          resource: 'carta-presentacion',
          actions: ['read', 'create', 'update']
        },
        {
          id: 'empresa-read-limited',
          name: 'Empresa - Lectura Limitada',
          resource: 'empresa',
          actions: ['read']
        }
      ]
    }
  ];

  private roleStateSubject = new BehaviorSubject<UserRoleState>({
    currentRole: null,
    availableRoles: this.defaultRoles,
    isSimulated: true,
    lastChanged: null
  });

  public roleState$ = this.roleStateSubject.asObservable();

  constructor() {
    this.loadSimulatedRole();
  }

  /**
   * Get current role state
   */
  getCurrentRoleState(): UserRoleState {
    return this.roleStateSubject.value;
  }

  /**
   * Get current role (null if none)
   */
  getCurrentRole(): Role | null {
    return this.roleStateSubject.value.currentRole;
  }

  /**
   * Get available roles for simulation
   */
  getAvailableRoles(): Role[] {
    return this.defaultRoles;
  }

  /**
   * Switch to a different role (simulation)
   */
  switchRole(roleId: string): boolean {
    const role = this.defaultRoles.find(r => r.id === roleId);
    if (!role) {
      console.warn(`Role with id '${roleId}' not found`);
      return false;
    }

    const newState: UserRoleState = {
      ...this.roleStateSubject.value,
      currentRole: role,
      lastChanged: new Date()
    };

    this.roleStateSubject.next(newState);
    this.saveSimulatedRole(roleId);
    
    console.log(`🔄 Role switched to: ${role.displayName} (${role.id})`);
    return true;
  }

  /**
   * Clear current role (logout simulation)
   */
  clearRole(): void {
    const newState: UserRoleState = {
      ...this.roleStateSubject.value,
      currentRole: null,
      lastChanged: new Date()
    };

    this.roleStateSubject.next(newState);
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🚪 Role cleared (logged out)');
  }

  /**
   * Check if user has specific role
   */
  hasRole(roleId: string | string[]): boolean {
    const currentRole = this.getCurrentRole();
    if (!currentRole) return false;

    if (Array.isArray(roleId)) {
      return roleId.includes(currentRole.id);
    }
    
    return currentRole.id === roleId;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(resource: string, action: PermissionAction): boolean {
    const currentRole = this.getCurrentRole();
    if (!currentRole) return false;

    return currentRole.permissions.some(permission => 
      permission.resource === resource && 
      permission.actions.includes(action)
    );
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(checks: Array<{resource: string, action: PermissionAction}>): boolean {
    return checks.some(check => this.hasPermission(check.resource, check.action));
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(checks: Array<{resource: string, action: PermissionAction}>): boolean {
    return checks.every(check => this.hasPermission(check.resource, check.action));
  }

  /**
   * Get user permissions for a specific resource
   */
  getResourcePermissions(resource: string): PermissionAction[] {
    const currentRole = this.getCurrentRole();
    if (!currentRole) return [];

    const permission = currentRole.permissions.find(p => p.resource === resource);
    return permission ? permission.actions : [];
  }

  /**
   * Check if current user can access a route based on role/permission requirements
   */
  canAccessRoute(requiredRole?: string | string[], requiredPermission?: string | string[], requireAll = false): boolean {
    // If no requirements, allow access
    if (!requiredRole && !requiredPermission) return true;

    // Check role requirement
    if (requiredRole && !this.hasRole(requiredRole)) {
      return false;
    }

    // Check permission requirement
    if (requiredPermission) {
      // TODO: Implement permission string parsing if needed
      // For now, assume permission strings are in format "resource:action"
      // This would be extended based on your permission string format
    }

    return true;
  }

  /**
   * Save current role to localStorage for persistence
   */
  private saveSimulatedRole(roleId: string): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, roleId);
    } catch (error) {
      console.warn('Could not save role to localStorage:', error);
    }
  }

  /**
   * Load previously selected role from localStorage
   */
  private loadSimulatedRole(): void {
    try {
      const savedRoleId = localStorage.getItem(this.STORAGE_KEY);
      if (savedRoleId) {
        const role = this.defaultRoles.find(r => r.id === savedRoleId);
        if (role) {
          const initialState: UserRoleState = {
            currentRole: role,
            availableRoles: this.defaultRoles,
            isSimulated: true,
            lastChanged: null // Don't trigger change on load
          };
          this.roleStateSubject.next(initialState);
          console.log(`🔧 Restored simulated role: ${role.displayName}`);
        }
      }
    } catch (error) {
      console.warn('Could not load role from localStorage:', error);
    }
  }

  /**
   * For future: integrate with real JWT claims
   */
  integrateWithJWT(token: string): boolean {
    // TODO: Decode JWT, extract roles/permissions
    // TODO: Map to internal role structure
    // TODO: Update roleStateSubject with real data
    console.log('🔮 JWT integration not yet implemented');
    return false;
  }
}