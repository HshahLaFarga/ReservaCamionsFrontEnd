import { Component, OnInit } from '@angular/core';
import { GenericListComponent } from '../../shared/components/generic-list/generic-list.component';
import { CommonModule } from '@angular/common';
import { Booking } from '../../core/models/reserva.model';
import { LockMuellePageService } from './lockMuelle-page.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmData, ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-muelleLock-page',
  standalone: true,
  templateUrl: './lockMuelle-page.component.html',
  imports: [GenericListComponent, CommonModule]
})
export class LockMuellePageComponent implements OnInit {

  lockMuelles: Booking[] = [];

  isLoading: Boolean = false;

  columns = [
    { key: 'muelle.nombre', label: 'Muelle' },
    { key: 'asunto', label: 'Asunto' },
    { key: 'inicio', label: 'Hora inicio' },
    { key: 'fin', label: 'Hora fin' },
  ];

  constructor(
    private _lockMuellePageService: LockMuellePageService,
    private toastr: ToastrService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.loadDefaultData();
  }

  loadDefaultData() {
    this._lockMuellePageService.getLockMuelles().subscribe({
      next: (lockMuelles: Booking[]) => {
        this.lockMuelles = lockMuelles;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onAdd() {
    this.router.navigate(['lock/muelles/add']);
  }

  onEdit(lockMuelle: Booking) {
    this.router.navigate(['lock/muelles/edit'], {
      state: {
        lockMuelle: { ...lockMuelle },
        method: 'update'
      }
    });
  }

  onDelete(lockMuelle: any) {
    const modalInformation: ConfirmData = {
      title: 'Eliminación de Bloqueo de Muelle',
      message: `¿Está seguro de que desea eliminar el bloqueo "<strong>${lockMuelle.asunto}</strong>"?`
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
        this.isLoading = true;
        this._lockMuellePageService.deleteLockMuelles(lockMuelle).subscribe({
          next: () => {
            this.toastr.success('Bloqueo eliminado correctamente', 'Éxito');
            this.loadDefaultData();
            this.isLoading = false;
          },
          error: (err) => {
            this.toastr.error('Error eliminando el bloqueo', 'Error');
            console.error('Error deleting lockMuelle', err);
            this.isLoading = false;
          }
        });
      }
    });
  }
}
