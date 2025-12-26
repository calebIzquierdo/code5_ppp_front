import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GestionPracticasService, CartaPracticante, CartaDetalle, Campus, Facultad, ProgramaEstudio, Semestre, CartaFiltrada } from '../../../core/services/gestion-cartas/gestion-cartas.service';

// Interfaz para los elementos de paginación
interface ElementoPaginacion {
  tipo: 'numero' | 'puntos';
  numero?: number;
}

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

  // Función para mapear códigos de estado a texto descriptivo
  obtenerEstadoTexto(estado: string | number): string {
    const estadoStr = String(estado);
    switch (estadoStr) {
      case '0':
        return 'RECHAZADO';
      case '1':
        return 'PENDIENTE';
      case '2':
        return 'APROBADO';
      default:
        return estadoStr.toUpperCase();
    }
  }
  
  // Propiedades de filtros
  filtroCampus: string = '';
  filtroFacultad: string = '';
  filtroEscuela: string = '';
  filtroSemestre: string = '';
  filtroTipoPractica: string = '';
  filtroEstado: string = '';
  textoBusqueda: string = '';

  // Datos para los filtros
  campusDisponibles: Campus[] = [];
  facultadesDisponibles: Facultad[] = [];
  escuelasDisponibles: ProgramaEstudio[] = [];
  semestresDisponibles: Semestre[] = [];

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

  // Datos de cartas filtradas desde la API
  cartasFiltradasAPI: CartaFiltrada[] = [];
  cartasFiltradasPaginadas: CartaFiltrada[] = [];

  // Propiedades para el flujo de vistas con signals
  cartaSeleccionada = signal<CartaDetalle | null>(null);
  pasoActual = signal<number>(1);
  cartaAprobada = signal<boolean>(false);
  loadingDetalle: boolean = false;

  constructor(private gestionPracticasService: GestionPracticasService) {}

  ngOnInit() {
    this.cargarDatos();
    this.cargarFiltros();
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
        console.error('✗ Error al cargar alumnos con cartas:', error);
        // Solo limpiar datos sin mostrar error, ya que el filtrado funciona independientemente
        this.cartas = [];
        this.aplicarFiltrosYPaginacion();
        this.loading = false;
        // No establecemos this.error para evitar mostrar mensaje de error innecesario
      }
    });
  }

  cargarFiltros(): void {
    // Solo cargar campus y semestres al inicio
    this.cargarCampus();
    this.cargarSemestres();
  }

  verificarEstadoFiltros(): void {
    // Método para verificación opcional de estado
  }

  cargarCampus(): void {
    console.log('🔄 Iniciando carga de campus...');
    this.gestionPracticasService.getCampus().subscribe({
      next: (campus) => {
        console.log('✓ Campus cargados exitosamente:', campus);
        console.log('📊 Cantidad de campus:', campus.length);
        this.campusDisponibles = campus;
        console.log('📋 Array campusDisponibles:', this.campusDisponibles);
      },
      error: (error) => {
        console.error('❌ Error al cargar campus:', error);
        console.error('🔍 Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message
        });
      }
    });
  }

  cargarSemestres(): void {
    this.gestionPracticasService.getSemestres().subscribe({
      next: (semestres) => {
        this.semestresDisponibles = semestres;
      },
      error: (error) => {
        console.error('❌ Error al cargar semestres:', error);
      }
    });
  }

  // Método para testing manual desde la consola del navegador
  testFacultadesCarga(campusId: number): void {
    console.log('🧪 TEST: Probando carga manual de facultades para campus:', campusId);
    this.cargarFacultadesPorCampus(campusId);
  }

  // Método para verificar si el problema es el endpoint o el mapeo
  testEndpointDirecto(campusId: number): void {
    console.log('🧪 TEST: Probando endpoint directo para campus:', campusId);
    const url = `http://localhost:5017/api/gestion/filtros/facultades/${campusId}`;
    console.log('🔗 URL que se va a probar:', url);
    
    fetch(url)
      .then(response => {
        console.log('📡 Respuesta HTTP:', response.status, response.statusText);
        return response.json();
      })
      .then(data => {
        console.log('📦 Datos recibidos directamente:', data);
      })
      .catch(error => {
        console.error('❌ Error en fetch directo:', error);
      });
  }

  // Método que se ejecuta cuando se selecciona un campus
  onCampusChange(): void {
    // Limpiar facultades y escuelas cuando cambia el campus
    this.facultadesDisponibles = [];
    this.escuelasDisponibles = [];
    this.filtroFacultad = '';
    this.filtroEscuela = '';

    if (this.filtroCampus && this.filtroCampus !== '') {
      const campusId = +this.filtroCampus;
      if (!isNaN(campusId) && campusId > 0) {
        this.cargarFacultadesPorCampus(campusId);
        // También aplicar filtros de cartas al cambiar campus
        this.aplicarFiltroCartas();
      }
    } else {
      // Si no hay campus seleccionado, limpiar las cartas filtradas
      this.aplicarFiltroCartas();
    }
  }

  cargarFacultadesPorCampus(idCampus: number): void {
    this.gestionPracticasService.getFacultadesPorCampus(idCampus).subscribe({
      next: (facultades) => {
        this.facultadesDisponibles = facultades;
      },
      error: (error) => {
        console.error('❌ Error al cargar facultades para campus', idCampus, ':', error);
      }
    });
  }

  // Método que se ejecuta cuando se selecciona una facultad
  onFacultadChange(): void {
    // Limpiar escuelas cuando cambia la facultad
    this.escuelasDisponibles = [];
    this.filtroEscuela = '';

    if (this.filtroCampus && this.filtroFacultad) {
      this.cargarEscuelasPorCampusYFacultad(+this.filtroCampus, +this.filtroFacultad);
    } else {
      // Si cambia la facultad pero no hay campus, aplicar filtros disponibles
      this.aplicarFiltroCartas();
    }
  }

  cargarEscuelasPorCampusYFacultad(idCampus: number, idFacultad: number): void {
    this.gestionPracticasService.getProgramasPorCampusYFacultad(idCampus, idFacultad).subscribe({
      next: (programas) => {
        this.escuelasDisponibles = programas;
        
        // Después de cargar programas, aplicar filtros a la tabla
        this.aplicarFiltroCartas();
      },
      error: (error) => {
        console.error('❌ Error al cargar programas para campus', idCampus, 'y facultad', idFacultad, ':', error);
      }
    });
  }

  aplicarFiltroCartas(): void {
    const campusId = this.filtroCampus ? +this.filtroCampus : undefined;
    const facultadId = this.filtroFacultad ? +this.filtroFacultad : undefined;
    const programaId = this.filtroEscuela ? +this.filtroEscuela : undefined;

    // Solo hacer el llamado si al menos hay un filtro seleccionado
    if (campusId || facultadId || programaId) {
      this.loading = true;
      
      this.gestionPracticasService.getCartasFiltradas(campusId, facultadId, programaId).subscribe({
        next: (cartasFiltradasAPI) => {
          this.cartasFiltradasAPI = cartasFiltradasAPI;
          this.aplicarPaginacionCartasFiltradas();
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error al obtener cartas filtradas:', error);
          this.cartasFiltradasAPI = [];
          this.aplicarPaginacionCartasFiltradas();
          this.loading = false;
        }
      });
    } else {
      // Si no hay filtros, limpiar las cartas filtradas
      this.cartasFiltradasAPI = [];
      this.aplicarPaginacionCartasFiltradas();
    }
  }

  aplicarPaginacionCartasFiltradas(): void {
    // Calcular paginación para cartas filtradas
    this.totalPaginas = Math.ceil(this.cartasFiltradasAPI.length / this.itemsPorPagina);
    
    // Ajustar página actual si es necesario
    if (this.paginaActual >= this.totalPaginas) {
      this.paginaActual = Math.max(0, this.totalPaginas - 1);
    }

    // Obtener elementos para la página actual
    const inicio = this.paginaActual * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.cartasFiltradasPaginadas = this.cartasFiltradasAPI.slice(inicio, fin);
  }

  // Método que se ejecuta cuando se selecciona un programa/escuela
  onEscuelaChange(): void {
    // Aplicar filtros cada vez que cambie la escuela
    this.aplicarFiltroCartas();
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

  getPaginasConPuntos(): ElementoPaginacion[] {
    const elementos: ElementoPaginacion[] = [];
    
    if (this.totalPaginas <= 7) {
      // Si hay 7 páginas o menos, mostrar todas
      for (let i = 1; i <= this.totalPaginas; i++) {
        elementos.push({ tipo: 'numero', numero: i });
      }
    } else {
      // Lógica compleja para puntos suspensivos
      const paginaActualDisplay = this.paginaActual + 1;
      
      // Siempre mostrar la primera página
      elementos.push({ tipo: 'numero', numero: 1 });
      
      // Determinar si necesitamos puntos al principio
      if (paginaActualDisplay > 4) {
        elementos.push({ tipo: 'puntos' });
      }
      
      // Páginas alrededor de la página actual
      const inicio = Math.max(2, paginaActualDisplay - 1);
      const fin = Math.min(this.totalPaginas - 1, paginaActualDisplay + 1);
      
      for (let i = inicio; i <= fin; i++) {
        if (i !== 1 && i !== this.totalPaginas) {
          elementos.push({ tipo: 'numero', numero: i });
        }
      }
      
      // Determinar si necesitamos puntos al final
      if (paginaActualDisplay < this.totalPaginas - 3) {
        elementos.push({ tipo: 'puntos' });
      }
      
      // Siempre mostrar la última página (si hay más de 1 página)
      if (this.totalPaginas > 1) {
        elementos.push({ tipo: 'numero', numero: this.totalPaginas });
      }
    }
    
    return elementos;
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

  // Métodos del flujo de vistas
  verDetalleCarta(carta: CartaPracticante): void {
    console.log('Intentando obtener detalles para carta:', carta);
    this.loadingDetalle = true;
    this.pasoActual.set(1);
    this.cartaAprobada.set(false); // Resetear estado de aprobación
    
    this.gestionPracticasService.getDetallesCarta(carta.id).subscribe({
      next: (detalles) => {
        console.log('✓ Detalles obtenidos de la API:', detalles);
        this.cartaSeleccionada.set(detalles);
        this.loadingDetalle = false;
      },
      error: (error) => {
        console.error('✗ Error al cargar detalles de la carta:', error);
        console.log('→ Usando datos de fallback para carta:', carta);
        this.loadingDetalle = false;
        // En caso de error, usar datos básicos como fallback
        this.cartaSeleccionada.set(this.mapearCartaDetalle(carta));
      }
    });
  }

  verDetalleCartaFiltrada(carta: CartaFiltrada): void {
    console.log('Intentando obtener detalles para carta filtrada:', carta);
    this.loadingDetalle = true;
    this.pasoActual.set(1);
    this.cartaAprobada.set(false); // Resetear estado de aprobación
    
    // Usar el id_formato para obtener los detalles
    this.gestionPracticasService.getDetallesCarta(carta.id_formato).subscribe({
      next: (detalles) => {
        console.log('✓ Detalles obtenidos de la API para carta filtrada:', detalles);
        this.cartaSeleccionada.set(detalles);
        this.loadingDetalle = false;
      },
      error: (error) => {
        console.error('✗ Error al cargar detalles de la carta filtrada:', error);
        console.log('→ Usando datos de fallback para carta filtrada:', carta);
        this.loadingDetalle = false;
        // En caso de error, mapear los datos de la carta filtrada
        this.cartaSeleccionada.set(this.mapearCartaFiltradaADetalle(carta));
      }
    });
  }

  volverALista(): void {
    // Actualizar signals para volver a vista de lista
    this.cartaSeleccionada.set(null);
    this.pasoActual.set(1);
    this.loadingDetalle = false;
  }

  siguientePaso(): void {
    if (this.pasoActual() < 4) {
      this.pasoActual.set(this.pasoActual() + 1);
      // Pequeño delay para permitir que el DOM se actualice antes del scroll
      setTimeout(() => {
        this.scrollAlPaso();
      }, 100);
    }
  }

  anteriorPaso(): void {
    if (this.pasoActual() > 1) {
      this.pasoActual.set(this.pasoActual() - 1);
      // Pequeño delay para permitir que el DOM se actualice antes del scroll
      setTimeout(() => {
        this.scrollAlPaso();
      }, 100);
    }
  }

  irAPaso(paso: number): void {
    if (paso >= 1 && paso <= 4) {
      this.pasoActual.set(paso);
      // Pequeño delay para permitir que el DOM se actualice antes del scroll
      setTimeout(() => {
        this.scrollAlPaso();
      }, 100);
    }
  }

  private scrollAlPaso(): void {
    // Scroll suave al contenedor del paso actual
    const pasoElement = document.querySelector('.paso-container');
    if (pasoElement) {
      pasoElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }

  private mapearCartaDetalle(carta: CartaPracticante): CartaDetalle {
    return {
      id: carta.id,
      nombrePracticante: carta.nombrePracticante,
      codigo: carta.codigo,
      escuelaProfesional: carta.escuelaProfesional,
      estado: carta.estado,
      
      // Campos del formulario de prácticas (fallback)
      areaPractica: 'Desarrollo de Software',
      empresa: 'Tech Solutions SAC', 
      gradoAcademico: 'Licenciatura en Administración',
      representanteLegal: 'María González López',
      horas: 480,
      nuevaEmpresa: 'Tech Solutions SAC',
      cargoResponsable: 'Gerente de Recursos Humanos',
      procedenciaEmpresa: 'Lima, Perú',
      contacto: 'maria.gonzalez@techsolutions.com',
      fechaInicio: '01/08/2024',
      fechaFin: '20/12/2024',
      evaluacionCapsi: 'Fotos_2023.doc',
      
      // Datos complementarios
      sede: 'UPEU Lima',
      facultad: 'Facultad de Ingeniería y Arquitectura', 
      escuela: carta.escuelaProfesional,
      programa: '2024-2',
      cicloAcademico: 'Ciclo 2024-II',
      tipoAprendizaje: 'Prácticas Pre Profesionales',
      horasSemanales: 40,
      supervisor: 'Por asignar',
      correoSupervisor: 'supervisor@empresa.com',
      
      // Estados de pasos basados en el estado real
      paso01Completado: true,
      paso02Completado: carta.estado === 'REVISIÓN' || carta.estado === 'ENVIADO',
      paso03Completado: carta.estado === 'ENVIADO'
    };
  }

  private mapearCartaFiltradaADetalle(carta: CartaFiltrada): CartaDetalle {
    return {
      id: carta.id_formato,
      nombrePracticante: carta.alumno_completo,
      codigo: carta.codigo_alumno,
      escuelaProfesional: carta.programa_nombre,
      estado: carta.estado_nombre,
      
      // Campos del formulario de prácticas usando datos reales de la API
      areaPractica: 'Desarrollo de Software', // Este campo no viene en la API
      empresa: carta.nombre_empresa,
      gradoAcademico: carta.grado_academico,
      representanteLegal: carta.representante_legal,
      horas: parseInt(carta.horas) || 0,
      nuevaEmpresa: carta.nombre_empresa,
      cargoResponsable: carta.cargo_responsable,
      procedenciaEmpresa: carta.procedencia_empresa,
      contacto: carta.contacto,
      fechaInicio: carta.fecha_inicio,
      fechaFin: carta.fecha_fin,
      evaluacionCapsi: carta.evaluacion_capsi,
      
      // Datos complementarios
      sede: carta.campus_nombre,
      facultad: carta.facultad_nombre,
      escuela: carta.programa_nombre,
      programa: carta.programa_abreviatura,
      cicloAcademico: carta.periodo_academico,
      tipoAprendizaje: 'Prácticas Pre Profesionales',
      horasSemanales: 40,
      supervisor: 'Por asignar',
      correoSupervisor: 'supervisor@empresa.com',
      
      // Estados de pasos basados en el estado real
      paso01Completado: true,
      paso02Completado: carta.estado_nombre === 'REVISIÓN' || carta.estado_nombre === 'ENVIADO' || carta.estado === '1',
      paso03Completado: carta.estado_nombre === 'ENVIADO' || carta.estado === '1'
    };
  }

  // Métodos de acciones de la carta
  rechazarCarta(): void {
    const carta = this.cartaSeleccionada();
    if (carta) {
      console.log('Rechazando carta:', carta.codigo);
      // Aquí iría la lógica para rechazar la carta
      
      // Volver a la lista
      this.volverALista();
      // Actualizar la lista
      this.cargarDatos();
    }
  }

  aprobarCarta(): void {
    const carta = this.cartaSeleccionada();
    if (carta) {
      console.log('Aprobando carta:', carta.codigo);
      // Cambiar el estado a aprobado
      this.cartaAprobada.set(true);
      // Aquí iría la lógica para aprobar la carta en el backend
    }
  }

  siguienteAprobacion(): void {
    // Cambiar al paso 2 para mostrar la previsualización de la carta
    this.pasoActual.set(2);
    console.log('Cambiando a paso 2 - Previsualización de la carta');
  }

  confirmarContinuar(): void {
    // Lógica para confirmar y continuar con la presentación
    this.siguientePaso();
  }

  descargarEnviar(): void {
    const carta = this.cartaSeleccionada();
    if (carta) {
      console.log('Descargando y enviando carta:', carta.codigo);
      // Aquí iría la lógica para descargar/enviar
      
      // Mostrar un mensaje de éxito y volver a la lista después de un momento
      setTimeout(() => {
        // Volver a la lista
        this.volverALista();
        this.cargarDatos();
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    // Componente limpio, no necesita cleanup especial
  }
}
