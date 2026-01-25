import { Component, OnInit } from '@angular/core';
import { GenericFormComponent } from '../../../shared/components/generic-form/generic-form.component';
import { TimingMuelleAddUpdateService } from './timingMuelle-add-update.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { HorarioMuelle } from '../../../core/models/horario_muelle';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-timingMuelle-add-update',
  standalone: true,
  templateUrl: './timingMuelle-add-update.component.html',
  imports: [GenericFormComponent, CommonModule]
})
export class TimingMuelleAddUpdateComponent implements OnInit {


  initialTimingMuelle: HorarioMuelle | null = null;
  method: 'post' | 'update' = 'post';

  isLoading: Boolean = false;

  constructor(
    private _timingMuelleAddUpdateService:  TimingMuelleAddUpdateService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    let state = history.state;

    if (state.method === 'update') {
      this.method = state.method
      this.initialTimingMuelle = state.timingMuelle
    }
  }

  onSubmit(timingMuelle: HorarioMuelle) {
    this.isLoading = true;

    let request:  Observable<any>;

    if (this.method === 'post') {
      request = this._timingMuelleAddUpdateService.addTimingMuelle(timingMuelle);
    } else {
      request = this.initialTimingMuelle?.horarios_muelle_id ? this._timingMuelleAddUpdateService.updateTimingMuelle(timingMuelle, this.initialTimingMuelle?.horarios_muelle_id) : of(null);
    }

    request.subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/muelles/timing']);
          this.method === 'post'? this.toastr.success('Horario del Muelle añadido correctamente', 'Éxito') : this.toastr.success('Horario del Muelle modificado correctamente', 'Éxito');
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error(err.error.message,'Error');
          console.error(err);
        }
    });
  }

}
