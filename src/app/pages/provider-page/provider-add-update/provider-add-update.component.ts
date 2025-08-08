import { Component, OnInit } from '@angular/core';
import { GenericFormComponent } from '../../../shared/components/generic-form/generic-form.component';
import { ProviderAddService } from './provider-add-update.service';
import { Provider } from '../../../core/models/provider.module';
import { regex } from '../../../shared/utils/regex';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

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

  constructor(
    private _providerAddService: ProviderAddService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit() {
    const state = history.state;
    if (state.method === 'update') {
      this.method = 'update';
      this.initialProviderData = state.provider;
    }
  }

  // Regex per validar tel i correus
  checkData(provider: Provider): Boolean {
    if (!regex.emailRegex.test(provider.email)) {
      this.toastr.error('El correo electrónico no es válido', 'Error');
      return false;
    }
    if (!regex.emailRegex.test(provider.notificaciones_email)) {
      this.toastr.error('El correo electrónico no es válido', 'Error');
      return false;
    }
    if (regex.phoneRegex.test(provider.tel1)) {
      this.toastr.error('El número de teléfono 1 no es válido', 'Error');
      return false;
    };
    if (regex.phoneRegex.test(provider.tel2)) {
      this.toastr.error('El número de teléfono 2 no es válido', 'Error');
      return false;
    };
    return true;
  }

  onSubmit(provider: Provider) {
    if (this.checkData(provider)) {

      let request: Observable<any>;

      if (this.method === 'post') {
        request = this._providerAddService.storeProvider(provider);
      } else {
        if (!this.initialProviderData?.proveedor_id) return;
        request = this._providerAddService.updateProvider(provider,this.initialProviderData?.proveedor_id);
      }

      request.subscribe({
        next: (response) => {
          this.router.navigate(['provider']);
          this.method === 'update'? this.toastr.success('Proveedor añadido correctamente', 'Éxito') : this.toastr.success('Proveedor modificado correctamente', 'Éxito');
        },
        error: (err) => {
          if (err.error.message.includes('email')) {
            this.toastr.error('El correo electrónico ya está en uso', 'Error');
          } else if (err.error.message.includes('tel')) {
            this.toastr.error('El número de teléfono ya está en uso', 'Error');
          } else if (err.error.message.includes('n i f')) {
            this.toastr.error('El NIF ya esta en uso', 'Error');
          } else {
            console.error('Error al añadir o modificar proveedor', err);
          }
        }
      })
    }
  }
}
