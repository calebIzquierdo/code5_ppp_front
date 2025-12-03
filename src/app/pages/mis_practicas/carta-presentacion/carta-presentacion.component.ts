import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartaPresentacionService, CartaSolicitud } from '../../../core/services/carta-presentacion.service';
import { HasPermissionDirective, HasRoleDirective } from '../../../core/security/directives/permission.directive';

export interface CartaPresentacion {
  id: number;
  nombreEmpresa: string;
  representanteLegal: string;
  contacto: string;
  estado: 'Aprobado' | 'Revisión' | 'Rechazado';
  fechaCreacion: Date;
  gradoAcademico?: string;
  cargoResponsable?: string;
  procedenciaEmpresa?: string;
  horas?: string;
}

@Component({
  selector: 'app-carta-presentacion',
  standalone: true,
  imports: [CommonModule, FormsModule, HasPermissionDirective, HasRoleDirective],
  templateUrl: './carta-presentacion.component.html',
  styleUrl: './carta-presentacion.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CartaPresentacionComponent implements OnInit {
  // Hacer Math disponible en el template
  Math = Math;
  
  // Estados de carga
  loading = false;
  error: string | null = null;
  
  // Propiedades de filtros
  filtroCampus: string = '';
  filtroEscuela: string = '';
  filtroSemestre: string = '2025-2';
  filtroEstado: string = '';
  textoBusqueda: string = '';

  // Propiedades de tabs
  tabActiva: 'solicitudes' | 'cartas' = 'cartas';

  // Propiedades de paginación
  paginaActual: number = 0;
  itemsPorPagina: number = 10;
  totalPaginas: number = 0;

  // Datos originales de la API
  cartasSolicitudFromApi: CartaSolicitud[] = [];

  // Datos de cartas
  cartas: CartaPresentacion[] = [];

  // Arrays calculados
  cartasFiltradas: CartaPresentacion[] = [];
  cartasPaginadas: CartaPresentacion[] = [];

  // Propiedades para el modal
  mostrarModal: boolean = false;
  solicitud = {
    empresa: '',
    nuevaEmpresa: '',
    gradoAcademico: '',
    cargoResponsable: '',
    representanteLegal: '',
    procedenciaEmpresa: '',
    horas: '',
    contacto: ''
  };

  constructor(private cartaPresentacionService: CartaPresentacionService) {}

  ngOnInit() {
    this.cargarCartasDesdeApi();
  }

  /**
   * Carga cartas desde la API
   */
  cargarCartasDesdeApi(): void {
    this.loading = true;
    this.error = null;

    this.cartaPresentacionService.getCartasSolicitud().subscribe({
      next: (cartasSolicitud) => {
        this.cartasSolicitudFromApi = cartasSolicitud || [];
        
        // Convertir datos de la API al formato interno
        this.cartas = this.convertirCartasSolicitudACartas(this.cartasSolicitudFromApi);
        
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Error desconocido al cargar cartas';
        this.loading = false;
        
        // Mantener arreglo vacío en caso de error
        this.cartas = [];
        this.aplicarFiltros();
      }
    });
  }

  /**
   * Convierte CartaSolicitud[] a CartaPresentacion[]
   */
  private convertirCartasSolicitudACartas(cartasSolicitud: CartaSolicitud[]): CartaPresentacion[] {
    if (!cartasSolicitud || !Array.isArray(cartasSolicitud)) {
      return [];
    }

    return cartasSolicitud.map((cartaSolicitud) => {
      const carta: CartaPresentacion = {
        id: cartaSolicitud.id_formato,
        nombreEmpresa: cartaSolicitud.nombre_empresa,
        representanteLegal: cartaSolicitud.representante_legal,
        contacto: cartaSolicitud.contacto,
        estado: this.cartaPresentacionService.mapearEstado(cartaSolicitud.estado),
        fechaCreacion: new Date(cartaSolicitud.fecha_emision),
        gradoAcademico: cartaSolicitud.grado_academico,
        cargoResponsable: cartaSolicitud.cargo_responsable,
        procedenciaEmpresa: cartaSolicitud.procedencia_empresa,
        horas: cartaSolicitud.horas
      };
      
      return carta;
    });
  }

  /**
   * Refresca los datos desde la API
   */
  refrescarDatos(): void {
    this.cargarCartasDesdeApi();
  }

  // Métodos de filtrado
  aplicarFiltros(): void {
    let cartasFiltradas = [...this.cartas];

    // Filtro por estado
    if (this.filtroEstado) {
      cartasFiltradas = cartasFiltradas.filter(carta => 
        carta.estado.toLowerCase() === this.filtroEstado.toLowerCase()
      );
    }

    // Filtro de búsqueda (usando el servicio si hay datos de la API)
    if (this.textoBusqueda) {
      if (this.cartasSolicitudFromApi.length > 0) {
        // Usar el filtro del servicio
        const cartasFiltered = this.cartaPresentacionService.filterCartas(this.textoBusqueda, this.cartasSolicitudFromApi);
        if (cartasFiltered.length > 0) {
          const idsFiltered = cartasFiltered.map(cs => cs.id_formato);
          cartasFiltradas = cartasFiltradas.filter(carta => 
            idsFiltered.includes(carta.id)
          );
        } else {
          cartasFiltradas = [];
        }
      } else {
        // Fallback: filtrar localmente
        cartasFiltradas = cartasFiltradas.filter(carta =>
          carta.nombreEmpresa.toLowerCase().includes(this.textoBusqueda.toLowerCase()) ||
          carta.representanteLegal.toLowerCase().includes(this.textoBusqueda.toLowerCase()) ||
          carta.contacto.includes(this.textoBusqueda)
        );
      }
    }

    this.cartasFiltradas = cartasFiltradas;
    this.calcularPaginacion();
    this.actualizarPaginaActual();
  }

  // Métodos de paginación
  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.cartasFiltradas.length / this.itemsPorPagina);
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

  paginaAnterior(): void {
    this.irAPagina(this.paginaActual - 1);
  }

  paginaSiguiente(): void {
    this.irAPagina(this.paginaActual + 1);
  }

  getPaginas(): number[] {
    const paginas: number[] = [];
    const inicio = Math.max(1, this.paginaActual - 1);
    const fin = Math.min(this.totalPaginas, this.paginaActual + 3);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  // Métodos de utilidad
  formatNumber(num: number): string {
    return String(num).padStart(2, '0');
  }

  // Métodos de acciones
  solicitarCarta(): void {
    this.mostrarModal = true;
  }

  // Métodos del modal
  cerrarModal(): void {
    this.mostrarModal = false;
    this.limpiarFormulario();
  }

  // Manejar el scroll del modal
  private scrollTimeout: any;
  
  onModalScroll(event: Event): void {
    const element = event.target as HTMLElement;
    element.classList.add('scrolling');
    
    // Limpiar timeout previo
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    // Ocultar scrollbar después de 1 segundo de inactividad
    this.scrollTimeout = setTimeout(() => {
      element.classList.remove('scrolling');
    }, 1000);
  }

  enviarSolicitud(): void {
    console.log('Enviando solicitud:', this.solicitud);
    // Aquí iría la lógica para enviar la solicitud
    this.cerrarModal();
  }

  limpiarFormulario(): void {
    this.solicitud = {
      empresa: '',
      nuevaEmpresa: '',
      gradoAcademico: '',
      cargoResponsable: '',
      representanteLegal: '',
      procedenciaEmpresa: '',
      horas: '',
      contacto: ''
    };
  }

  actualizar(): void {
    this.refrescarDatos();
  }

  cambiarTab(tab: 'solicitudes' | 'cartas'): void {
    this.tabActiva = tab;
  }

  ordenarTabla(): void {
    this.cartasFiltradas.sort((a, b) => a.nombreEmpresa.localeCompare(b.nombreEmpresa));
    this.actualizarPaginaActual();
  }
}
