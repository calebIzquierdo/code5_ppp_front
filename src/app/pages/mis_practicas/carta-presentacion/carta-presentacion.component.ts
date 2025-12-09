import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  CartaPresentacion,
  FiltrosDisponibles,
  AlumnoDefaults,
  AlumnoInfo,
  Empresa
} from '../../../core/interfaces/carta-presentacion/carta-presentacion.interface';
import { CartaPresentacionService } from '../../../core/services/carta-presentacion/carta-presentacion.service';
import { HasPermissionDirective, HasRoleDirective } from '../../../core/security/directives/permission.directive';
import { CartaFiltersComponent } from './components/carta-filters/carta-filters.component';
import { CartaListComponent } from './components/carta-list/carta-list.component';
import { CartaFormModalComponent } from './components/carta-form-modal/carta-form-modal.component';

@Component({
  selector: 'app-carta-presentacion',
  standalone: true,
  imports: [
    CommonModule,
    HasPermissionDirective,
    HasRoleDirective,
    CartaFiltersComponent,
    CartaListComponent,
    CartaFormModalComponent
  ],
  templateUrl: './carta-presentacion.component.html',
  styleUrl: './carta-presentacion.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CartaPresentacionComponent implements OnInit {
  idAlumno = 1131;
  loading = false;
  error: string | null = null;
  alumnoDefaults: AlumnoDefaults | null = null;
  alumnoInfo: AlumnoInfo | null = null;
  filtroCampus: number | null = null;
  filtroEscuela: number | null = null;
  // filtroSemestre: number | null = null;
  filtroEstado: number | null = null;
  textoBusqueda = '';
  filtrosDisponibles: FiltrosDisponibles = {
    programas: [],
    campus: [],
    estados: [],
    // semestres: []
  };
  paginaActual = 0;
  itemsPorPagina = 10;
  totalPaginas = 0;
  cartas: CartaPresentacion[] = [];
  cartasFiltradas: CartaPresentacion[] = [];
  cartasPaginadas: CartaPresentacion[] = [];
  mostrarModal = false;
  empresas: Empresa[] = [];
  cargandoEmpresas = false;
  ordenAscendente = true;
  toastExito = false;

  constructor(private cartaPresentacionService: CartaPresentacionService) { }

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.cargarEmpresas();
  }

  cargarDatosIniciales(): void {
    this.loading = true;
    forkJoin({
      alumnoInfo: this.cartaPresentacionService.getAlumnoInfo(this.idAlumno),
      defaults: this.cartaPresentacionService.getAlumnoDefaults(this.idAlumno),
      filtros: this.cartaPresentacionService.getFiltros(this.idAlumno)
    }).subscribe({
      next: (result) => {
        this.alumnoInfo = result.alumnoInfo;
        this.alumnoDefaults = result.defaults;
        this.filtroCampus = result.defaults.id_campus;
        this.filtroEscuela = result.defaults.id_programa_estudio;
        this.filtrosDisponibles = result.filtros;

        // if (result.filtros.semestres.length > 0) {
        //   this.filtroSemestre = result.filtros.semestres[0].id_semestre;
        // }

        this.cargarCartas();
      },
      error: (err) => {
        console.error('Error al cargar datos iniciales:', err);
        this.error = 'Error al cargar información inicial';
        this.loading = false;
      }
    });
  }

  cargarEmpresas(): void {
    this.cargandoEmpresas = true;
    this.cartaPresentacionService.getEmpresas().subscribe({
      next: (empresas) => {
        this.empresas = empresas;
        this.cargandoEmpresas = false;
      },
      error: (error) => {
        console.error('Error al cargar empresas:', error);
        this.cargandoEmpresas = false;
      }
    });
  }

  cargarCartas(): void {
    this.loading = true;
    this.error = null;
    const filtros = {
      estado: this.filtroEstado ?? undefined,
      id_campus: this.filtroCampus ?? undefined,
      id_programa_estudio: this.filtroEscuela ?? undefined
    };

    this.cartaPresentacionService.getCartas(this.idAlumno, filtros).subscribe({
      next: (cartas) => {
        this.cartas = cartas.map(carta => ({
          ...carta,
          estado_nombre: this.cartaPresentacionService.mapearEstadoNombre(carta.estado)
        }));
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar cartas:', err);
        this.error = err.message || 'Error al cargar cartas';
        this.loading = false;
        this.cartas = [];
        this.aplicarFiltros();
      }
    });
  }

  onFiltrosChange(filtros: any): void {
    this.filtroCampus = filtros.campus;
    this.filtroEscuela = filtros.escuela;
    // this.filtroSemestre = filtros.semestre;
    this.cargarCartas();
  }

  onEstadoChange(estado: number | null): void {
    this.filtroEstado = estado;
    this.cargarCartas();
  }

  onBuscar(texto: string): void {
    this.textoBusqueda = texto;
    this.aplicarFiltros();
  }

  onOrdenar(): void {
    this.ordenAscendente = !this.ordenAscendente;
    this.cartasFiltradas.sort((a, b) => {
      const comp = a.nombre_empresa.localeCompare(b.nombre_empresa, 'es', { sensitivity: 'base' });
      return this.ordenAscendente ? comp : -comp;
    });
    this.actualizarPaginaActual();
  }

  onCambiarPagina(pagina: number): void {
    this.irAPagina(pagina);
  }

  onCambiarItemsPorPagina(items: number): void {
    this.itemsPorPagina = items;
    this.cambiarItemsPorPagina();
  }

  onVerDetalle(event: { id: number; carta: CartaPresentacion }): void {
    console.log('Ver detalle (padre):', event.id, event.carta);
  }

  aplicarFiltros(): void {
    let cartasFiltradas = [...this.cartas];
    if (this.textoBusqueda.trim()) {
      const term = this.textoBusqueda.toLowerCase();
      cartasFiltradas = cartasFiltradas.filter(carta =>
        carta.nombre_empresa.toLowerCase().includes(term) ||
        (carta.representante_legal && carta.representante_legal.toLowerCase().includes(term)) ||
        (carta.contacto && carta.contacto.includes(term)) ||
        carta.id_formato.toString().includes(term)
      );
    }
    this.cartasFiltradas = cartasFiltradas;
    this.calcularPaginacion();
    this.actualizarPaginaActual();
  }

  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.cartasFiltradas.length / this.itemsPorPagina);
    if (this.paginaActual >= this.totalPaginas && this.totalPaginas > 0) {
      this.paginaActual = this.totalPaginas - 1;
    }
  }

  actualizarPaginaActual(): void {
    const inicio = this.paginaActual * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.cartasPaginadas = this.cartasFiltradas.slice(inicio, fin);
  }

  cambiarItemsPorPagina(): void {
    this.paginaActual = 0;
    this.calcularPaginacion();
    this.actualizarPaginaActual();
  }

  irAPagina(pagina: number): void {
    if (pagina >= 0 && pagina < this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginaActual();
    }
  }

  abrirModal(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  onCartaCreada(): void {
    this.cerrarModal();
    this.cargarCartas();
    this.toastExito = true;
    setTimeout(() => {
      this.toastExito = false;
    }, 2000);
  }

  reintentar(): void {
    this.cargarDatosIniciales();
  }
}