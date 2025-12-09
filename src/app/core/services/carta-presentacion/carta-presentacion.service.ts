import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  CartaPresentacion,
  FiltrosDisponibles,
  CartaFormData,
  ApiResponse,
  AlumnoDefaults,
  AlumnoInfo,
  Empresa
} from '../../interfaces/carta-presentacion/carta-presentacion.interface';

@Injectable({
  providedIn: 'root'
})
export class CartaPresentacionService {
  private readonly baseUrl = '/api/ppp/carta-presentacion';

  constructor(private http: HttpClient) { }

  getAlumnoInfo(idAlumno: number): Observable<AlumnoInfo> {
    return this.http.get<ApiResponse<AlumnoInfo>>(`${this.baseUrl}/alumno/${idAlumno}/info`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  getAlumnoDefaults(idAlumno: number): Observable<AlumnoDefaults> {
    return this.http.get<ApiResponse<AlumnoDefaults>>(`${this.baseUrl}/alumno/${idAlumno}/defaults`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  getFiltros(idAlumno: number): Observable<FiltrosDisponibles> {
    return this.http.get<ApiResponse<FiltrosDisponibles>>(`${this.baseUrl}/filtros/${idAlumno}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  getCartas(idAlumno: number, filtros?: { estado?: number; id_campus?: number; id_programa_estudio?: number }): Observable<CartaPresentacion[]> {
    let params = new HttpParams().set('id_alumno', idAlumno.toString());

    if (filtros) {
      if (filtros.estado !== undefined) params = params.set('estado', filtros.estado.toString());
      if (filtros.id_campus) params = params.set('id_campus', filtros.id_campus.toString());
      if (filtros.id_programa_estudio) params = params.set('id_programa_estudio', filtros.id_programa_estudio.toString());
    }

    return this.http.get<ApiResponse<CartaPresentacion[]>>(this.baseUrl, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  getCarta(id: number): Observable<CartaPresentacion> {
    return this.http.get<ApiResponse<CartaPresentacion>>(`${this.baseUrl}/${id}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  createCarta(carta: CartaFormData): Observable<CartaPresentacion> {
    return this.http.post<ApiResponse<CartaPresentacion>>(this.baseUrl, carta)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  updateCarta(id: number, carta: Partial<CartaFormData>): Observable<CartaPresentacion> {
    return this.http.put<ApiResponse<CartaPresentacion>>(`${this.baseUrl}/${id}`, carta)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  deleteCarta(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
      .pipe(
        map(() => undefined),
        catchError(this.handleError)
      );
  }

  getEmpresas(): Observable<Empresa[]> {
    return this.http.get<ApiResponse<Empresa[]>>(`${this.baseUrl}/empresas`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  mapearEstadoNombre(estado: number): string {
    const estados: Record<number, string> = {
      0: 'Rechazado',
      1: 'Aprobado',
      2: 'Revisión'
    };
    return estados[estado] || 'Desconocido';
  }

  mapearEstadoClase(estado: number): string {
    const clases: Record<number, string> = {
      0: 'rechazado',
      1: 'aprobado',
      2: 'revision'
    };
    return clases[estado] || 'revision';
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error de conexión: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
          break;
        case 400:
          errorMessage = 'Solicitud incorrecta. Verifica los datos enviados.';
          break;
        case 401:
          errorMessage = 'No autorizado. Inicia sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          errorMessage = 'El recurso solicitado no fue encontrado.';
          break;
        case 500:
          errorMessage = 'Problemas con el servidor. Intenta más tarde.';
          break;
        case 503:
          errorMessage = 'Servicio no disponible. Intenta más tarde.';
          break;
        default:
          errorMessage = `Error del servidor (${error.status}). Contacta al administrador.`;
      }
    }

    console.error('Error HTTP:', error);
    return throwError(() => new Error(errorMessage));
  }
}