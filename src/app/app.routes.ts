import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/layouts/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { EmpresaComponent } from './pages/gestion_practicas/empresa/empresa.component';
import { SolicitudComponent } from './pages/solicitud/solicitud.component';
import { CartaPresentacionComponent } from './pages/mis_practicas/carta-presentacion/carta-presentacion.component';
import { GestionPracticasComponent } from './pages/gestion_practicas/gestion-cartas/gestion-cartas.component';
import { RoleGuard } from './core/security/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      { 
        path: 'home', 
        component: HomeComponent 
      },
      {
        path: 'empresa',
        component: EmpresaComponent,
        canActivate: [RoleGuard],
        data: {
          requiredRole: ['admin', 'reviewer', 'student']
        }
      },
      {
        path: 'solicitudes',
        component: SolicitudComponent,
        canActivate: [RoleGuard],
        data: {
          requiredRole: ['admin', 'reviewer']
        }
      },
      {
        path: 'carta-presentacion',
        component: CartaPresentacionComponent,
        canActivate: [RoleGuard],
        data: {
          requiredRole: ['admin', 'reviewer', 'student']
        }
      },
      {
        path: 'gestion-practicas',
        component: GestionPracticasComponent,
        canActivate: [RoleGuard],
        data: {
          requiredRole: ['admin', 'reviewer']
        }
      }
    ]
  }
];