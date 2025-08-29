import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
 import {MatCheckboxModule} from '@angular/material/checkbox'; 

@Component({
  selector: 'app-restriction-page',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule],
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
  headers = [
    '1 - CANAL',
    '2 - COSMELT',
    '3 - RF',
    '4 - FRAGMENTADORA',
    '5 - CATODO',
    '6 - LFR',
    '7 - LFR'
  ];

  rows = [
    '1 - CANAL',
    '2 - COSMELT',
    '3 - RF',
    '4 - FRAGMENTADORA',
    '5 - CATODO',
    '6 - LFR',
    '7 - LFR'
  ];

  // Estado de los checkboxes
  matrix: any = {
    '1 - CANAL': { '2 - COSMELT': true, '3 - RF': true, '4 - FRAGMENTADORA': true, '5 - CATODO': true, '6 - LFR': false, '7 - LFR': false },
    '2 - COSMELT': { '1 - CANAL': true, '3 - RF': true, '4 - FRAGMENTADORA': true, '5 - CATODO': true, '6 - LFR': false, '7 - LFR': false },
    '3 - RF': { '1 - CANAL': true, '2 - COSMELT': true, '4 - FRAGMENTADORA': true, '5 - CATODO': true, '6 - LFR': false, '7 - LFR': false },
    '4 - FRAGMENTADORA': { '1 - CANAL': true, '2 - COSMELT': true, '3 - RF': true, '5 - CATODO': true, '6 - LFR': false, '7 - LFR': false },
    '5 - CATODO': { '1 - CANAL': true, '2 - COSMELT': true, '3 - RF': true, '4 - FRAGMENTADORA': true, '6 - LFR': false, '7 - LFR': false },
    '6 - LFR': { '1 - CANAL': false, '2 - COSMELT': false, '3 - RF': false, '4 - FRAGMENTADORA': false, '5 - CATODO': false, '7 - LFR': false },
    '7 - LFR': { '1 - CANAL': false, '2 - COSMELT': false, '3 - RF': false, '4 - FRAGMENTADORA': false, '5 - CATODO': false, '6 - LFR': false }
  };

   actualizar() {
    console.log(this.matrix);
  }
}
