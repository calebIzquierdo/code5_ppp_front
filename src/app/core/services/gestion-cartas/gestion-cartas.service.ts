import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface AlumnoLetter {
  nombres: string;
  codigo: string;
  nombre: string; // nombre de la escuela profesional
  estado: string;
}

// Interfaces para filtros
export interface Campus {
  id_campus: number;
  nombre: string;
  codigo: string;
}

export interface Facultad {
  id_facultad: number;
  nombre: string;
  codigo?: string;
}

export interface ProgramaEstudio {
  id_programa_estudio: number;
  nombre: string;
  codigo?: string;
  abreviatura?: string;
}

export interface Semestre {
  id_semestre: number;
  nombre: string;
  codigo?: string;
}

export interface CartaFiltrada {
  id_formato: number;
  id_alumno: number;
  fecha_emision: string;
  fecha_inicio: string;
  fecha_fin: string;
  horas: string;
  estado: string;
  nombre_empresa: string;
  representante_legal: string;
  procedencia_empresa: string;
  contacto: string;
  grado_academico: string;
  cargo_responsable: string;
  evaluacion_capsi: string;
  codigo_alumno: string;
  alumno_nombre: string;
  alumno_paterno: string;
  alumno_materno: string;
  id_programa_estudio: number;
  codigo_programa: string;
  programa_nombre: string;
  programa_abreviatura: string;
  id_campus: number;
  campus_nombre: string;
  campus_codigo: string;
  id_facultad: number;
  facultad_nombre: string;
  periodo_academico: string;
  estado_nombre: string;
  alumno_completo: string;
}

export interface ApiResponseFiltros<T> {
  success: boolean;
  message: string;
  data: T[];
}

export interface CartaDetalleAPI {
  id: number;
  nombres: string;
  codigo: string;
  escuela_profesional: string;
  estado: string;
  // Campos reales del formulario
  area_practica?: string;
  empresa?: string;
  grado_academico?: string;
  representante_legal?: string;
  horas?: number;
  nueva_empresa?: string;
  cargo_responsable?: string;
  procedencia_empresa?: string;
  contacto?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  evaluacion_capsi?: string;
  // Campos adicionales
  sede?: string;
  facultad?: string;
  programa?: string;
  ciclo_academico?: string;
  tipo_aprendizaje?: string;
  horas_semanales?: number;
  supervisor?: string;
  correo_supervisor?: string;
  paso01_completado?: boolean;
  paso02_completado?: boolean;
  paso03_completado?: boolean;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: AlumnoLetter[];
}

export interface ApiResponseDetalle {
  success: boolean;
  message: string;
  data: CartaDetalleAPI;
}

export interface CartaPracticante {
  id: number;
  nombrePracticante: string;
  codigo: string;
  escuelaProfesional: string;
  estado: string;
}

export interface CartaDetalle {
  id: number;
  nombrePracticante: string;
  codigo: string;
  escuelaProfesional: string;
  estado: string;
  // Campos del formulario de prácticas
  areaPractica?: string;
  empresa?: string;
  gradoAcademico?: string;
  representanteLegal?: string;
  horas?: number;
  nuevaEmpresa?: string;
  cargoResponsable?: string;
  procedenciaEmpresa?: string;
  contacto?: string;
  fechaInicio?: string;
  fechaFin?: string;
  evaluacionCapsi?: string;
  // Campos adicionales
  sede?: string;
  facultad?: string;
  escuela?: string;
  programa?: string;
  cicloAcademico?: string;
  tipoAprendizaje?: string;
  horasSemanales?: number;
  supervisor?: string;
  correoSupervisor?: string;
  paso01Completado?: boolean;
  paso02Completado?: boolean;
  paso03Completado?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GestionPracticasService {
  private apiUrl = environment.apiUrl.code5;

  constructor(private http: HttpClient) { }

  getAlumnosConCartas(): Observable<CartaPracticante[]> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/api/request-letters/all-alumnos-letter`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data.map((alumno, index) => this.mapearAlumno(alumno, index));
          }
          return [];
        }),
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }

  getDetallesCarta(id: number): Observable<CartaDetalle> {
    const url = `${this.apiUrl}/api/request-letters/${id}`;
    
    return this.http.get<ApiResponseDetalle>(url)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return this.mapearCartaDetalle(response.data);
          }
          throw new Error('No se encontraron detalles para la carta');
        }),
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }

  private mapearAlumno(alumno: AlumnoLetter, index: number): CartaPracticante {
    return {
      id: index + 1,
      nombrePracticante: alumno.nombres,
      codigo: alumno.codigo,
      escuelaProfesional: alumno.nombre,
      estado: this.mapearEstado(alumno.estado)
    };
  }

  private mapearCartaDetalle(cartaAPI: CartaDetalleAPI): CartaDetalle {
    return {
      id: cartaAPI.id,
      nombrePracticante: cartaAPI.nombres,
      codigo: cartaAPI.codigo,
      escuelaProfesional: cartaAPI.escuela_profesional,
      estado: this.mapearEstado(cartaAPI.estado),
      // Mapear campos del formulario de prácticas
      areaPractica: cartaAPI.area_practica || 'No especificada',
      empresa: cartaAPI.empresa || 'No especificada',
      gradoAcademico: cartaAPI.grado_academico || 'No especificado',
      representanteLegal: cartaAPI.representante_legal || 'No especificado',
      horas: cartaAPI.horas || 0,
      nuevaEmpresa: cartaAPI.nueva_empresa || 'No especificada',
      cargoResponsable: cartaAPI.cargo_responsable || 'No especificado',
      procedenciaEmpresa: cartaAPI.procedencia_empresa || 'No especificada',
      contacto: cartaAPI.contacto || 'No especificado',
      fechaInicio: cartaAPI.fecha_inicio || 'No especificada',
      fechaFin: cartaAPI.fecha_fin || 'No especificada',
      evaluacionCapsi: cartaAPI.evaluacion_capsi || 'Pendiente',
      // Campos adicionales
      sede: cartaAPI.sede || 'UPEU Lima',
      facultad: cartaAPI.facultad || 'No especificada',
      escuela: cartaAPI.escuela_profesional,
      programa: cartaAPI.programa || 'No especificado',
      cicloAcademico: cartaAPI.ciclo_academico || 'No especificado',
      tipoAprendizaje: cartaAPI.tipo_aprendizaje || 'PPP',
      horasSemanales: cartaAPI.horas_semanales || cartaAPI.horas || 0,
      supervisor: cartaAPI.supervisor || 'No asignado',
      correoSupervisor: cartaAPI.correo_supervisor || 'No especificado',
      paso01Completado: cartaAPI.paso01_completado || false,
      paso02Completado: cartaAPI.paso02_completado || false,
      paso03Completado: cartaAPI.paso03_completado || false
    };
  }

  private mapearEstado(estado: string): string {
    switch (estado) {
      case '1':
        return 'ENVIADO';
      case '2':
        return 'REVISIÓN';
      case '3':
        return 'RECHAZADO';
      default:
        return 'PENDIENTE';
    }
  }

  // Métodos para obtener filtros
  getCampus(): Observable<Campus[]> {
    return this.http.get<any>(`${this.apiUrl}/api/gestion/filtros/campus`)
      .pipe(
        map(response => {
          if (response && response.data) {
            return response.data as Campus[];
          }
          return [];
        }),
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }

  getFacultadesPorCampus(idCampus: number): Observable<Facultad[]> {
    return this.http.get<ApiResponseFiltros<Facultad>>(`${this.apiUrl}/api/gestion/filtros/facultades/${idCampus}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          return [];
        }),
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }

  getProgramasPorCampusYFacultad(idCampus: number, idFacultad: number): Observable<ProgramaEstudio[]> {
    return this.http.get<ApiResponseFiltros<ProgramaEstudio>>(`${this.apiUrl}/api/gestion/filtros/programas/${idCampus}/${idFacultad}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          return [];
        }),
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }

  getSemestres(): Observable<Semestre[]> {
    return this.http.get<ApiResponseFiltros<Semestre>>(`${this.apiUrl}/api/gestion/filtros/semestres`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          return [];
        }),
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }

  getCartasFiltradas(idCampus?: number, idFacultad?: number, idPrograma?: number): Observable<CartaFiltrada[]> {
    let url = `${this.apiUrl}/api/gestion/cartas/filtradas`;
    const params: string[] = [];

    if (idCampus) {
      params.push(`id_campus=${idCampus}`);
    }
    if (idFacultad) {
      params.push(`id_facultad=${idFacultad}`);
    }
    if (idPrograma) {
      params.push(`id_programa_estudio=${idPrograma}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<any>(url)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data as CartaFiltrada[];
          }
          return [];
        }),
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código de error: ${error.status}, mensaje: ${error.message}`;
    }

    console.error('Error en GestionPracticasService:', errorMessage);
    return throwError(() => errorMessage);
  }
}