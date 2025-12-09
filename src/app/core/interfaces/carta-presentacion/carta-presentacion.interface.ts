export interface CartaPresentacion {
    id_formato: number;
    id_alumno: number;
    id_trabajador?: number;
    fecha_emision: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    horas: number;
    estado: number;
    nombre_empresa: string;
    representante_legal?: string;
    procedencia_empresa?: string;
    contacto?: string;
    grado_academico?: string;
    cargo_responsable?: string;
    evaluacion_capsi?: string;
    observaciones?: string;
    id_config?: number;
    id_programa_estudio?: number;
    id_campus?: number;
    // id_semestre?: number;
    tipo_formulario?: 'general' | 'psicologia';
    escuela_profesional?: string;
    nombre_campus?: string;
    estado_nombre?: string;
}

export interface AlumnoInfo {
    id_alumno: number;
    nombre_completo: string;
    id_programa_estudio: number;
    codigo_programa: string;
    nombre_programa: string;
    requiere_formulario_especial: boolean;
    tipo_formulario: 'general' | 'psicologia';
}

export interface AlumnoDefaults {
    id_campus: number;
    nombre_campus: string;
    id_programa_estudio: number;
    nombre_programa: string;
}

export interface Empresa {
    id_empresa: number;
    nombre_empresa: string;
    direccion?: string;
    sector_empresarial?: string;
    telefono?: string;
}

export interface FiltrosDisponibles {
    programas: ProgramaEstudio[];
    campus: Campus[];
    estados: Estado[];
    // semestres: Semestre[];
}

export interface ProgramaEstudio {
    id_programa_estudio: number;
    nombre: string;
    codigo: string;
}

export interface Campus {
    id_campus: number;
    codigo?: string;
    nombre: string;
}

export interface Estado {
    id: number;
    nombre: string;
}

export interface Semestre {
    id_semestre: number;
    nombre: string;
}

export interface CartaFormData {
    id_alumno: number;
    id_trabajador?: number;
    id_config?: number;
    fecha_emision: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    horas: number;
    estado: number;
    nombre_empresa: string;
    representante_legal?: string;
    procedencia_empresa?: string;
    contacto?: string;
    grado_academico?: string;
    cargo_responsable?: string;
    evaluacion_capsi?: string;
    observaciones?: string;
    id_programa_estudio?: number;
    id_campus?: number;
    // id_semestre?: number;
    tipo_formulario?: 'general' | 'psicologia';
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}