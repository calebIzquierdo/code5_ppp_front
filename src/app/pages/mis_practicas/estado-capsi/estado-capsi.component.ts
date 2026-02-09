import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-estado-capsi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './estado-capsi.component.html',
  styleUrl: './estado-capsi.component.css'
})
export class EstadoCapsiComponent {

  // Signal para el estado seleccionado
  selectedStatus = signal<string>('apto');

  // Método para cambiar el estado
  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
  }

}
