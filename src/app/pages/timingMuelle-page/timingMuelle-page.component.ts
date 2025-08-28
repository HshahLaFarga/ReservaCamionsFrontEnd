import { Component, OnInit } from '@angular/core';
import { TimingMuelle } from '../../core/models/timingMuelle.model';
import { GenericListComponent } from '../../shared/components/generic-list/generic-list.component';
import { CommonModule } from '@angular/common';
import { TimingMuellePageService } from './timingMuelle-page.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmData, ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-timingMuelle-page',
  standalone: true,
  templateUrl: './timingMuelle-page.component.html',
  imports: [GenericListComponent, CommonModule]
})
export class TimingMuellePageComponent implements OnInit {

  timingMuelles: TimingMuelle[] = [];
  columns = [
    { key: 'dia', label: 'Día' },
    { key: 'num_dia', label: 'Numero Día' },
    { key: 'muelle.nombre_muelle', label: 'Nombre Muelle' },
    { key: 'inicio', label: 'Inicio' },
    { key: 'fin', label: 'Fin' },
  ];

  isLoading: Boolean = false;

  constructor(
    private _timingMuellePageService: TimingMuellePageService,
    private router: Router,
    private toastr: ToastrService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.loadDefaultData();
  }

  loadDefaultData(): void {
    this.isLoading = true;

    this._timingMuellePageService.getTimingMuelles().subscribe({
        next: (timingMuelles: TimingMuelle[]) => {
          this.timingMuelles = timingMuelles;
          this.isLoading = false;
        },
        error: (err) => {
            console.error(err);
            this.isLoading = false;
        }
    });
  }

  onAdd() {
    this.router.navigate(['/muelles/timing/add']);
  }

  onEdit(timingMuelle: TimingMuelle) {
    this.router.navigate(['/muelles/timing/edit'],{
      state: {
        method: 'update',
        timingMuelle: {...timingMuelle}
      }
    });
  }
  // pendent fer dialog
  onDelete(timingMuelle: TimingMuelle) {
    const modalInformation: ConfirmData = {
          title: 'Eliminación de Documento',
          message: `¿Está seguro de que desea eliminar el horario del muelle?, una vez eliminado no se podràn recuperar`,
        };

        const dialogRef = this.dialog.open(ConfirmModalComponent, {
          maxWidth: '95vw',
          width: '65%',
          maxHeight: '90vh',
          data: modalInformation,
          panelClass: 'app-confirm-modal',
        });

        dialogRef.afterClosed().subscribe((result: Boolean) => {
          if (result === true) {
            this._timingMuellePageService.deleteTimingMuelle(timingMuelle).subscribe({
                next: () => {
                  this.loadDefaultData();
                  this.toastr.success('Horario del muelle eliminado correctamente.','Éxito');
                },
                error: (err) => {
                  console.error(err);
                  this.toastr.success('Error al eliminar el horario del muelle','Error');
                }
            });;
          }
        });
  }
}
