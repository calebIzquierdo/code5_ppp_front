import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { AuthRoleService } from '../services/auth-role.service';

@Injectable()
export class RoleSimulationInterceptor implements HttpInterceptor {

  constructor(private authRoleService: AuthRoleService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const currentRole = this.authRoleService.getCurrentRole();
    
    // Add role header to all requests
    if (currentRole) {
      req = req.clone({
        setHeaders: {
          'X-Simulated-Role': currentRole.id,
          'X-Simulated-Role-Name': currentRole.name,
          'X-Simulated-Permissions': currentRole.permissions.map(p => p.id).join(',')
        }
      });
    }

    // Simulate role-based responses for specific endpoints
    if (this.shouldSimulateResponse(req.url)) {
      return this.simulateRoleBasedResponse(req);
    }

    // Continue with normal request
    return next.handle(req);
  }

  private shouldSimulateResponse(url: string): boolean {
    // Add URLs that should be simulated based on role
    const simulatedEndpoints = [
      '/api/admin/',
      '/api/roles/',
      '/api/permissions/',
      // Add more endpoints as needed
    ];

    return simulatedEndpoints.some(endpoint => url.includes(endpoint));
  }

  private simulateRoleBasedResponse(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    const currentRole = this.authRoleService.getCurrentRole();
    
    if (!currentRole) {
      return of(new HttpResponse({
        status: 401,
        statusText: 'Unauthorized',
        body: { error: 'No role assigned', code: 'NO_ROLE' }
      }));
    }

    // Simulate different responses based on role
    if (req.url.includes('/api/admin/')) {
      if (currentRole.id !== 'admin') {
        return of(new HttpResponse({
          status: 403,
          statusText: 'Forbidden', 
          body: { error: 'Insufficient permissions', code: 'ADMIN_REQUIRED' }
        }));
      }
      
      return of(new HttpResponse({
        status: 200,
        body: {
          success: true,
          data: { message: 'Admin access granted', role: currentRole.displayName },
          permissions: currentRole.permissions
        }
      }));
    }

    // Default success response
    return of(new HttpResponse({
      status: 200,
      body: {
        success: true,
        message: 'Role simulation active',
        currentRole: currentRole.displayName,
        timestamp: new Date().toISOString()
      }
    }));
  }
}