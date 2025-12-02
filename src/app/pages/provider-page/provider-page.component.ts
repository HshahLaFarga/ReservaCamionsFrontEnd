import { Component, Injectable, OnInit } from '@angular/core';
import { GenericListComponent } from '../../shared/components/generic-list/generic-list.component';
import { Provider } from '../../core/models/proveedor.model';
import { ProviderPageService } from './provider-page.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-provider-page',
  standalone: true,
  templateUrl: './provider-page.component.html',
  imports: [GenericListComponent, CommonModule],
})

export class ProviderPageComponent implements OnInit {

  providers: Provider[] = [];

  isLoading: boolean = false;

  columns = [
    { key: 'entidad.nombre', label: 'Nombre Proveedor' },
    { key: 'entidad.nif', label: 'NIF' },
    { key: 'entidad.email', label: 'Correo' },
    { key: 'entidad.telefono1', label: 'Telf. 1' },
    { key: 'entidad.telefono2', label: 'Telf. 2' },
    { key: 'tipo_proveedor.nombre', label: 'Tipo Proveedor' },
  ];

  constructor(
    private _providerPageService: ProviderPageService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadDefaultData();
  }

  loadDefaultData(){
    //Get Troviders
    this.isLoading = true;
    this._providerPageService.getProviders().subscribe({
    next: (providers) => {
      this.providers = providers;
      this.isLoading = false;
    },
    error: err => {
      console.error('Error getting providers ' + err);
      this.isLoading = false;
    }
    })
  }

  onAdd() {
    this.router.navigate(['provider/add'])
  }

  onEdit(provider: Provider) {
    this.router.navigate(['provider/edit'], {
      state: {
        provider: { ...provider },
        method: 'update'
      }
    });
  }

  onDelete(provider: Provider) {
    this.isLoading = true;
    this._providerPageService.deleteProvider(provider).subscribe({
      next: () => {
        this.loadDefaultData();
        this.toastr.success('Proveedor eliminado correctamente', 'Éxito');
        this.isLoading = false;
      },
      error: err => {
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
