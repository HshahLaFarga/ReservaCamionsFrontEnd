import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { Booking, BookingDocument } from '../../core/models/booking.module';
// import { Profile } from './reservation-page.types';

@Injectable({
  providedIn: 'root'
})
export class BookingPageService {
  constructor(
    private http: HttpClient
  ) { }

  getAllBookings(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/reserva`);
  }

  deleteBooking(booking: Booking): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/reserva/${booking.reserva_id}`);
  }

  getFile(path: string): Observable<Blob> {
    return this.http.get(`${environment.apiBaseUrl}/getFile/${encodeURIComponent(path)}`, { responseType: 'blob' });
  }

  getFileName(url: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/file/name/${url}`);
  }

  getProvider(provider_id: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/proveedores/${provider_id}`);
  }

  getMaterials(materials: number[]): Observable<any> {
    let params = new HttpParams();
    if (materials.length > 0) {
      params = params.set('id1', materials[0]);
    }
    if (materials.length > 1) {
      params = params.set('id2', materials[1]);
    }
    return this.http.get(`${environment.apiBaseUrl}/materiales`, { params });
  }

  getCompany(company_id: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/empresas/${company_id}`);
  }
  getTruck(truck_id: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/tipocamiones/${truck_id}`);
  }
  getTransportista(transportista_id: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/transportistas/${transportista_id}`);
  }
}
