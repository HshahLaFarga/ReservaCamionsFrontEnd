import { Component, Injectable, OnInit } from '@angular/core';
import { GenericListComponent } from '../../shared/components/generic-list/generic-list.component';
import { Provider } from '../../core/models/provider.module';
import { ProviderPageService } from './provider-page.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-provider-page',
  standalone: true,
  templateUrl: './provider-page.component.html',
  imports: [GenericListComponent],
})

export class ProviderPageComponent implements OnInit {
  providers: Provider[] = [];

  columns = [
    { key: 'nombre', label: 'Nombre Proveedor' },
    { key: 'NIF', label: 'NIF' },
    { key: 'email', label: 'Correo' },
    { key: 'tel1', label: 'Telf. 1' },
    { key: 'tel2', label: 'Telf. 2' },
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
    this.getProviders();
  }

  getProviders(){
    this._providerPageService.getProviders().subscribe({
    next: (providers) => {
      this.providers = providers;
    },
    error: err => {
      console.error('Error getting providers ' + err);
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
    this._providerPageService.deleteProvider(provider).subscribe({
      next: () => {
        this.loadDefaultData();
        this.toastr.success('Proveedor eliminado correctamente', 'Éxito');
      },
      error: err => {
        if (err.error.id === 1) {
          this.toastr.error(err.error.message, 'Error');
        } else  {
          console.error('Error getting providers ', err);
        }
      }
    });
  }
}
