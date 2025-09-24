import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GenericListComponent } from '../../shared/components/generic-list/generic-list.component';
import { CommonModule } from '@angular/common';
import { StatusPageService } from './status-page.service';
import { Status } from '../../core/models/status.model';

@Component({
  selector: 'app-status-page',
  standalone: true,
  templateUrl: './status-page.component.html',
  imports: [GenericListComponent, CommonModule]
})
export class StatusPageComponent implements OnInit {

  status: Status[] | [] = [];
  columns = [
    { key: 'nombre', label: 'Nombre Status' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'estadoFormated', label: 'Estado' },
  ];

  isLoading: Boolean = false;

  constructor(
    private _statusPageService: StatusPageService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    this.loadDefaultData()
  }

  loadDefaultData(){
    this.isLoading = true;
    this._statusPageService.getStatus().subscribe({
        next: (status: Status[]) => {
          this.status = status.map((stat) => {
            stat.estado === 1 ? stat.estadoFormated = 'Activo' : stat.estadoFormated = 'Inactivo';
            return stat;
          });
          this.isLoading = false;
        },
        error: (err) => {
            console.error(err);
        }
    });
  }

  onAdd() {
    this.router.navigate(['status/add']);
  }

  onEdit(status: Status) {
    this.router.navigate(['status/edit'], {
      state: {
        status: { ...status },
        method: 'update'
      }
    });
  }

  onDelete(status: Status) {
    this.isLoading = true;
    this._statusPageService.deleteStatus(status.status_id).subscribe({
        next: () => {
          this.toastr.success('Status eliminado correctamente','Éxito');
          this.isLoading = false;
        },
        error: (err) => {
            console.error(err);
            this.isLoading = false;
        }
    });
  }

}
