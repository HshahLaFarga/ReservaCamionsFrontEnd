import { Component, OnInit } from '@angular/core';
import { GenericListComponent } from '../../shared/components/generic-list/generic-list.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Carrier } from '../../core/models/transportista.model';
import { CarrierPageService } from './carrier-page.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carrier-page',
  standalone: true,
  templateUrl: './carrier-page.component.html',
  imports: [GenericListComponent, CommonModule],
})

export class CarrierPageComponent implements OnInit {

  Carriers: Carrier[] = [];

  isLoading: boolean = false;

  columns = [
    { key: 'entidad.nombre', label: 'Nombre' },
    { key: 'entidad.nif', label: 'NIF' },
    { key: 'entidad.email', label: 'Correo' },
    { key: 'entidad.telefono1', label: 'Telf. 1' },
  ];

  constructor(
    private _carrierPageService: CarrierPageService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.loadDefaultData();
  }

  loadDefaultData() {
    //Get Transportisas
    this._carrierPageService.getTransportistas().subscribe({
      next: (Carriers) => {
        this.Carriers = Carriers;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  onAdd() {
    this.router.navigate(['transportista/add'])
  }

  onEdit(Carrier: Carrier) {
    this.router.navigate(['transportista/edit'], {
      state: {
        carrier: { ...Carrier },
        method: 'update'
      }
    });
  }

  onDelete(Carrier: Carrier) {
    this.isLoading = true;
    this._carrierPageService.deleteCarrier(Carrier).subscribe({
      next: () => {
        this.loadDefaultData();
        this.toastr.success('Carrier eliminado correctamente', 'Éxito');
        this.isLoading = false;
      },
      error: (err) => {
        if (err.error.id === 1) {
          this.toastr.error(err.error.message, 'Error');
        } else  {
          console.error('Error getting providers ', err);
        }
        this.isLoading = false;
      }
    });
  }
}
