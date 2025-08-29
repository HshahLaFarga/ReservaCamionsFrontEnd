import { Component, OnInit } from '@angular/core';
import { Muelle } from '../../../core/models/muelle.model';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { MuelleAddUpdateService } from './muelle-add-update.service';
import { GenericFormComponent } from '../../../shared/components/generic-form/generic-form.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-muelle-add-update',
  standalone: true,
  templateUrl: './muelle-add-update.component.html',
  imports: [GenericFormComponent,CommonModule]
})
export class MuelleAddUpdateComponent implements OnInit {

  muelles: Muelle[] = [];
  method: 'post' | 'update' = 'post';
  initialMuelleData: Muelle | null = null;

  isLoading: boolean = false;

  constructor(
    private __muelleAddUpdateService: MuelleAddUpdateService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit() {
    const state = history.state;
    if (state.method === 'update') {
      this.method = 'update';
      this.initialMuelleData = state.muelle;
    }
  }

  onSubmit(muelle: Muelle) {

      this.isLoading = true;

      let request: Observable<any>;

      if (this.method === 'post') {
        request = this.__muelleAddUpdateService.storeMuelle(muelle);
      } else {
        if (!this.initialMuelleData?.muelle_id) return;
        request = this.__muelleAddUpdateService.updateMuelle(muelle, this.initialMuelleData?.muelle_id);
      }

      request.subscribe({
        next: () => {
          this.router.navigate(['muelles']);
          this.method === 'update' ? this.toastr.success('Muelle añadido correctamente', 'Éxito') : this.toastr.success('Muelle modificado correctamente', 'Éxito');
          this.isLoading = false;
        },
        error: (err) => {
          if (err.error.message.includes('numero')) {
            this.toastr.error('El número ya está en uso', 'Error');
          } else if (err.error.message.includes('nombre muelle')) {
            this.toastr.error('El nombre del muelle ya está en uso', 'Error');
          } else {
            console.error('Error al añadir o modificar muelle', err);
          }
          this.isLoading = false;
        }
      })
  }

}
