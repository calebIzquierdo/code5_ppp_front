import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface HistorialEvaluacion {
  fechaEvaluacion: string;
  estado: 'Apto' | 'No Apto';
  fechaVigencia: string;
  comentario: string;
}

interface EstudianteDetalle {
  id: number;
  nombreCompleto: string;
  codigoUniversitario: string;
  programaEstudio: string;
  historial: HistorialEvaluacion[];
}

@Component({
  selector: 'app-estudiante-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estudiante-detalle.component.html',
  styleUrl: './estudiante-detalle.component.css'
})
export class EstudianteDetalleComponent {
  @Input() estudiante: any = null;
  @Output() cerrar = new EventEmitter<void>();

  // Signal para mostrar el modal
  isVisible = signal<boolean>(false);

  // Datos de ejemplo del historial
  historialData: HistorialEvaluacion[] = [
    {
      fechaEvaluacion: '15/07/2025',
      estado: 'No Apto',
      fechaVigencia: '15/12/2025',
      comentario: 'Requiere seguimiento continuo, mostrar avances.'
    },
    {
      fechaEvaluacion: '15/12/2025',
      estado: 'Apto',
      fechaVigencia: '15/07/2026',
      comentario: 'Requiere seguimiento continuo, mostrar avances.'
    },
    {
      fechaEvaluacion: '15/12/2025',
      estado: 'Apto',
      fechaVigencia: '15/07/2026',
      comentario: 'Requiere seguimiento continuo, mostrar avances.'
    }
  ];

  ngOnChanges() {
    if (this.estudiante) {
      this.isVisible.set(true);
    }
  }

  onCerrar() {
    this.isVisible.set(false);
    this.cerrar.emit();
  }
}