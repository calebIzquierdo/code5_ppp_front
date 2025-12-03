import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface LegalPerson {
  id_empresa: number;
  id_persona_juridica: number;
  razon_social: string;
  direccion: string;
  sector_empresarial: string;
  responsable: string;
  correo: string;
  telefono: string;
  estado: number;
  nombre: string;
  paterno: string | null;
  materno: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: any;
}

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private readonly apiUrl = environment.apiUrl.config;
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) { 
    this.apiUrl = environment.apiUrl.config;
  }

  /**
   * Obtiene todas las personas jurídicas (empresas) desde la API
   * @returns Observable<LegalPerson[]>
   */
  getLegalPersons(): Observable<LegalPerson[]> {
    const url = `${this.apiUrl}/api/config/global/legal-persons`;
    
    return this.http.get<any>(url, this.httpOptions)
      .pipe(
        map(response => {
          // Si la respuesta es un array directamente
          if (Array.isArray(response)) {
            return response as LegalPerson[];
          }
          
          // Si la respuesta tiene estructura con success y data
          if (response && response.success && response.data) {
            if (Array.isArray(response.data)) {
              return response.data as LegalPerson[];
            }
            
            // Si data es un objeto, buscar arrays dentro
            if (typeof response.data === 'object') {
              const dataKeys = Object.keys(response.data);
              for (let key of dataKeys) {
                if (Array.isArray(response.data[key])) {
                  return response.data[key] as LegalPerson[];
                }
              }
            }
          }
          
          // Si la respuesta tiene solo data
          if (response && response.data && Array.isArray(response.data)) {
            return response.data as LegalPerson[];
          }
          
          return [];
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene una persona jurídica por ID
   * @param id - ID de la empresa
   * @returns Observable<LegalPerson>
   */
  getLegalPersonById(id: number): Observable<LegalPerson> {
    const url = `${this.apiUrl}/api/config/global/legal-persons/${id}`;
    
    return this.http.get<ApiResponse<LegalPerson>>(url, this.httpOptions)
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message || 'Error al obtener la empresa');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Filtra empresas por nombre o RUC
   * @param searchTerm - Término de búsqueda
   * @param companies - Lista de empresas
   * @returns LegalPerson[]
   */
  filterCompanies(searchTerm: string, companies: LegalPerson[]): LegalPerson[] {
    if (!searchTerm.trim()) {
      return companies;
    }
    
    const term = searchTerm.toLowerCase().trim();
    return companies.filter(company => 
      company.razon_social.toLowerCase().includes(term) ||
      company.id_persona_juridica.toString().includes(term) ||
      company.responsable.toLowerCase().includes(term) ||
      company.correo.toLowerCase().includes(term)
    );
  }

  /**
   * Manejo de errores HTTP
   * @param error - Error HTTP
   * @returns Observable<never>
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en EmpresaService:', error);
    
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