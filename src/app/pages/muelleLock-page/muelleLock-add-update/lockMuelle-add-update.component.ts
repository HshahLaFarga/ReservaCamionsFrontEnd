import { Component, OnInit } from '@angular/core';
import { GenericFormComponent } from '../../../shared/components/generic-form/generic-form.component';
import { CommonModule } from '@angular/common';
import { ReservaComponent } from '../../booking-page/reserva.component';
import { Booking } from '../../../core/models/reserva.model';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LockMuelleAddUpdateService } from './lockMuelle-add-update.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-muelleLock-add-update',
  standalone: true,
  templateUrl: './lockMuelle-add-update.component.html',
  imports: [GenericFormComponent, CommonModule]
})
export class LockMuelleAddUpdateComponent implements OnInit {

  initialLockMuelleData!: Booking;

  isLoading: Boolean = false;

  method: 'post' | 'update' = 'post';

  constructor(
    private _lockMuelleAddUpdateService: LockMuelleAddUpdateService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    const state = history.state;
    if (state.method === 'update') {
      this.method = 'update';
      this.initialLockMuelleData = state.lockMuelle;
    }
  }

  onSubmit(lockMuelle: Booking) {
    this.isLoading = true;

    let request!: Observable<any>;
    
    if (this.method === 'post') {
      request = this._lockMuelleAddUpdateService.addLockMuelle(lockMuelle);
    } else if (this.method === 'update' && this.initialLockMuelleData.reserva_id) {
      request = this._lockMuelleAddUpdateService.updateLockMuelle(lockMuelle, this.initialLockMuelleData.reserva_id);
    }

    request.subscribe({
        next: () => {
          this.method === 'post'? this.toastr.success('Bloqueo añadido correctamente', 'Éxito') : this.toastr.success('Bloqueo actualizado correctamente','Éxito');
          this.router.navigate(['lock/muelles']);
          this.isLoading = false;
        },
        error: (err) => {
            if (err.error.id === '1') {
              this.toastr.error(err.error.message, 'Error');
            } else {
              console.error('Error adding or updating lockMuelles ', err);
            }
            this.isLoading = false;
        }
    });
  }
}
