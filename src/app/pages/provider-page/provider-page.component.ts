import { Component, Injectable, OnInit } from '@angular/core';
import { GenericListComponent } from '../../shared/components/generic-list/generic-list.component';
import { Provider } from '../../core/models/provider.module';
import { ProviderPageService } from './provider-page.service';

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
    { key: 'tle1', label: 'Telf. 1' },
    { key: 'tel2', label: 'Telf. 2' },
    { key: 'tipo_proveedor_id', label: 'ID tipo proveedor' },
  ];

  constructor(
    private _providerPageService: ProviderPageService
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

  onEdit(item: Provider) {
    console.log('Editar', item);
  }

  onDelete(item: Provider) {
    console.log('Esborrar', item);
  }
}
