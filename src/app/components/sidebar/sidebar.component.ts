import { Component, Input, CUSTOM_ELEMENTS_SCHEMA, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { HasRoleDirective, HasPermissionDirective } from '../../core/security/directives/permission.directive';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, HasRoleDirective, HasPermissionDirective],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SidebarComponent implements OnInit {
  @Input() collapsed: boolean = false;
  isPracticasOpen: boolean = false;
  isGestionOpen: boolean = false;
  isSetupOpen: boolean = false;
  isReportesOpen: boolean = false;
  isMobile: boolean = false;
  mobileVisible: boolean = false;

  constructor(private router: Router) {
    this.checkScreenSize();
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveDropdown();
    });
    
    this.updateActiveDropdown();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;
    
    if (this.isMobile && !wasMobile) {
      this.mobileVisible = false;
    } else if (!this.isMobile && wasMobile) {
      this.mobileVisible = false;
    }
  }

  updateActiveDropdown() {
    const currentUrl = this.router.url;
    
    if (this.isUrlInPracticas(currentUrl)) {
      this.isPracticasOpen = true;
    }
    if (this.isUrlInGestion(currentUrl)) {
      this.isGestionOpen = true;
    }
    if (this.isUrlInSetup(currentUrl)) {
      this.isSetupOpen = true;
    }
    if (this.isUrlInReportes(currentUrl)) {
      this.isReportesOpen = true;
    }
  }

  isUrlInPracticas(url: string): boolean {
    return url.includes('/oferta-laboral') || 
           url.includes('/carta-presentacion') || 
           url.includes('/mis-practicas') || 
           url.includes('/solicitar-certificacion');
  }

  isUrlInGestion(url: string): boolean {
    return url.includes('/gestion-practicas') || 
           url.includes('/empresa') || 
           url.includes('/seguimiento');
  }

  isUrlInSetup(url: string): boolean {
    return url.includes('/practicantes') || 
           url.includes('/tipos') || 
           url.includes('/gestion-horas');
  }

  isUrlInReportes(url: string): boolean {
    return url.includes('/certificacion') || 
           url.includes('/general-reporte');
  }

  hasActiveChildPracticas(): boolean {
    return this.isUrlInPracticas(this.router.url);
  }

  hasActiveChildGestion(): boolean {
    return this.isUrlInGestion(this.router.url);
  }

  hasActiveChildSetup(): boolean {
    return this.isUrlInSetup(this.router.url);
  }

  hasActiveChildReportes(): boolean {
    return this.isUrlInReportes(this.router.url);
  }

  togglePracticas() {
    this.isPracticasOpen = !this.isPracticasOpen;
    if (this.isPracticasOpen) {
      this.isGestionOpen = false;
      this.isSetupOpen = false;
      this.isReportesOpen = false;
    }
  }

  toggleGestion() {
    this.isGestionOpen = !this.isGestionOpen;
    if (this.isGestionOpen) {
      this.isPracticasOpen = false;
      this.isSetupOpen = false;
      this.isReportesOpen = false;
    }
  }

  toggleSetup() {
    this.isSetupOpen = !this.isSetupOpen;
    if (this.isSetupOpen) {
      this.isPracticasOpen = false;
      this.isGestionOpen = false;
      this.isReportesOpen = false;
    }
  }

  toggleReportes() {
    this.isReportesOpen = !this.isReportesOpen;
    if (this.isReportesOpen) {
      this.isPracticasOpen = false;
      this.isGestionOpen = false;
      this.isSetupOpen = false;
    }
  }

  navigateAndClose(route: string) {
    this.router.navigate([route]);
    if (this.isMobile && this.mobileVisible) {
      this.mobileVisible = false;
    }
  }

  toggleMobileVisibility() {
    this.mobileVisible = !this.mobileVisible;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}