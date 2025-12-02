import { CommonModule } from '@angular/common';
import { Component, Provider } from '@angular/core';
import { GenericFormComponent } from '../../../shared/components/generic-form/generic-form.component';
import { TipoProveedor } from '../../../core/models/proveedor.model';
import { ProviderTypeAddUpdateService } from './provider-type-add-update.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-provider-type-add-update',
  standalone: true,
  imports: [CommonModule, GenericFormComponent],
  templateUrl: './provider-type-add-update.component.html',
  styles: ``,
})
export class ProviderTypeAddUpdateComponent {
  initialProviderType: TipoProveedor | null = null;
  method: 'post' | 'update' = 'post';

  isLoading: Boolean = false;

  constructor(
    private _ProviderTypeService: ProviderTypeAddUpdateService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    const state = history.state;
    if (state.method === 'update') {
      this.method = 'update';
      this.initialProviderType = state.provider;
    }
  }

  checkData(provider: Provider): Boolean {
    return true;
  }

  onSubmit(provider: any) {
    this.isLoading = true;
    if (this.checkData(provider)) {
      let request!: Observable<any>;

      if (this.method === 'post') {
        request = this._ProviderTypeService.addProviderType(provider);
      } else if (
        this.method === 'update' &&
        this.initialProviderType?.tipo_proveedor_id
      ) {
        request = this._ProviderTypeService.updateProviderType(
          provider,
          this.initialProviderType.tipo_proveedor_id
        );
      }

      request.subscribe({
        next: () => {
          this.toastr.success('Tipo Camion añadido correctamente', 'Éxito');
          this.isLoading = false;
          this.router.navigate(['provider/type']);
        },
        error: (err) => {
          if (err.error.id === 1) {
            this.toastr.error(err.error.message, 'Error');
          } else {
            console.error(err);
          }
          this.isLoading = false;
        },
      });
    }
  }
}
