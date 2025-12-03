import { Component, EventEmitter, Output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleSwitcherComponent } from '../role-switcher/role-switcher.component';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, RoleSwitcherComponent]
})
export class HeaderComponent {
  @Output() toggle = new EventEmitter<void>();
  showRoleSwitcher = false;

  onToggleSidebar() {
    this.toggle.emit();
  }

  toggleRoleSwitcher() {
    this.showRoleSwitcher = !this.showRoleSwitcher;
  }
}