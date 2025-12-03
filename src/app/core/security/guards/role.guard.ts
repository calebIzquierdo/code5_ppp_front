import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthRoleService } from '../services/auth-role.service';
import { RouteRoleData } from '../interfaces/role.interface';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanLoad {

  constructor(
    private authRoleService: AuthRoleService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAccess(route.data as RouteRoleData, state.url);
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    const url = segments.map(s => s.path).join('/');
    return this.checkAccess(route.data as RouteRoleData, url);
  }

  private checkAccess(routeData: RouteRoleData, url: string): Observable<boolean> {
    return this.authRoleService.roleState$.pipe(
      map(roleState => {
        // If no role is set, deny access
        if (!roleState.currentRole) {
          console.warn(`🚫 Access denied to ${url}: No role assigned`);
          this.handleAccessDenied(url, 'No role assigned');
          return false;
        }

        // Check role requirements
        if (routeData?.requiredRole) {
          if (!this.authRoleService.hasRole(routeData.requiredRole)) {
            console.warn(`🚫 Access denied to ${url}: Required role '${routeData.requiredRole}' not found`);
            this.handleAccessDenied(url, `Required role: ${routeData.requiredRole}`);
            return false;
          }
        }

        // Check permission requirements (if implemented)
        if (routeData?.requiredPermission) {
          // TODO: Implement permission checking logic
          // This would parse permission strings and check against user permissions
          const hasPermission = this.authRoleService.canAccessRoute(
            routeData.requiredRole,
            routeData.requiredPermission,
            routeData.requireAll
          );
          
          if (!hasPermission) {
            console.warn(`🚫 Access denied to ${url}: Required permission '${routeData.requiredPermission}' not found`);
            this.handleAccessDenied(url, `Required permission: ${routeData.requiredPermission}`);
            return false;
          }
        }

        console.log(`✅ Access granted to ${url} for role: ${roleState.currentRole.displayName}`);
        return true;
      })
    );
  }

  private handleAccessDenied(url: string, reason: string): void {
    // You can customize this behavior:
    // - Redirect to login page
    // - Show access denied page  
    // - Show notification/toast
    // - Redirect to home page

    console.log(`Redirecting from ${url} due to: ${reason}`);
    
    // For now, redirect to home page
    // In a real app, you might redirect to /login or /access-denied
    this.router.navigate(['/'], { 
      queryParams: { 
        accessDenied: 'true', 
        reason: encodeURIComponent(reason),
        attemptedUrl: encodeURIComponent(url)
      } 
    });
  }
}