import { Component, CUSTOM_ELEMENTS_SCHEMA, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Estudiante {
  id: number;
  nombreCompleto: string;
  programaEstudio: string;
  estado: 'Apto' | 'No Apto' | 'Pendiente';
  codigoUniversitario: string;
}

@Component({
  selector: 'app-evaluacion-capsi',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './evaluacion-capsi.component.html',
  styleUrl: './evaluacion-capsi.component.css'
})
export class EvaluacionCapsiComponent {
  
  // Signal para el término de búsqueda
  searchTerm = signal<string>('');
  
  // Signal para mostrar/ocultar la tabla
  showResults = signal<boolean>(false);
  
  // Signal para mostrar el detalle del estudiante (reemplaza toda la vista)
  showStudentDetail = signal<boolean>(false);
  
  // Signal para mostrar la vista de nueva evaluación
  showNewEvaluation = signal<boolean>(false);
  
  // Signal para el estudiante seleccionado
  selectedStudent = signal<any>(null);
  
  // Signal para la fecha de evaluación (inicializada con fecha actual)
  evaluationDate = signal<string>(new Date().toISOString().split('T')[0]);
  
  // Datos de ejemplo
  private estudiantesData: Estudiante[] = [
    {
      id: 1,
      nombreCompleto: 'Melanie Vargas López',
      programaEstudio: 'E.P. Psicología',
      estado: 'Apto',
      codigoUniversitario: '2020123456'
    },
    {
      id: 2,
      nombreCompleto: 'Carlos Mendoza García',
      programaEstudio: 'E.P. Ingeniería de Sistemas',
      estado: 'Pendiente',
      codigoUniversitario: '2019987654'
    },
    {
      id: 3,
      nombreCompleto: 'Ana Torres Ruiz',
      programaEstudio: 'E.P. Administración',
      estado: 'No Apto',
      codigoUniversitario: '2021456789'
    }
  ];
  
  // Signal computado para filtrar estudiantes
  estudiantesFiltrados = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term || !this.showResults()) {
      return [];
    }
    
    return this.estudiantesData.filter(estudiante =>
      estudiante.codigoUniversitario.toLowerCase().includes(term) ||
      estudiante.nombreCompleto.toLowerCase().includes(term)
    );
  });
  
  // Método para realizar búsqueda - SOLO al hacer clic en botón
  onSearch() {
    const term = this.searchTerm().trim();
    if (term.length >= 1) { // Mínimo 1 caracter para buscar
      this.showResults.set(true);
    }
  }
  
  // Método para limpiar búsqueda
  clearSearch() {
    this.searchTerm.set('');
    this.showResults.set(false);
  }
  
  // Método para volver al buscador original
  backToSearch() {
    this.showResults.set(false);
  }
  
  // Métodos para las acciones
  verEstudiante(estudiante: Estudiante) {
    console.log('Ver estudiante:', estudiante);
    this.selectedStudent.set(estudiante);
    this.showStudentDetail.set(true);
    // Ocultar la tabla de resultados
    this.showResults.set(false);
  }
  
  cerrarDetalle() {
    this.showStudentDetail.set(false);
    this.selectedStudent.set(null);
    // Volver a mostrar la tabla de resultados
    this.showResults.set(true);
  }
  
  volverAInicio() {
    this.showStudentDetail.set(false);
    this.showResults.set(false);
    this.selectedStudent.set(null);
    this.searchTerm.set('');
  }
  
  nuevoRegistro(estudiante: Estudiante) {
    console.log('Nuevo registro para:', estudiante);
    this.selectedStudent.set(estudiante);
    this.showNewEvaluation.set(true);
    // Ocultar otras vistas
    this.showResults.set(false);
    this.showStudentDetail.set(false);
  }

  cerrarNuevaEvaluacion() {
    this.showNewEvaluation.set(false);
    this.selectedStudent.set(null);
    // Resetear fecha a la fecha actual
    this.evaluationDate.set(new Date().toISOString().split('T')[0]);
    // Volver a mostrar la tabla de resultados
    this.showResults.set(true);
  }

  guardarEvaluacion() {
    console.log('Guardar nueva evaluación para:', this.selectedStudent());
    // Aquí implementarías la lógica para guardar la evaluación
    // Por ahora, simplemente cerramos la vista
    this.cerrarNuevaEvaluacion();
  }

}
