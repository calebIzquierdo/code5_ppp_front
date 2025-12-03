import { TestBed } from '@angular/core/testing';
import { AuthRoleService } from './auth-role.service';

describe('AuthRoleService', () => {
  let service: AuthRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthRoleService);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Role Management', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should start with no current role', () => {
      const currentRole = service.getCurrentRole();
      expect(currentRole).toBeNull();
    });

    it('should return available roles', () => {
      const roles = service.getAvailableRoles();
      expect(roles.length).toBe(3);
      expect(roles[0].id).toBe('admin');
      expect(roles[1].id).toBe('reviewer');
      expect(roles[2].id).toBe('student');
    });

    it('should switch to admin role successfully', () => {
      const success = service.switchRole('admin');
      expect(success).toBe(true);
      
      const currentRole = service.getCurrentRole();
      expect(currentRole?.id).toBe('admin');
      expect(currentRole?.displayName).toBe('Administrador');
    });

    it('should fail to switch to invalid role', () => {
      const success = service.switchRole('invalid-role');
      expect(success).toBe(false);
      
      const currentRole = service.getCurrentRole();
      expect(currentRole).toBeNull();
    });

    it('should clear role', () => {
      service.switchRole('admin');
      service.clearRole();
      
      const currentRole = service.getCurrentRole();
      expect(currentRole).toBeNull();
    });

    it('should persist role in localStorage', () => {
      service.switchRole('reviewer');
      
      const savedRole = localStorage.getItem('app_simulated_role');
      expect(savedRole).toBe('reviewer');
    });
  });

  describe('Role Checking', () => {
    beforeEach(() => {
      service.switchRole('admin');
    });

    it('should correctly identify current role', () => {
      expect(service.hasRole('admin')).toBe(true);
      expect(service.hasRole('reviewer')).toBe(false);
      expect(service.hasRole('student')).toBe(false);
    });

    it('should handle array of roles', () => {
      expect(service.hasRole(['admin', 'reviewer'])).toBe(true);
      expect(service.hasRole(['reviewer', 'student'])).toBe(false);
    });

    it('should return false when no role is set', () => {
      service.clearRole();
      expect(service.hasRole('admin')).toBe(false);
      expect(service.hasRole(['admin', 'reviewer'])).toBe(false);
    });
  });

  describe('Permission Checking', () => {
    it('should check admin permissions correctly', () => {
      service.switchRole('admin');
      
      expect(service.hasPermission('carta-presentacion', 'read')).toBe(true);
      expect(service.hasPermission('carta-presentacion', 'write')).toBe(true);
      expect(service.hasPermission('carta-presentacion', 'approve')).toBe(true);
      expect(service.hasPermission('gestion-practicas', 'delete')).toBe(true);
    });

    it('should check reviewer permissions correctly', () => {
      service.switchRole('reviewer');
      
      expect(service.hasPermission('carta-presentacion', 'read')).toBe(true);
      expect(service.hasPermission('carta-presentacion', 'approve')).toBe(true);
      expect(service.hasPermission('carta-presentacion', 'write')).toBe(false);
      expect(service.hasPermission('carta-presentacion', 'delete')).toBe(false);
    });

    it('should check student permissions correctly', () => {
      service.switchRole('student');
      
      expect(service.hasPermission('carta-presentacion', 'read')).toBe(true);
      expect(service.hasPermission('carta-presentacion', 'create')).toBe(true);
      expect(service.hasPermission('carta-presentacion', 'approve')).toBe(false);
      expect(service.hasPermission('gestion-practicas', 'read')).toBe(false);
    });

    it('should return false for permissions when no role', () => {
      service.clearRole();
      expect(service.hasPermission('carta-presentacion', 'read')).toBe(false);
    });

    it('should get resource permissions', () => {
      service.switchRole('admin');
      
      const permissions = service.getResourcePermissions('carta-presentacion');
      expect(permissions).toContain('read');
      expect(permissions).toContain('write');
      expect(permissions).toContain('approve');
      expect(permissions).toContain('delete');
    });

    it('should return empty array for unknown resource', () => {
      service.switchRole('admin');
      
      const permissions = service.getResourcePermissions('unknown-resource');
      expect(permissions).toEqual([]);
    });
  });

  describe('Multiple Permission Checking', () => {
    beforeEach(() => {
      service.switchRole('reviewer');
    });

    it('should check if user has any of specified permissions', () => {
      const hasAny = service.hasAnyPermission([
        { resource: 'carta-presentacion', action: 'write' },  // false for reviewer
        { resource: 'carta-presentacion', action: 'approve' } // true for reviewer
      ]);
      
      expect(hasAny).toBe(true);
    });

    it('should check if user has all specified permissions', () => {
      const hasAll = service.hasAllPermissions([
        { resource: 'carta-presentacion', action: 'read' },    // true for reviewer
        { resource: 'carta-presentacion', action: 'approve' }  // true for reviewer
      ]);
      
      expect(hasAll).toBe(true);
      
      const hasAllWithWrite = service.hasAllPermissions([
        { resource: 'carta-presentacion', action: 'read' },    // true for reviewer
        { resource: 'carta-presentacion', action: 'write' }    // false for reviewer
      ]);
      
      expect(hasAllWithWrite).toBe(false);
    });
  });

  describe('Observable State', () => {
    it('should emit role state changes', (done) => {
      let emissionCount = 0;
      
      service.roleState$.subscribe(state => {
        emissionCount++;
        
        if (emissionCount === 1) {
          // Initial state
          expect(state.currentRole).toBeNull();
          expect(state.isSimulated).toBe(true);
          
          // Switch role to trigger second emission
          service.switchRole('admin');
        } else if (emissionCount === 2) {
          // After role switch
          expect(state.currentRole?.id).toBe('admin');
          expect(state.lastChanged).toBeInstanceOf(Date);
          done();
        }
      });
    });
  });
});