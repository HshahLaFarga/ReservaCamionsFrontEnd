import { Component, OnInit } from '@angular/core';
import { GenericListComponent } from '../../shared/components/generic-list/generic-list.component';
import { CommonModule } from '@angular/common';
import { TipoCamion } from '../../core/models/tipo_camion.model';
import { TruckTypePageService } from './truckType-page.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConfirmData, ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-truckType-page',
  standalone: true,
  templateUrl: './truckType-page.component.html',
  imports: [GenericListComponent, CommonModule],
})
export class TruckTypePageComponent implements OnInit {

  // Estructura inicial component list
  columns = [
    { key: 'nombre', label: 'Nombre Tipo Camión' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'tiempo_descarga_1', label: 'Tiempo Descarga' },
    { key: 'bloqueo_muellesFormated', label: 'Bloqueo Muelles' },
  ];
  tipoCamiones: TipoCamion[] = [];

  isLoading: Boolean = false;

  constructor(
    private _truckTypePageService: TruckTypePageService,
    private router: Router,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.loadDefaultData();
  }

  loadDefaultData() {
    this.isLoading = true;
    // Obtenim tots els tipus de camions
    this._truckTypePageService.getTruckTypes().subscribe({
      next: (tipoCamiones) => {
        this.tipoCamiones = tipoCamiones.map((tipoCamion: TipoCamion) => {
          tipoCamion.bloqueo_muelles == true ? tipoCamion.bloqueo_muellesFormated = 'Si' : tipoCamion.bloqueo_muellesFormated = 'No';
          return tipoCamion
        });
        
        this.tipoCamiones = tipoCamiones;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  onAdd() {
    this.router.navigate(['trucks/type/add']);
  }

  onEdit(truck: TipoCamion) {
    this.router.navigate(['trucks/type/edit'], {
      state: {
        truck: { ...truck },
        method: 'update'
      }
    });
  }

  onDelete(truck: TipoCamion) {

    const modalInformation: ConfirmData = {
      title: 'Eliminación de Reserva',
      message: `¿Está seguro de que desea eliminar el tipo camión <strong>${truck.nombre}</strong> una vez hecho no se podrà recuperar?`
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

      this._truckTypePageService.deleteTruckType(truck.tipo_camion_id).subscribe({
        next: () => {
          this.loadDefaultData();
          this.toastr.success('Tipo Camión eliminado correctamente', 'Éxito');
        },
        error: (err) => {
          if (err.error.id === 1) {
            this.toastr.error(err.error.message, 'Error');
          } else {
            console.error(err);
          }
        }
      })
    });
  }
}
