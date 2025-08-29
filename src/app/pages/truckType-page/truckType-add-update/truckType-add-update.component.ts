import { Component, OnInit } from '@angular/core';
import { GenericFormComponent } from '../../../shared/components/generic-form/generic-form.component';
import { CommonModule } from '@angular/common';
import { Truck } from '../../../core/models/truck.model';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TruckTypeAddUpdateService } from './truckType-add-update.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-truckType-add-update',
  standalone: true,
  templateUrl: './truckType-add-update.component.html',
  imports: [CommonModule, GenericFormComponent]
})
export class TruckTypeAddUpdateComponent implements OnInit {

  initialTruckType: Truck | null = null;
  method: 'post' | 'update' = 'post';

  isLoading: Boolean = false;

  constructor(
    private _truckTypeAddUpadateService: TruckTypeAddUpdateService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    const state = history.state;
    if(state.method === 'update') {
      this.method = 'update';
      this.initialTruckType = state.truck;
    }
  }

  checkData(truck: Truck): Boolean {
    return true;
  }

  onSubmit(truck: Truck){
    this.isLoading = true;
    if (this.checkData(truck)) {
      let request!: Observable<any>;

      if (this.method === 'post') {
        // Validem que en el cas que l'usuari no marqui res, sigui 0
        if (truck.bloqueo_muelles.toString() === "") truck.bloqueo_muelles = 0;
        if (truck.estado.toString() === "") truck.estado = 0;

        request = this._truckTypeAddUpadateService.addTruckType(truck);
      } else if (this.method === 'update' && this.initialTruckType?.tipo_camion_id) {
        request = this._truckTypeAddUpadateService.updateTruckType(truck, this.initialTruckType.tipo_camion_id);
      }

      request.subscribe({
        next: () => {
          this.toastr.success('Tipo Camion añadido correctamente', 'Éxito');
          this.isLoading = false;
          this.router.navigate(['trucks/type']);
        },
        error: (err) => {
          if (err.error.id === 1) {
            this.toastr.error(err.error.message, 'Error');
          } else {
            console.error(err);
          }
          this.isLoading = false;
        }
      });
    }
  }
}
