import { Component } from '@angular/core';
import { TipoProveedor } from '../../core/models/proveedor.model';
import { ProviderTypeService } from './provider-type.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { GenericListComponent } from '../../shared/components/generic-list/generic-list.component';
import {
  ConfirmData,
  ConfirmModalComponent,
} from '../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-provider-type',
  standalone: true,
  imports: [GenericListComponent, CommonModule],
  templateUrl: './provider-type.component.html',
  styles: ``,
})
export class ProviderTypeComponent {
  // Estructura inicial component list
  columns = [{ key: 'nombre', label: 'Tipo proveedor' }];
  providerType: TipoProveedor[] = [];

  isLoading: Boolean = false;

  constructor(
    private _providerTypeService: ProviderTypeService,
    private router: Router,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadDefaultData();
  }

  loadDefaultData() {
    this.isLoading = true;
    // Obtenim tots els tipus de camions
    this._providerTypeService.getProviderType().subscribe({
      next: (providerType) => {
        this.providerType = providerType;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  onAdd() {
    this.router.navigate(['provider/type/add']);
  }

  onEdit(provider: TipoProveedor) {
    this.router.navigate(['provider/type/edit'], {
      state: {
        provider: { ...provider },
        method: 'update',
      },
    });
  }

  onDelete(proveedor: TipoProveedor) {
    const modalInformation: ConfirmData = {
      title: 'Eliminación de Reserva',
      message: `¿Está seguro de que desea eliminar el tipo camión <strong>${proveedor.nombre}</strong> una vez hecho no se podrà recuperar?`,
    };

    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      maxWidth: '95vw',
      width: '65%',
      maxHeight: '90vh',
      data: modalInformation,
      panelClass: 'app-confirm-modal',
    });

    dialogRef.afterClosed().subscribe((result: Boolean) => {
      if (result === false) return;

      this._providerTypeService
        .deleteProviderType(proveedor)
        .subscribe({
          next: () => {
            this.loadDefaultData();
            this.toastr.success(
              'Tipo Proveedor eliminado correctamente',
              'Éxito'
            );
          },
          error: (err) => {
            if (err.error.id === 1) {
              this.toastr.error(err.error.message, 'Error');
            } else {
              console.error(err);
            }
          },
        });
    });
  }
}
