import { Component, OnInit } from '@angular/core';
import { GenericFormComponent } from '../../../shared/components/generic-form/generic-form.component';
import { CommonModule } from '@angular/common';
import { Status } from '../../../core/models/estado.model';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StatusAddUpdateService } from './status-add-update.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-status-add-update',
  standalone: true,
  templateUrl: './status-add-update.component.html',
  imports: [GenericFormComponent, CommonModule]
})
export class StatusAddUpdateComponent implements OnInit {

  initialStatusData: Status | null = null;
  method: 'post' | 'update' = 'post';

  isLoading: Boolean = false;
  constructor(
    private _statusAddUpdateService: StatusAddUpdateService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    const state = history.state;
    if (state.method === 'update') {
      this.method = 'update';
      this.initialStatusData = state.status;
    }
  }

  onSubmit(status: Status) {
    this.isLoading = true;

    let request: Observable<any>;

    if (this.method === 'post') {
      request = this._statusAddUpdateService.addStatus(status);
    } else {
      request = this.initialStatusData!.estado_id ? this._statusAddUpdateService.updateStatus(status, this.initialStatusData!.estado_id) : of(null);
    }

    request.subscribe({
        next: () => {
          this.method === 'post'? this.toastr.success('Status añadido correctamente', 'Éxito') : this.toastr.success('Status modificado correctamente', 'Éxito');
          this.isLoading = false;
          this.router.navigate(['status']);
        },
        error: (err) => {
            this.isLoading = false;
        }
    });
  }
}
