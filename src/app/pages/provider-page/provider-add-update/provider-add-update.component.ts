import { Component, OnInit } from '@angular/core';
import { GenericFormComponent } from '../../../shared/components/generic-form/generic-form.component';
import { ProviderAddService } from './provider-add-update.service';
import { Provider } from '../../../core/models/proveedor.model';
import { regex } from '../../../shared/utils/regex';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Entidad } from '../../../core/models/entidad.model';

@Component({
  selector: 'app-provider-add',
  standalone: true,
  templateUrl: './provider-add-update.component.html',
  imports: [GenericFormComponent, CommonModule],
})

export class ProviderAddUpdateComponent implements OnInit {

  providers: Provider[] = [];
  method: 'post' | 'update' = 'post';
  initialProviderData: Provider | null = null;

  isLoading: boolean = false;

  constructor(
    private _providerAddService: ProviderAddService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit() {
    const state = history.state;
    if (state.method === 'update') {
      this.method = 'update';
      const { entidad, ...rest } = state.provider;
      this.initialProviderData = { ...entidad, ...rest };
    }
  }

  // Regex per validar tel i correus
  checkData(provider: Provider): Boolean {
    if (!regex.emailRegex.test(provider?.entidad.email)) {
      this.toastr.error('El correo electrónico no es válido', 'Error');
      return false;
    }
    if (!regex.emailRegex.test(provider?.email_notificaciones)) {
      this.toastr.error('El correo electrónico de notificaciones no es válido', 'Error');
      return false;
    }
    if (regex.phoneRegex.test(provider?.entidad?.telefono1)) {
      this.toastr.error('El número de teléfono 1 no es válido', 'Error');
      return false;
    };
    if (regex.phoneRegex.test(provider?.entidad?.telefono2|| '')) {
      this.toastr.error('El número de teléfono 2 no es válido', 'Error');
      return false;
    };
    return true;
  }

  onSubmit(data: any) {

    const entidad : Entidad= {
      nombre: data?.nombre,
      abreviatura: data?.abreviatura,
      nif: data?.nif,
      pin: data?.pin,
      nombre_contacto: data?.nombre_contacto,
      email: data?.email,
      telefono1: data?.telefono1,
      telefono2: data?.telefono2,
      alerta: data?.alerta === 1, // convertir a boolean
      idioma: data?.idioma,
    }

    const proveedor: Provider = {
      tipo_proveedor_id:  Number(data?.tipo_proveedor_id),
      entidad: entidad,
      email_notificaciones: data?.email_notificaciones,
      codigo_sap: data?.codigo_sap,
    }

    if (this.checkData(proveedor)) {
      this.isLoading = true;
      let request: Observable<any>;

      if (this.method === 'post') {
        request = this._providerAddService.storeProvider(proveedor);
      } else {
        if (!this.initialProviderData?.proveedor_id) return;
        request = this._providerAddService.updateProvider(proveedor,this.initialProviderData?.proveedor_id);
      }

      request.subscribe({
        next: () => {
          this.router.navigate(['provider']);
          this.method === 'post'? this.toastr.success('Proveedor añadido correctamente', 'Éxito') : this.toastr.success('Proveedor modificado correctamente', 'Éxito');
          this.isLoading = false;
        },
        error: (err) => {
          this.toastr.error(err.error.message || 'Ha ocurrido un error', 'Error');
          this.isLoading = false;
        }
      })
    }
  }
}
