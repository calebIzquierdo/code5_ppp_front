import { Component, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent]
})
export class MainLayoutComponent {
  @ViewChild(SidebarComponent) sidebarComponent!: SidebarComponent;
  isSidebarVisible: boolean = true;
  isMobile: boolean = false;
  ngOnInit() {
    this.checkScreenSize();
  }
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }
  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    if (this.isMobile) {
      this.isSidebarVisible = false;
    } else {
      this.isSidebarVisible = true;
    }
  }
  toggleSidebar() {
    if (this.isMobile) {
      this.sidebarComponent.toggleMobileVisibility();
    } else {
      this.isSidebarVisible = !this.isSidebarVisible;
    }
  }
}