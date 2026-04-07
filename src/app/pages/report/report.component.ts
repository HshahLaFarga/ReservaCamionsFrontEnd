import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';
import { ReportService } from './report.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, FormsModule,CommonModule ],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './report.component.html',
  styles: ``,
})
export class ReportComponent {
  from: Date | null = null;
  to: Date | null = null;
  isLoading: boolean = false;

  constructor(
    private _reportService: ReportService,
    private toastr: ToastrService
  ) { }

  generateReport(): void {
    if (this.from && this.to) {
      this.toastr.success('Generando informe', 'Éxito');
      // Aquí puedes agregar la lógica para generar el reporte
      this._reportService.getReport(this.from, this.to).subscribe({
        next: (report) => {
          const url = window.URL.createObjectURL(report);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'informe_reservas.csv';
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          this.toastr.error('Error al generar el informe', 'Error');
        }
      });
    } else {
    }
  }
}
