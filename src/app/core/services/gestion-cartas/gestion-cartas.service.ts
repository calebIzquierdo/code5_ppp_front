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

export interface ApiResponse {
  success: boolean;
  message: string;
  data: AlumnoLetter[];
}

export interface CartaPracticante {
  id: number;
  nombrePracticante: string;
  codigo: string;
  escuelaProfesional: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class GestionPracticasService {
  private apiUrl = environment.apiUrl.config;

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
        catchError(this.handleError)
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