export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: Permission[];
  level: number; // Jerarquía: 1=admin, 2=reviewer, 3=student, etc.
}

export interface Permission {
  id: string;
  name: string;
  resource: string; // 'carta-presentacion', 'gestion-practicas', 'empresa', etc.
  actions: PermissionAction[]; // ['read', 'write', 'delete', 'approve']
}

export type PermissionAction = 'read' | 'write' | 'delete' | 'approve' | 'create' | 'update' | 'export';

export interface UserRoleState {
  currentRole: Role | null;
  availableRoles: Role[];
  isSimulated: boolean;
  lastChanged: Date | null;
}

// Claims JWT structure (for future integration)
export interface JWTClaims {
  sub: string; // user ID
  roles: string[]; // role IDs
  permissions: string[]; // permission IDs
  exp: number;
  iat: number;
}

// Route data contract
export interface RouteRoleData {
  requiredRole?: string | string[];
  requiredPermission?: string | string[];
  requireAll?: boolean; // true = must have ALL permissions, false = must have ANY
}