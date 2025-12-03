import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-solicitud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitud.component.html',
  styleUrl: './solicitud.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SolicitudComponent implements OnInit {
  // Estados de carga
  loading = false;
  error: string | null = null;

  // Propiedades de filtros
  filtroEmpresa: string = '';
  filtroSemestre: string = '2025-2';

  // Propiedades de tabs (si necesitas)
  tabActiva: 'solicitudes' | 'cartas' = 'solicitudes';

  // Propiedades de paginación (si necesitas)
  paginaActual: number = 0;
  itemsPorPagina: number = 10;
  totalPaginas: number = 0;

  // Datos de solicitudes
  solicitudes: any[] = [];

  // Modal para crear carta
  mostrarModal: boolean = false;
  nuevaCarta = {
    facultad: 'FACULTAD DE INGENIERIA Y ARQUITECTURA',
    nombreanio: 'Año de la recuperación y consolidación de la economía Peruana',
    fecha: 'Morales, 07 de abril de 2025',
    numeroCarta: 'Carta N° 013-2025/UPeU-FIA-IS-PPP',
    destinatarioNombre: '',
    destinatarioCargo: '',
    destinatarioEmpresa: '',
    destinatarioCiudad: '',
    // Datos del estudiante
    estudianteNombre: 'Caleb Isai Izquierdo Jiménez',
    estudianteCodigo: '201720255',
    estudianteCiclo: 'VII',
    estudianteEscuela: 'Ingeniería de Sistemas',
    estudianteFacultad: 'Facultad de Ingeniería y Arquitectura',
    estudianteHoras: '700',
    // Contenido de la carta
    saludo: 'De mi especial consideración:',
    cuerpo1: 'Tengo el agrado de dirigirme a usted para hacerle llegar un cálido saludo, acompañado de éxitos en la tarea que desempeña.',
    cuerpo2: '',
    cuerpo3: 'Quedo muy agradecido por su gentil atención y por su apoyo que brinda a nuestros estudiantes en el logro de sus objetivos.',
    despedida: 'Cordialmente,',
    firmaNombre: 'Mg. Wilder Marlo Rimarachin',
    firmaCargo: 'Coordinador\nE.P. Ingeniería de Sistemas'
  };

  ngOnInit(): void {
    // Inicializar datos si es necesario
  }

  refrescarDatos() {
    this.loading = true;
    setTimeout(() => this.loading = false, 1000);
  }

  aplicarFiltros() {
    // Lógica para filtrar solicitudes
  }

  abrirModalCrearCarta() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.nuevaCarta = {
      facultad: 'FACULTAD DE INGENIERIA Y ARQUITECTURA',
      nombreanio: 'Año de la recuperación y consolidación de la economía Peruana',
      fecha: 'Morales, 07 de abril de 2025',
      numeroCarta: 'Carta N° 013-2025/UPeU-FIA-IS-PPP',
      destinatarioNombre: '',
      destinatarioCargo: '',
      destinatarioEmpresa: '',
      destinatarioCiudad: '',
      // Datos del estudiante
      estudianteNombre: 'Caleb Isai Izquierdo Jiménez',
      estudianteCodigo: '201720255',
      estudianteCiclo: 'VII',
      estudianteEscuela: 'Ingeniería de Sistemas',
      estudianteFacultad: 'Facultad de Ingeniería y Arquitectura',
      estudianteHoras: '700',
      // Contenido de la carta
      saludo: 'De mi especial consideración:',
      cuerpo1: 'Tengo el agrado de dirigirme a usted para hacerle llegar un cálido saludo, acompañado de éxitos en la tarea que desempeña.',
      cuerpo2: '',
      cuerpo3: 'Quedo muy agradecido por su gentil atención y por su apoyo que brinda a nuestros estudiantes en el logro de sus objetivos.',
      despedida: 'Cordialmente,',
      firmaNombre: 'Mg. Wilder Marlo Rimarachin',
      firmaCargo: 'Coordinador\nE.P. Ingeniería de Sistemas'
    };
  }

  get segundoParrafoGenerado(): string {
    return `Asimismo, presentarle al estudiante ${this.nuevaCarta.estudianteNombre} con código universitario N° ${this.nuevaCarta.estudianteCodigo}, del ${this.nuevaCarta.estudianteCiclo} ciclo de la Escuela Profesional de ${this.nuevaCarta.estudianteEscuela} de la ${this.nuevaCarta.estudianteFacultad}, quién precisa realizar sus prácticas preprofesionales de ${this.nuevaCarta.estudianteHoras} horas, a fin de complementar la formación recibida en nuestra Institución Académica. En tal sentido, solicitamos aceptar nuestra solicitud para brindar las facilidades del caso al mencionado estudiante.`;
  }

  generarSegundoParrafo(): string {
    return this.segundoParrafoGenerado;
  }

  crearCarta() {
    // Actualizar el cuerpo2 con el párrafo generado antes de crear la carta
    this.nuevaCarta.cuerpo2 = this.segundoParrafoGenerado;
    // Lógica para crear la carta
    console.log('Creando carta:', this.nuevaCarta);
    this.cerrarModal();
  }
}
