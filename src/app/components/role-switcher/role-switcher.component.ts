import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthRoleService } from '../../core/security/services/auth-role.service';
import { Role, UserRoleState } from '../../core/security/interfaces/role.interface';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-role-switcher',
  standalone: true,
  templateUrl: './role-switcher.component.html',
  styleUrls: ['./role-switcher.component.css'],
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RoleSwitcherComponent implements OnInit, OnDestroy {
  
  roleState: UserRoleState = {
    currentRole: null,
    availableRoles: [],
    isSimulated: true,
    lastChanged: null
  };

  availableRoles: Role[] = [];
  selectedRoleId: string = '';
  showDebug = false;

  private destroy$ = new Subject<void>();

  constructor(private authRoleService: AuthRoleService) {}

  ngOnInit(): void {
    this.authRoleService.roleState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.roleState = state;
        this.selectedRoleId = state.currentRole?.id || '';
      });

    this.availableRoles = this.authRoleService.getAvailableRoles();

    this.showDebug = !environment.production;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRoleChange(): void {
    if (this.selectedRoleId) {
      const success = this.authRoleService.switchRole(this.selectedRoleId);
      if (!success) {
        console.error('Failed to switch role to:', this.selectedRoleId);
        this.selectedRoleId = this.roleState.currentRole?.id || '';
      }
    }
  }

  clearRole(): void {
    this.authRoleService.clearRole();
    this.selectedRoleId = '';
  }
}