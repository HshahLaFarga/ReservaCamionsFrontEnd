import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
 import {MatCheckboxModule} from '@angular/material/checkbox'; 
import { TranslateModule } from '@ngx-translate/core';
import { RestrictionService } from './restriction.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Restriction } from '../../core/models/restriccion.model';
import { Muelle } from '../../core/models/muelle.model';


@Component({
  selector: 'app-restriction-page',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    TranslateModule
  ],
  templateUrl: './restriction-page.component.html',
  styles: `
    .title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.table-wrapper {
  overflow-x: auto;
}

.matrix-table {
  border-collapse: collapse;
  width: 100%;
  min-width: 800px;
  text-align: center;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    min-width: 100px;
  }

  th {
    background: #444;
    color: white;
    font-weight: 500;
  }

  td {
    background: white;
  }

  td.diagonal {
    background: #444;
  }
}

.actions {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

  `
})
export class RestrictionPageComponent {

  restricctions: Restriction[] = [];
  originalSet = new Set<string>(); // restricciones originales
  muelles: Muelle[] = [];
  rows: { id: number, nombre: string }[] = [];
  headers: { id: number, nombre: string }[] = [];
  matrix: any = {};

  constructor(
      private _restrictionService: RestrictionService,
      private router: Router,
      private toastr: ToastrService,
      private dialog: MatDialog
    ) {}

    ngOnInit() {
    this._restrictionService.getMuelles().subscribe({
    next: (muelles: Muelle[]) => {
      this.muelles = muelles;

      // Construimos headers y rows con ID + nombre
      this.headers = muelles.map(m => ({ id: m.muelle_id, nombre: m.nombre }));
      this.rows = [...this.headers];

      // Inicializamos matriz en false
      muelles.forEach(m1 => {
        this.matrix[m1.muelle_id] = {};
        muelles.forEach(m2 => {
          this.matrix[m1.muelle_id][m2.muelle_id] = false;
        });
      });

      // Ahora cargamos restricciones
      this._restrictionService.getRestricciones().subscribe({
        next: (restricciones: Restriction[]) => {
          this.restricctions = restricciones;
          restricciones.forEach(r => {
            this.matrix[r.muelle_id][r.muelle_restringido_id] = true;
            this.originalSet.add(`${r.muelle_id}-${r.muelle_restringido_id}`);
          });
        }
      });
    }
  });

  }

  saveMatrix() {
    const toAdd: { muelle_id: number, muelle_restringido_id: number }[] = [];
  const toDelete: { muelle_id: number, muelle_restringido_id: number }[] = [];

  this.rows.forEach(row => {
    this.headers.forEach(col => {
      if (row.id !== col.id) {
        const key = `${row.id}-${col.id}`;
        const checked = this.matrix[row.id][col.id];

        if (checked && !this.originalSet.has(key)) {
          // Nueva restricción marcada
          toAdd.push({ muelle_id: row.id, muelle_restringido_id: col.id });
        }

        if (!checked && this.originalSet.has(key)) {
          // Restricción eliminada
          toDelete.push({ muelle_id: row.id, muelle_restringido_id: col.id });
        }
      }
    });
  });

  console.log("Añadir:", toAdd);
  console.log("Eliminar:", toDelete);

  // Aquí llamas al service
  if (toAdd.length) {
    this._restrictionService.addRestriccion(toAdd).subscribe({
      next: () => this.toastr.success("Restricciones añadidas"),
      error: () => this.toastr.error("Error al añadir restricciones")
    });
  }

  if (toDelete.length) {
    this._restrictionService.deleteRestriccion(toDelete).subscribe({
      next: () => this.toastr.success("Restricciones eliminadas"),
      error: () => this.toastr.error("Error al eliminar restricciones")
    });
  }
  }

  onAdd(){
    this.router.navigate(['restrictions/add']);
  }

  /**
   * El dia que se quiera pasar d ebidereccional a unidireccional, este es el método que hay que modificar y simplemente eliminar este código y quitar el evento (change) al checkbox
   * @param rowId 
   * @param colId 
   * @param checked 
   */
  onCheckboxChange(rowId: number, colId: number, checked: boolean) {
    // Marcar espejo si es bidireccional
    this.matrix[colId][rowId] = checked;
    console.log('changed: ' + colId, rowId, checked);
  }
}
