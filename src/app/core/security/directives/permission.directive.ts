import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthRoleService } from '../services/auth-role.service';
import { PermissionAction } from '../interfaces/role.interface';

/**
 * Structural directive to conditionally show/hide elements based on user permissions
 * 
 * Usage examples:
 * <div *hasPermission="'carta-presentacion'; action: 'write'">Edit button</div>
 * <div *hasPermission="'gestion-practicas'; action: 'approve'">Approve button</div>
 * <div *hasRole="'admin'">Admin only content</div>
 * <div *hasRole="['admin', 'reviewer']">Admin or reviewer content</div>
 */
@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input('hasPermission') resource!: string;
  @Input() action: PermissionAction = 'read';
  
  private destroy$ = new Subject<void>();
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authRoleService: AuthRoleService
  ) {}

  ngOnInit(): void {
    this.authRoleService.roleState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    const hasPermission = this.authRoleService.hasPermission(this.resource, this.action);
    
    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

/**
 * Structural directive to conditionally show/hide elements based on user role
 */
@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit, OnDestroy {
  @Input('hasRole') requiredRole!: string | string[];
  
  private destroy$ = new Subject<void>();
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authRoleService: AuthRoleService
  ) {}

  ngOnInit(): void {
    this.authRoleService.roleState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    const hasRole = this.authRoleService.hasRole(this.requiredRole);
    
    if (hasRole && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasRole && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}