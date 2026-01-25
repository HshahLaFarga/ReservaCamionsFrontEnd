import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { Profile } from '../../core/models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class ProfilePageService {
  constructor(
    private http: HttpClient
  ) { }

  updateProfile(user: Profile): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/users/${user.id}`, user, { withCredentials: true });
  }

  updateEntidad(entidad: any): Observable<any> {
    // Asumimos que la entidad tiene 'entidad_id' o 'id'. 
    // Ajusta según tu modelo real si es 'id' o 'entidad_id'.
    // El modelo Entidad tiene 'entidad_id'.
    return this.http.put(`${environment.apiBaseUrl}/entidades/${entidad.entidad_id}`, entidad, { withCredentials: true });
  }
}
