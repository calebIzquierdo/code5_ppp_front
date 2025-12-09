import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FiltrosDisponibles } from '../../../../../core/interfaces/carta-presentacion/carta-presentacion.interface';

@Component({
    selector: 'app-carta-filters',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './carta-filters.component.html',
    styleUrl: './carta-filters.component.css',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CartaFiltersComponent implements OnInit, OnChanges {
    @Input() filtrosDisponibles!: FiltrosDisponibles;
    @Input() defaultCampus: number | null = null;
    @Input() defaultEscuela: number | null = null;
    @Input() defaultSemestre: number | null = null;

    @Output() filtrosChange = new EventEmitter<any>();

    filtroCampus: number | null = null;
    filtroEscuela: number | null = null;
    filtroSemestre: number | null = null;

    ngOnInit(): void {
        this.inicializarFiltros();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['defaultCampus'] || changes['defaultEscuela'] || changes['defaultSemestre']) {
            this.inicializarFiltros();
        }
    }

    inicializarFiltros(): void {
        if (this.filtroCampus === null && this.defaultCampus !== null) {
            this.filtroCampus = this.defaultCampus;
        }
        if (this.filtroEscuela === null && this.defaultEscuela !== null) {
            this.filtroEscuela = this.defaultEscuela;
        }
        if (this.filtroSemestre === null && this.defaultSemestre !== null) {
            this.filtroSemestre = this.defaultSemestre;
        }
    }

    aplicarFiltros(): void {
        this.filtrosChange.emit({
            campus: this.filtroCampus,
            escuela: this.filtroEscuela,
            semestre: this.filtroSemestre
        });
    }
}
