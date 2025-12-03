import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CartaSolicitud {
  id_formato: number;
  id_alumno: number;
  id_trabajador: number;
  fecha_emision: string;
  estado: string;
  nombre_empresa: string;
  grado_academico: string;
  cargo_responsable: string;
  representante_legal: string;
  procedencia_empresa: string;
  contacto: string;
  horas: string;
  fecha_inicio: string;
  fecha_fin: string;
  evaluacion_capsi: string;
  id_config: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class CartaPresentacionService {
  private readonly apiUrl = environment.apiUrl.config;
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las cartas de solicitud desde la API
   * @returns Observable<CartaSolicitud[]>
   */
  getCartasSolicitud(): Observable<CartaSolicitud[]> {
    const url = `${this.apiUrl}/api/request-letters/`;
    
    return this.http.get<ApiResponse<CartaSolicitud[]>>(url, this.httpOptions)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Error al obtener las cartas de solicitud');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Filtra cartas por término de búsqueda
   * @param searchTerm - Término de búsqueda
   * @param cartas - Lista de cartas
   * @returns CartaSolicitud[]
   */
  filterCartas(searchTerm: string, cartas: CartaSolicitud[]): CartaSolicitud[] {
    if (!searchTerm.trim()) {
      return cartas;
    }
    
    const term = searchTerm.toLowerCase().trim();
    return cartas.filter(carta => 
      carta.nombre_empresa.toLowerCase().includes(term) ||
      carta.representante_legal.toLowerCase().includes(term) ||
      carta.contacto.includes(term) ||
      carta.id_formato.toString().includes(term)
    );
  }

  /**
   * Mapea el estado numérico a texto
   * @param estado - Estado numérico de la API
   * @returns string
   */
  mapearEstado(estado: string): 'Aprobado' | 'Revisión' | 'Rechazado' {
    switch (estado) {
      case '1':
        return 'Aprobado';
      case '0':
        return 'Rechazado';
      case '2':
        return 'Revisión';
      default:
        return 'Revisión';
    }
  }

  /**
   * Manejo de errores HTTP
   * @param error - Error HTTP
   * @returns Observable<never>
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en CartaPresentacionService:', error);
    
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
      
      if (error.status === 0) {
        errorMessage = 'No se puede conectar al servidor. Verifique su conexión.';
      } else if (error.status === 404) {
        errorMessage = 'Endpoint no encontrado. Verifique la URL de la API.';
      } else if (error.status >= 500) {
        errorMessage = 'Error interno del servidor. Intente nuevamente más tarde.';
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}