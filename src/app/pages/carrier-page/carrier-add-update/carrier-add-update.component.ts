import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GenericFormComponent } from '../../../shared/components/generic-form/generic-form.component';
import { CommonModule } from '@angular/common';
import { CarrierAddUpdateService } from './carrier-add-update.service';
import { Carrier } from '../../../core/models/carrier.model';
import { regex } from '../../../shared/utils/regex';
import { Observable } from 'rxjs';

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
      this.initialCarrierData = state.carrier;
    }
  }

  // Regex per validar tel i correus
  checkData(carrier: Carrier): Boolean {
    if (!regex.emailRegex.test(carrier.email)) {
      this.toastr.error('El correo electrónico no es válido', 'Error');
      return false;
    }
    if (regex.phoneRegex.test(carrier.tel1)) {
      this.toastr.error('El número de teléfono 1 no es válido', 'Error');
      return false;
    };
    if (regex.phoneRegex.test(carrier.tel2)) {
      this.toastr.error('El número de teléfono 2 no es válido', 'Error');
      return false;
    };
    return true;
  }

  onSubmit(carrier: Carrier) {
    this.isLoading = true;
    if (this.checkData(carrier)) {

      let request: Observable<any>;

      if (this.method === 'post') {
        request = this._carrierAddUpdateService.storeCarrier(carrier);
      } else {
        if (!this.initialCarrierData?.transporte_id) return;
        request = this._carrierAddUpdateService.updateCarrier(carrier, this.initialCarrierData?.transporte_id);
      }

      request.subscribe({
        next: () => {
          this.router.navigate(['carrier']);
          this.method === 'update' ? this.toastr.success('Transportista añadido correctamente', 'Éxito') : this.toastr.success('Transportista modificado correctamente', 'Éxito');
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
            console.error('Error al añadir o modificar transportista', err);
          }
          this.isLoading = false;
        }
      })
    }
  }
}
