import { Component, OnInit } from '@angular/core';
import { Muelle } from '../../core/models/muelle.module';
import { MuellePageService } from './muelle-page.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GenericListComponent } from '../../shared/components/generic-list/generic-list.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-muelle-page',
  standalone: true,
  templateUrl: './muelle-page.component.html',
  imports: [GenericListComponent]
})
export class MuellePageComponent implements OnInit {
  muelles: Muelle[] = [];

  columns = [
    { key: 'nombre_muelle', label: 'Nombre Muelle' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'numero', label: 'Número' },
    { key: 'zona', label: 'Zona' },
    { key: 'abierto_festivosFormated', label: 'Abierto Festivos' },
    { key: 'color', label: 'Color Calendario' },
    { key: 'estadoFormated', label: 'Estado' },
    { key: 'empresa.nombre', label: 'Empresa' },
    { key: 'cantidad_acceptada', label: 'Cant. Acceptada' },
  ];

  constructor(
    private _muellePageService: MuellePageService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadDefaultData();
  }

  loadDefaultData(){
    this.getMuelles();
  }

  getMuelles(){
    this._muellePageService.getMuelles().subscribe({
    next: (muelles: Muelle[]) => {
      this.muelles = muelles.map((muelle) => {
        muelle.abierto_festivosFormated = muelle.abierto_festivos === 1? 'Abierto' : 'Cerrado';
        muelle.estadoFormated = muelle.estado === 1? 'Activo' : 'Inactivo';
        return muelle;
      });
    },
    error: err => {
      console.error('Error getting muelle ' + err);
    }
    })
  }

  onAdd() {
    this.router.navigate(['muelles/add'])
  }

  onEdit(muelle: Muelle) {
    this.router.navigate(['muelles/edit'], {
      state: {
        muelle: { ...muelle },
        method: 'update'
      }
    });
  }

  onDelete(muelle: Muelle) {
    this._muellePageService.deleteMuelles(muelle).subscribe({
      next: () => {
        this.loadDefaultData();
        this.toastr.success('Proveedor eliminado correctamente', 'Éxito');
      },
      error: err => {
        if (err.error.id === 1) {
          this.toastr.error(err.error.message, 'Error');
        } else  {
          console.error('Error getting muelle ', err);
        }
      }
    });
  }
}
