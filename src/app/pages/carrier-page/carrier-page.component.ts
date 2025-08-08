import { Component, OnInit } from '@angular/core';
import { GenericListComponent } from '../../shared/components/generic-list/generic-list.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Carrier } from '../../core/models/carrier.module';
import { CarrierPageService } from './carrier-page.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carrier-page',
  standalone: true,
  templateUrl: './carrier-page.component.html',
  imports: [GenericListComponent, CommonModule],
})

export class CarrierPageComponent implements OnInit {

  carriers: Carrier[] = [];

  isLoading: boolean = false;

  columns = [
    { key: 'nombre', label: 'Nombre Transportista' },
    { key: 'NIF', label: 'NIF' },
    { key: 'email', label: 'Correo' },
    { key: 'tel1', label: 'Telf. 1' },
    { key: 'proveedor.nombre', label: 'Proveedor' },
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
    this._carrierPageService.getCarriers().subscribe({
      next: (carriers) => {
        this.carriers = carriers;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  onAdd() {
    this.router.navigate(['carrier/add'])
  }

  onEdit(carrier: Carrier) {
    this.router.navigate(['carrier/edit'], {
      state: {
        carrier: { ...carrier },
        method: 'update'
      }
    });
  }

  onDelete(carrier: Carrier) {
    this.isLoading = true;
    this._carrierPageService.deleteCarrier(carrier).subscribe({
      next: () => {
        this.loadDefaultData();
        this.toastr.success('Transportista eliminado correctamente', 'Éxito');
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
