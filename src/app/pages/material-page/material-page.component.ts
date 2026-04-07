import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { GenericListComponent } from '../../shared/components/generic-list/generic-list.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MaterialPageService } from './material-page.service';
import { Material } from '../../core/models/material.model';
import { TipoCamion } from '../../core/models/tipo_camion.model';
import { Muelle } from '../../core/models/muelle.model';

@Component({
  selector: 'app-material-page',
  standalone: true,
  templateUrl: './material-page.component.html',
  imports: [CommonModule, GenericListComponent]
})
export class MaterialPageComponent implements OnInit {

  materials: Material[] = [];

  isLoading: boolean = false;

  columns = [
    { key: 'codigo_sap', label: 'Codi Sap' },
    { key: 'nombre', label: 'Nombre Material' },
    { key: 'estadoFormated', label: 'Estado' },
    { key: 'conjuntoCamiones', label: 'Camiones Permitidos'},
    { key: 'conjuntoMuelles', label: 'Muelles Permitidos'}
  ];

  constructor(
    private _materialPageService: MaterialPageService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.loadDefaultData();
  }

  loadDefaultData() {
    // Obtenim la info i la formatem acord perquè la puguem passar correctament al genèric list
    this._materialPageService.getMaterials().subscribe({
      next: (materials) => {
        this.materials = materials.map((material: Material) => {
          // Formatem el camp d'estat
          
          if (material.tipo_camiones && material.tipo_camiones.length > 0) {
            const nombresCamiones = material.tipo_camiones.map((tipoCamion: TipoCamion) => tipoCamion.nombre);
            material.conjuntoCamiones = nombresCamiones.join(', ');
          }

          if (material.muelles && material.muelles.length > 0) {
            const nombresMuelles = material.muelles.map((muelle: Muelle) => muelle.nombre);
            material.conjuntoMuelles = nombresMuelles.join(', ');
          }

          return material;
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = true;
      }
    })
  }

  onAdd() {
    this.router.navigate(['materials/add']);
  }

  onEdit(material: Material) {
    this.router.navigate(['materials/edit'], {
      state: {
        material: { ...material },
        method: 'update'
      }
    });
  }

  onDelete(material: Material) {
    this.isLoading = true;
    this._materialPageService.deleteProvider(material).subscribe({
      next: () => {
        this.loadDefaultData();
        this.toastr.success('Material eliminado correctamente', 'Éxito');
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }
}
