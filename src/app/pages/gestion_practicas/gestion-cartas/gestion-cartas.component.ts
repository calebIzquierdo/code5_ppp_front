import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GestionPracticasService, CartaPracticante } from '../../../core/services/gestion-cartas.service';

@Component({
  selector: 'app-gestion-cartas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-cartas.component.html',
  styleUrl: './gestion-cartas.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GestionPracticasComponent implements OnInit {
  // Hacer Math disponible en el template
  Math = Math;
  
  // Estados de carga
  loading = false;
  error: string | null = null;
  
  // Propiedades de filtros
  filtroCampus: string = '';
  filtroFacultad: string = '';
  filtroEscuela: string = '';
  filtroPrograma: string = '';
  filtroSemestre: string = '';
  filtroTipoPractica: string = '';
  filtroEstado: string = '';
  textoBusqueda: string = '';

  // Propiedades de tabs
  tabActiva: 'cartas' = 'cartas';

  // Propiedades de paginación
  paginaActual: number = 0;
  itemsPorPagina: number = 10;
  totalPaginas: number = 0;

  // Datos de cartas de practicantes
  cartas: CartaPracticante[] = [];
  cartasFiltradas: CartaPracticante[] = [];
  cartasPaginadas: CartaPracticante[] = [];

  constructor(private gestionPracticasService: GestionPracticasService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = null;

    this.gestionPracticasService.getAlumnosConCartas().subscribe({
      next: (cartas) => {
        this.cartas = cartas;
        this.aplicarFiltrosYPaginacion();
        this.loading = false;
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
        console.error('Error al cargar alumnos con cartas:', error);
      }
    });
  }

  aplicarFiltros(): void {
    this.cargarDatos();
  }

  aplicarFiltrosYPaginacion(): void {
    // Aplicar filtros de búsqueda
    this.cartasFiltradas = this.cartas.filter(carta => {
      const coincideTexto = !this.textoBusqueda || 
        carta.codigo.toLowerCase().includes(this.textoBusqueda.toLowerCase()) ||
        carta.nombrePracticante.toLowerCase().includes(this.textoBusqueda.toLowerCase()) ||
        carta.escuelaProfesional.toLowerCase().includes(this.textoBusqueda.toLowerCase());
      
      const coincideEstado = !this.filtroEstado || 
        carta.estado.toLowerCase() === this.filtroEstado.toLowerCase();

      return coincideTexto && coincideEstado;
    });

    // Calcular paginación
    this.totalPaginas = Math.ceil(this.cartasFiltradas.length / this.itemsPorPagina);
    
    // Ajustar página actual si es necesario
    if (this.paginaActual >= this.totalPaginas) {
      this.paginaActual = Math.max(0, this.totalPaginas - 1);
    }

    // Aplicar paginación
    const inicio = this.paginaActual * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.cartasPaginadas = this.cartasFiltradas.slice(inicio, fin);
  }

  // Métodos de paginación
  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.cartasFiltradas.length / this.itemsPorPagina);
    if (this.paginaActual >= this.totalPaginas) {
      this.paginaActual = 0;
    }
  }

  actualizarPaginaActual(): void {
    const inicio = this.paginaActual * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.cartasPaginadas = this.cartasFiltradas.slice(inicio, fin);
  }

  getPaginas(): number[] {
    const paginas: number[] = [];
    const maxPaginas = 5;
    const inicio = Math.max(1, this.paginaActual + 1 - Math.floor(maxPaginas / 2));
    const fin = Math.min(this.totalPaginas, inicio + maxPaginas - 1);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  irAPagina(pagina: number): void {
    if (pagina >= 0 && pagina < this.totalPaginas) {
      this.paginaActual = pagina;
      this.aplicarFiltrosYPaginacion();
    }
  }

  paginaAnterior(): void {
    if (this.paginaActual > 0) {
      this.paginaActual--;
      this.aplicarFiltrosYPaginacion();
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas - 1) {
      this.paginaActual++;
      this.aplicarFiltrosYPaginacion();
    }
  }

  cambiarItemsPorPagina(): void {
    this.paginaActual = 0;
    this.aplicarFiltrosYPaginacion();
  }

  // Métodos de tabs
  cambiarTab(tab: 'cartas'): void {
    this.tabActiva = tab;
  }

  // Métodos de utilidad
  formatNumber(num: number): string {
    return String(num).padStart(2, '0');
  }

  ordenarTabla(): void {
    this.cartasFiltradas.sort((a, b) => 
      a.nombrePracticante.localeCompare(b.nombrePracticante)
    );
    this.aplicarFiltrosYPaginacion();
  }

  // Métodos de acciones
  actualizar(): void {
    this.cargarDatos();
  }

  // Métodos de filtros reactivos
  ngDoCheck(): void {
    // Aplicar filtros cuando cambien los valores de búsqueda
    if (this.cartas.length > 0) {
      this.aplicarFiltrosYPaginacion();
    }
  }
}
