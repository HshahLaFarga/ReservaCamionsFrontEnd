import { Component, OnInit } from '@angular/core';
import { GenericListComponent } from '../../shared/components/generic-list/generic-list.component';
import { MaterialLockPageService } from './material-lock-page.service';
import { MaterialLock } from '../../core/models/material-lock.module';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-material-lock-page',
  standalone: true,
  templateUrl: './material-lock-page.component.html',
  imports: [GenericListComponent, CommonModule],
})

export class MaterialLockPageComponent implements OnInit {
  lockedMaterials: any[] = [];

  isLoading: boolean = false;

  columns = [
    { key: 'nombre', label: 'Nombre Proveedor' },
    { key: 'materiales', label: 'Nombre Materiales' },
    { key: 'cantidad', label: 'Cantidad Total' },
    { key: 'cantidadDisponible', label: 'Cantidad Disponible' },
    { key: 'inicio', label: 'Data Inicio' },
    { key: 'fin', label: 'Data Fin' },
  ];

  constructor(
    private _materialLockPageService: MaterialLockPageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDefaultData();
  }

  loadDefaultData(){
    this.isLoading = true;
    this.getMaterials();
  }

  getMaterials(){
    this._materialLockPageService.getMaterialLocks().subscribe({
    next: (lockedMaterials: MaterialLock[]) => {
      this.lockedMaterials = lockedMaterials.map((materialLock) => {
        return {
          nombre: materialLock.tipoproveedor.nombre,
          materiales: materialLock.detalles.length === 0? 'No hi han materials assignats' : materialLock.detalles.map(({material}) => `${material.nombre_material}`).join('<br>'),
          cantidad: materialLock.cantidad_total,
          cantidadDisponible: materialLock.cantidad_disponible,
          inicio: materialLock.fecha_desde,
          fin: materialLock.fecha_hasta,
          object: materialLock
        }
      });
      this.isLoading = false;
    },
    error: err => {
      console.error('Error getting providers ' + err);
      this.isLoading = false;
    }
    })
  }

  onAdd() {
    this.router.navigate(['/materials/lock/add'])
  }

  onEdit(item: MaterialLock) {
    console.log('Editar', item);
  }

  onDelete(item: MaterialLock) {
    this.isLoading = false;
    this._materialLockPageService.deleteMateialLocks(item).subscribe({
      next: () => {
        this.loadDefaultData();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    })
  }
}
