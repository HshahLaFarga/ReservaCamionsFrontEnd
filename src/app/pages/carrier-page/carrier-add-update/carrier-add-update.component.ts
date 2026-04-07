import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GenericFormComponent } from '../../../shared/components/generic-form/generic-form.component';
import { CommonModule } from '@angular/common';
import { CarrierAddUpdateService } from './carrier-add-update.service';
import { Carrier } from '../../../core/models/transportista.model';
import { regex } from '../../../shared/utils/regex';
import { Observable } from 'rxjs';
import { Entidad } from '../../../core/models/entidad.model';

@Component({
  selector: 'app-carrier-add-update',
  standalone: true,
  templateUrl: './carrier-add-update.component.html',
  imports: [GenericFormComponent, CommonModule],
})

export class CarrierAddUpdateComponent implements OnInit {

  initialCarrierData: Carrier | null = null;
  method: 'post' | 'update' = 'post';

  isLoading: boolean = false;

  constructor(
    private _carrierAddUpdateService: CarrierAddUpdateService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    const state = history.state
    if (state.method === 'update') {
      this.method = state.method;
      const { entidad, ...rest } = state.carrier;
      this.initialCarrierData = { ...entidad, ...rest };
    }
  }

  // Regex per validar tel i correus
  checkData(Carrier: Carrier): Boolean {
    if (!regex.emailRegex.test(Carrier.entidad.email)) {
      this.toastr.error('El correo electrónico no es válido', 'Error');
      return false;
    }
    if (regex.phoneRegex.test(Carrier.entidad.telefono1)) {
      this.toastr.error('El número de teléfono 1 no es válido', 'Error');
      return false;
    };
    if (regex.phoneRegex.test(Carrier.entidad.telefono2 || '')) {
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

    const carrier: Carrier = {
      entidad: entidad,
      puede_gestionar: data?.puede_gestionar === 1, // convertir a boolean
    }

    if (this.checkData(carrier)) {
      this.isLoading = true;

      let request: Observable<any>;

      if (this.method === 'post') {
        request = this._carrierAddUpdateService.storeCarrier(carrier);
      } else {
        if (!this.initialCarrierData?.transportista_id) return;
        request = this._carrierAddUpdateService.updateCarrier(carrier, this.initialCarrierData?.transportista_id);
      }

      request.subscribe({
        next: () => {
          this.router.navigate(['transportista']);
          this.method === 'post' ? this.toastr.success('Transportista añadido correctamente', 'Éxito') : this.toastr.success('Transportista modificado correctamente', 'Éxito');
          this.isLoading = false;
        },
        error: (err) => {
          if (err.error.message.includes('email')) {
            this.toastr.error('El correo electrónico ya está en uso', 'Error');
          } else if (err.error.message.includes('tel')) {
            this.toastr.error('El número de teléfono ya está en uso', 'Error');
          } else if (err.error.message.includes('n i f')) {
            this.toastr.error('El NIF ya esta en uso', 'Error');
          } else {
          }
          this.isLoading = false;
        }
      })
    }
  }
}
