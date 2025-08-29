import { Component, OnInit } from '@angular/core';
import { GenericListComponent } from '../../shared/components/generic-list/generic-list.component';
import { CommonModule } from '@angular/common';
import { Booking } from '../../core/models/booking.model';
import { LockMuellePageService } from './lockMuelle-page.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

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
    { key: 'notas', label: 'Asunto' },
    { key: 'muelle1.nombre_muelle', label: 'Muelle' },
    { key: 'inicio1', label: 'Hora inicio' },
    { key: 'fin1', label: 'Hora fin' },
  ];

  constructor(
    private _lockMuellePageService: LockMuellePageService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadDefaultData();
  }

  loadDefaultData(){
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

  onDelete($event: any) {
    // 
  }
}
