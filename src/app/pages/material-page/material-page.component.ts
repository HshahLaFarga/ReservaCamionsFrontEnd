import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { GenericListComponent } from '../../shared/components/generic-list/generic-list.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MaterialPageService } from './material-page.service';
import { Material, MaterialMuelleControl } from '../../core/models/material.module';

@Component({
  selector: 'app-material-page',
  standalone: true,
  templateUrl: './material-page.component.html',
  imports: [CommonModule, GenericListComponent]
})
export class MaterialPageComponent implements OnInit {

  materials: Material[] = [];
  columns = [
    { key: 'codigo_sap', label: 'Codi Sap' },
    { key: 'nombre_material', label: 'Nombre Material' },
    { key: 'estadoFormated', label: 'Estat' },
    { key: 'conjuntoCamiones', label: 'Camiones Permitidos'},
    { key: 'conjuntoMuelles', label: 'Muelles Permitidos'}
  ];

  constructor(
    private _materialPageService: MaterialPageService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.loadDefaultData();
  }

  loadDefaultData() {
    // Obtenim la info i la formatem acord perquè la puguem passar correctament al genèric list
    this._materialPageService.getMaterials().subscribe({
      next: (materials) => {
        this.materials = materials.map((material: Material) => {
          // Formatem el camp d'estat
          material.estadoFormated = material.estado === 1 ? 'Activo' : 'Inactivo';

          if (material.control_material_muelle.length > 0) {
            // Fem el set per evitar repetits
            const nomsCamionsUnics = Array.from(
              new Set(
                material.control_material_muelle
                  .map((controlMaterialMuelle: MaterialMuelleControl) => controlMaterialMuelle.tipo_camion?.nombre)
                  .filter((nom): nom is string => !!nom)
              )
            );

            // Fem el set per evitar repetits
            const idsMollsUnics = Array.from(
              new Set(
                material.control_material_muelle
                  .map((controlMaterialMuelle: MaterialMuelleControl) => controlMaterialMuelle.muelle_id)
                  .filter((id): id is number => !!id)
              )
            );
            // Guardem el nou valor per els molls
            material.conjuntoCamiones = nomsCamionsUnics.join('<br>');
            material.conjuntoMuelles = idsMollsUnics;
          }

          return material;
        });
      },
      error: (err) => {
        console.error('Error getting materials', err);
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
    this._materialPageService.deleteProvider(material).subscribe({
      next: () => {
        this.loadDefaultData();
        this.toastr.success('Material eliminado correctamente', 'Éxito');
      }
    });
  }
}
