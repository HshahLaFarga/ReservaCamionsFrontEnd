import { Component, OnInit } from '@angular/core';
import { TimingMuelle } from '../../core/models/timingMuelle.model';
import { GenericListComponent } from '../../shared/components/generic-list/generic-list.component';
import { CommonModule } from '@angular/common';
import { TimingMuellePageService } from './timingMuelle-page.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

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
    { key: 'inicio', label: 'Inicio' },
    { key: 'fin', label: 'Fin' },
    { key: 'muelle.nombre_muelle', label: 'Nombre Muelle' },
  ];

  isLoading: Boolean = false;

  constructor(
    private _timingMuellePageService: TimingMuellePageService,
    private router: Router,
    private toastr: ToastrService
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
    throw new Error('Method not implemented.');
  }
}
