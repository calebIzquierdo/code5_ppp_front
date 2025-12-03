import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmpresaService, LegalPerson } from '../../../core/services/empresa/empresa.service';

export interface Empresa {
  id: number;
  nombre: string;
  ruc: string;
  encargado: string;
  telefono: string;
  email: string;
  estado: 'Activa' | 'Inactiva' | 'Pendiente';
  practicantes: number;
  fechaRegistro: Date;
}

@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empresa.component.html',
  styleUrl: './empresa.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EmpresaComponent implements OnInit {
  // Hacer Math disponible en el template
  Math = Math;
  
  // Estados de carga
  loading = false;
  error: string | null = null;
  
  // Propiedades de filtros
  filtroRuc: string = '';
  filtroSemestre: string = '2025-2';
  filtroEstado: string = '';
  textoBusqueda: string = '';

  // Propiedades de tabs
  tabActiva: 'solicitudes' | 'cartas' = 'solicitudes';

  // Propiedades de paginación
  paginaActual: number = 0;
  itemsPorPagina: number = 10;
  totalPaginas: number = 0;

  // Datos de empresas
  empresas: Empresa[] = [];

  // Lista filtrada y paginada
  empresasFiltradas: Empresa[] = [];
  empresasPaginadas: Empresa[] = [];
  
  // Datos originales de la API
  legalPersonsFromApi: LegalPerson[] = [];

  constructor(private empresaService: EmpresaService) {}

  ngOnInit() {
    this.cargarEmpresasDesdeApi();
  }

  /**
   * Carga empresas desde la API
   */
  cargarEmpresasDesdeApi(): void {
    this.loading = true;
    this.error = null;

    this.empresaService.getLegalPersons().subscribe({
      next: (legalPersons) => {
        this.legalPersonsFromApi = legalPersons || [];
        
        // Convertir datos de la API al formato interno
        this.empresas = this.convertirLegalPersonsAEmpresas(this.legalPersonsFromApi);
        
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Error desconocido al cargar empresas';
        this.loading = false;
        
        // Usar datos mock como fallback
        this.aplicarFiltros();
      }
    });
  }

  /**
   * Convierte LegalPerson[] a Empresa[]
   */
  private convertirLegalPersonsAEmpresas(legalPersons: LegalPerson[]): Empresa[] {
    if (!legalPersons || !Array.isArray(legalPersons)) {
      return [];
    }

    return legalPersons.map((person, index) => {
      const empresa: Empresa = {
        id: person.id_empresa,
        nombre: person.razon_social,
        ruc: person.id_persona_juridica?.toString() || 'N/A',
        encargado: person.responsable || 'No especificado',
        telefono: person.telefono || 'No especificado',
        email: person.correo || 'No especificado',
        estado: this.mapearEstado(person.estado),
        practicantes: Math.floor(Math.random() * 20) + 1,
        fechaRegistro: new Date()
      };
      
      return empresa;
    });
  }

  /**
   * Mapea el estado de la API al formato interno
   */
  private mapearEstado(status: number): 'Activa' | 'Inactiva' | 'Pendiente' {
    switch (status) {
      case 1:
        return 'Activa';
      case 0:
        return 'Inactiva';
      default:
        return 'Pendiente';
    }
  }

  /**
   * Refresca los datos desde la API
   */
  refrescarDatos(): void {
    this.cargarEmpresasDesdeApi();
  }

  // Métodos de filtrado
  aplicarFiltros(): void {
    let empresasFiltradas = [...this.empresas];

    // Filtro por RUC
    if (this.filtroRuc) {
      empresasFiltradas = empresasFiltradas.filter(empresa => 
        empresa.ruc.includes(this.filtroRuc)
      );
    }

    // Filtro por estado
    if (this.filtroEstado) {
      empresasFiltradas = empresasFiltradas.filter(empresa => 
        empresa.estado.toLowerCase() === this.filtroEstado.toLowerCase()
      );
    }

    // Filtro de búsqueda (usando el servicio)
    if (this.textoBusqueda) {
      // Convertir empresas a formato LegalPerson para usar el filtro del servicio
      const legalPersonsFiltered = this.legalPersonsFromApi.length > 0 
        ? this.empresaService.filterCompanies(this.textoBusqueda, this.legalPersonsFromApi)
        : [];
      
      if (legalPersonsFiltered.length > 0) {
        const idsFiltered = legalPersonsFiltered.map(lp => lp.id_empresa);
        empresasFiltradas = empresasFiltradas.filter(empresa => 
          idsFiltered.includes(empresa.id)
        );
      } else {
        // Fallback: filtrar por nombre, RUC o encargado
        empresasFiltradas = empresasFiltradas.filter(empresa =>
          empresa.nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase()) ||
          empresa.ruc.includes(this.textoBusqueda) ||
          empresa.encargado.toLowerCase().includes(this.textoBusqueda.toLowerCase())
        );
      }
    }

    this.empresasFiltradas = empresasFiltradas;
    this.calcularPaginacion();
    this.actualizarPagina();
  }

  // Métodos de tabs
  cambiarTab(tab: 'solicitudes' | 'cartas'): void {
    this.tabActiva = tab;
  }

  // Métodos de paginación
  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.empresasFiltradas.length / this.itemsPorPagina);
    if (this.paginaActual >= this.totalPaginas) {
      this.paginaActual = 0;
    }
  }

  actualizarPagina(): void {
    const inicio = this.paginaActual * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.empresasPaginadas = this.empresasFiltradas.slice(inicio, fin);
  }

  getPaginaActual(): number {
    return this.paginaActual;
  }

  getPaginas(): number[] {
    const paginas: number[] = [];
    const maxPaginas = 5; // Mostrar máximo 5 números de página
    let inicio = Math.max(1, this.paginaActual + 1 - Math.floor(maxPaginas / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxPaginas - 1);
    
    if (fin - inicio < maxPaginas - 1) {
      inicio = Math.max(1, fin - maxPaginas + 1);
    }
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  irAPagina(pagina: number): void {
    if (pagina >= 0 && pagina < this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPagina();
    }
  }

  paginaAnterior(): void {
    this.irAPagina(this.paginaActual - 1);
  }

  paginaSiguiente(): void {
    this.irAPagina(this.paginaActual + 1);
  }

  // Métodos de acciones
  actualizarDatos(): void {
    console.log('Actualizando datos...');
    this.aplicarFiltros();
  }

  editarEmpresa(empresa: Empresa): void {
    console.log('Editar empresa:', empresa.nombre);
  }

  verEmpresa(empresa: Empresa): void {
    console.log('Ver empresa:', empresa.nombre);
  }

  eliminarEmpresa(empresa: Empresa): void {
    if (confirm(`¿Estás seguro de eliminar la empresa "${empresa.nombre}"?`)) {
      this.empresas = this.empresas.filter(e => e.id !== empresa.id);
      this.aplicarFiltros();
    }
  }

  generarInforme(): void {
    console.log('Generando informe...');
  }

  // Método para el estilo de badge de practicantes (colores variados como en tu imagen)
  getPracticantesBadgeClass(practicantes: number): string {
    // Distribución de colores basada en el ID o posición para variedad visual
    const empresa = this.empresas.find(e => e.practicantes === practicantes);
    const index = this.empresas.indexOf(empresa!);
    
    const colores = ['badge-pink', 'badge-green', 'badge-blue', 'badge-purple', 'badge-orange'];
    return colores[index % colores.length];
  }

  // Método para colores de botones desplegar
  getBadgeClass(index: number): string {
    const colores = ['blue'];
    return colores[index % colores.length];
  }

  // Método para cambiar items por página
  cambiarItemsPorPagina(): void {
    this.paginaActual = 0; // Resetear a la primera página
    this.calcularPaginacion();
  }
}
