import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    CartaPresentacion,
    Estado
} from '../../../../../core/interfaces/carta-presentacion/carta-presentacion.interface';
import { CartaPresentacionService } from '../../../../../core/services/carta-presentacion/carta-presentacion.service';

@Component({
    selector: 'app-carta-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './carta-list.component.html',
    styleUrl: './carta-list.component.css',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CartaListComponent {
    Math = Math;

    @Input() cartas: CartaPresentacion[] = [];
    @Input() loading = false;
    @Input() estadosDisponibles: Estado[] = [];
    @Input() paginaActual = 0;
    @Input() itemsPorPagina = 10;
    @Input() totalPaginas = 0;
    @Input() cartasFiltradas: CartaPresentacion[] = [];

    @Output() estadoChange = new EventEmitter<number | null>();
    @Output() ordenar = new EventEmitter<void>();
    @Output() buscar = new EventEmitter<string>();
    @Output() cambiarPagina = new EventEmitter<number>();
    @Output() cambiarItemsPorPagina = new EventEmitter<number>();
    @Output() verDetalle = new EventEmitter<{ id: number; carta: CartaPresentacion }>();
    @Output() nuevaSolicitud = new EventEmitter<void>();

    filtroEstado: number | null = null;
    textoBusqueda = '';
    dropdownOpen = false;
    ordenAscendente = true;

    modalAbierto = false;
    modalTipo: 'rechazado' | 'aceptado' | null = null;
    cartaSeleccionada: CartaPresentacion | null = null;

    constructor(private cartaService: CartaPresentacionService) { }

    toggleDropdown(): void {
        this.dropdownOpen = !this.dropdownOpen;
    }

    seleccionarEstado(estadoId: number | null): void {
        this.filtroEstado = estadoId;
        this.dropdownOpen = false;
        this.estadoChange.emit(this.filtroEstado);
    }

    getEstadoNombre(): string {
        if (this.filtroEstado === null) return 'Todos';
        const estado = this.estadosDisponibles.find(e => e.id === this.filtroEstado);
        return estado ? estado.nombre : 'Todos';
    }

    onBuscar(): void {
        this.buscar.emit(this.textoBusqueda);
    }

    onOrdenar(): void {
        this.ordenAscendente = !this.ordenAscendente;
        this.ordenar.emit();
    }

    irAPagina(pagina: number): void {
        this.cambiarPagina.emit(pagina);
    }

    paginaAnterior(): void {
        this.cambiarPagina.emit(this.paginaActual - 1);
    }

    paginaSiguiente(): void {
        this.cambiarPagina.emit(this.paginaActual + 1);
    }

    onItemsPorPaginaChange(): void {
        this.cambiarItemsPorPagina.emit(this.itemsPorPagina);
    }

    getPaginas(): number[] {
        const paginas: number[] = [];
        const inicio = Math.max(0, this.paginaActual - 1);
        const fin = Math.min(this.totalPaginas - 1, this.paginaActual + 3);
        for (let i = inicio; i <= fin; i++) {
            paginas.push(i + 1);
        }
        return paginas;
    }

    formatNumber(num: number): string {
        return String(num).padStart(2, '0');
    }

    getEstadoClase(estado: number): string {
        return this.cartaService.mapearEstadoClase(estado);
    }

    onVerDetalle(id: number, carta: CartaPresentacion): void {
        const clase = this.getEstadoClase(carta.estado);

        if (clase === 'revision') {
            return;
        }

        this.modalTipo = clase === 'aprobado' ? 'aceptado' : 'rechazado';
        this.cartaSeleccionada = carta;
        this.modalAbierto = true;

        this.verDetalle.emit({ id, carta });
    }

    cerrarModalDetalle(): void {
        this.modalAbierto = false;
        this.modalTipo = null;
        this.cartaSeleccionada = null;
    }

    redirigirANuevaSolicitud(): void {
        this.cerrarModalDetalle();
        this.nuevaSolicitud.emit();
    }
}