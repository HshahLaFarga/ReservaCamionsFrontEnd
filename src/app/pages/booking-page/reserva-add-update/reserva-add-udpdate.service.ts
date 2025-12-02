import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../core/envoirment/envoirment';

@Injectable({
  providedIn: 'root'
})
export class BookingAddUpdateService {
  constructor(
    private http: HttpClient,
  ) {}

  getAllTrucks(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/tipocamiones`);
  }

  getAllMaterials(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/materiales`);
  }

  getStatus(): Observable<any>{
    return this.http.get(`${environment.apiBaseUrl}/status`);
  }

  getProvider(): Observable<any>{
    return this.http.get(`${environment.apiBaseUrl}/proveedores`);
  }

  getTransportistas(): Observable<any>{
    return this.http.get(`${environment.apiBaseUrl}/transportistas`);
  }

  createBooking(booking: any): Observable<any> {
    console.log('Booking to store', booking);
    return this.http.post(`${environment.apiBaseUrl}/reserva`,booking);
  }

  updateBooking(formData: FormData): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/reserva/${formData.get('reserva_id')}`, formData);
  }

  deleteFile(document_booking_id: number): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/file/name/${document_booking_id}`);
  }

  getWeightRange(): Observable<any> {
  
      const params = new HttpParams()
      .append('keys[]', 'min_kg')
      .append('keys[]', 'max_kg');
    
      return this.http.get(`${environment.apiBaseUrl}/config/claves`, { params });
    }
}
