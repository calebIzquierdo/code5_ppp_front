import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CartaPresentacionService } from '../../../../../core/services/carta-presentacion/carta-presentacion.service';
import { CartaFormData, AlumnoInfo, Empresa } from '../../../../../core/interfaces/carta-presentacion/carta-presentacion.interface';

@Component({
    selector: 'app-carta-form-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './carta-form-modal.component.html',
    styleUrl: './carta-form-modal.component.css',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CartaFormModalComponent {
    @Input() idAlumno!: number;
    @Input() alumnoInfo!: AlumnoInfo | null;
    @Input() empresas: Empresa[] = [];
    @Input() cargandoEmpresas = false;
    @Output() cerrar = new EventEmitter<void>();
    @Output() cartaCreada = new EventEmitter<void>();

    solicitud = {
        idEmpresa: null as number | null,
        nuevaEmpresa: '',
        gradoAcademico: '',
        cargoResponsable: '',
        representanteLegal: '',
        procedenciaEmpresa: '',
        fechaInicio: '',
        fechaFin: '',
        horas: '',
        contacto: '',
        evaluacionCapsi: null as File | null
    };

    errores = {
        empresa: '',
        gradoAcademico: '',
        representanteLegal: '',
        fechaInicio: '',
        fechaFin: '',
        horas: '',
        evaluacionCapsi: ''
    };

    enviando = false;
    mostrarExito = false;
    mostrarConfirmacionCancelar = false;
    nombreArchivoCapsi: string | null = null;
    private scrollTimeout: any;

    mostrarVistaPrevia = false;
    urlVistaPrevia: SafeResourceUrl | null = null;

    constructor(
        private cartaService: CartaPresentacionService,
        private sanitizer: DomSanitizer
    ) { }

    get esPsicologia(): boolean {
        return this.alumnoInfo?.tipo_formulario === 'psicologia';
    }

    get empresaSeleccionada(): Empresa | undefined {
        return this.empresas.find(e => e.id_empresa === this.solicitud.idEmpresa);
    }

    limpiarError(campo: keyof typeof this.errores): void {
        this.errores[campo] = '';
    }

    onModalScroll(event: Event): void {
        const element = event.target as HTMLElement;
        element.classList.add('scrolling');

        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }

        this.scrollTimeout = setTimeout(() => {
            element.classList.remove('scrolling');
        }, 1000);
    }

    onArchivoSeleccionado(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const archivo = input.files[0];

            if (archivo.type !== 'application/pdf' && !archivo.type.startsWith('image/')) {
                this.errores.evaluacionCapsi = 'Solo se permiten archivos PDF o imágenes';
                this.solicitud.evaluacionCapsi = null;
                this.nombreArchivoCapsi = null;
                return;
            }

            if (archivo.size > 5 * 1024 * 1024) {
                this.errores.evaluacionCapsi = 'El archivo no debe superar 5MB';
                this.solicitud.evaluacionCapsi = null;
                this.nombreArchivoCapsi = null;
                return;
            }

            this.solicitud.evaluacionCapsi = archivo;
            this.nombreArchivoCapsi = archivo.name;
            this.errores.evaluacionCapsi = '';
        }
    }

    verVistaPrevia(): void {
        if (this.solicitud.evaluacionCapsi) {
            const blobUrl = URL.createObjectURL(this.solicitud.evaluacionCapsi);
            this.urlVistaPrevia = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
            this.mostrarVistaPrevia = true;
        }
    }

    cerrarVistaPrevia(): void {
        this.mostrarVistaPrevia = false;
        this.urlVistaPrevia = null;
    }

    eliminarArchivo(): void {
        this.solicitud.evaluacionCapsi = null;
        this.nombreArchivoCapsi = null;
        this.errores.evaluacionCapsi = '';
    }

    solicitarCancelar(): void {
        this.mostrarConfirmacionCancelar = true;
    }

    cancelarConfirmacion(): void {
        this.mostrarConfirmacionCancelar = false;
    }

    confirmarCancelar(): void {
        this.mostrarConfirmacionCancelar = false;
        this.cerrar.emit();
    }

    cerrarModalExito(): void {
        this.mostrarExito = false;
        this.cartaCreada.emit();
    }

    validarContacto(event: KeyboardEvent): void {
        const permitidos = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
        if (permitidos.includes(event.key)) return;
        if (!/^\d$/.test(event.key)) {
            event.preventDefault();
        }
    }

    onFechaInicioChange(): void {
        this.limpiarError('fechaInicio');
        if (this.solicitud.fechaInicio && this.solicitud.fechaFin) {
            if (new Date(this.solicitud.fechaFin) < new Date(this.solicitud.fechaInicio)) {
                this.errores.fechaFin = 'La fecha de fin no puede ser anterior a la fecha de inicio';
            } else {
                this.limpiarError('fechaFin');
            }
        }
    }

    onFechaFinChange(): void {
        this.limpiarError('fechaFin');
        if (this.solicitud.fechaInicio && this.solicitud.fechaFin) {
            if (new Date(this.solicitud.fechaFin) < new Date(this.solicitud.fechaInicio)) {
                this.errores.fechaFin = 'La fecha de fin no puede ser anterior a la fecha de inicio';
            }
        }
    }

    enviarSolicitud(): void {
        if (!this.validarFormulario()) return;

        this.enviando = true;

        const nombreEmpresa = this.solicitud.idEmpresa
            ? this.empresaSeleccionada?.nombre_empresa || ''
            : this.solicitud.nuevaEmpresa;

        const cartaData: CartaFormData = {
            id_alumno: this.idAlumno,
            fecha_emision: new Date().toISOString().split('T')[0],
            horas: parseInt(this.solicitud.horas) || 0,
            estado: 2,
            nombre_empresa: nombreEmpresa,
            representante_legal: this.solicitud.representanteLegal,
            procedencia_empresa: this.solicitud.procedenciaEmpresa,
            contacto: this.solicitud.contacto,
            grado_academico: this.solicitud.gradoAcademico,
            cargo_responsable: this.solicitud.cargoResponsable
        };

        if (this.esPsicologia) {
            cartaData.fecha_inicio = this.solicitud.fechaInicio;
            cartaData.fecha_fin = this.solicitud.fechaFin;
        }

        this.cartaService.createCarta(cartaData).subscribe({
            next: () => {
                this.enviando = false;
                this.cartaCreada.emit();
                this.cerrar.emit();
            },
            error: (error) => {
                this.enviando = false;
                console.error('Error completo:', error);
                console.error('Detalle:', error.error);
                this.errores.empresa = error.error?.message || error.message || 'Error al enviar la solicitud';
            }
        });
    }

    private validarFormulario(): boolean {
        this.errores = {
            empresa: '',
            gradoAcademico: '',
            representanteLegal: '',
            fechaInicio: '',
            fechaFin: '',
            horas: '',
            evaluacionCapsi: ''
        };

        let valido = true;

        if (!this.solicitud.idEmpresa && !this.solicitud.nuevaEmpresa.trim()) {
            this.errores.empresa = 'Debes seleccionar o ingresar una empresa';
            valido = false;
        }

        if (!this.solicitud.representanteLegal.trim()) {
            this.errores.representanteLegal = 'Este campo es obligatorio';
            valido = false;
        }

        if (!this.solicitud.horas || parseInt(this.solicitud.horas) <= 0) {
            this.errores.horas = 'Debes ingresar un número de horas válido (mayor a 0)';
            valido = false;
        }

        if (this.esPsicologia) {
            if (!this.solicitud.fechaInicio) {
                this.errores.fechaInicio = 'Este campo es obligatorio';
                valido = false;
            }

            if (!this.solicitud.fechaFin) {
                this.errores.fechaFin = 'Este campo es obligatorio';
                valido = false;
            }

            if (this.solicitud.fechaInicio && this.solicitud.fechaFin &&
                new Date(this.solicitud.fechaFin) < new Date(this.solicitud.fechaInicio)) {
                this.errores.fechaFin = 'La fecha de fin no puede ser anterior a la fecha de inicio';
                valido = false;
            }

            if (!this.solicitud.evaluacionCapsi) {
                this.errores.evaluacionCapsi = 'Debes adjuntar el archivo de evaluación CAPSI';
                valido = false;
            }
        }

        return valido;
    }

    onOverlayClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) {
            this.solicitarCancelar();
        }
    }
}
