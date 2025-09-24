import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WeightRangePageService } from './weightRange-page.service';
import { WeightRange } from '../../core/models/weightRange.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-weightRange-page',
  standalone: true,
  templateUrl: './weightRange-page.component.html',
  imports: [ReactiveFormsModule, CommonModule]
})

export class WeightRangePageComponent implements OnInit {

  form!: FormGroup;
  weightRange: WeightRange | null = null;
  isEditing: boolean = false;

  isLoading: Boolean = false;

  // Validador personalizado: max_kg >= min_kg
  maxGteMinValidator(group: FormGroup) {
    const min = group.get('min_kg')?.value;
    const max = group.get('max_kg')?.value;
    return max >= min ? null : { maxLessThanMin: true };
  }

  onSubmit(): void {
    this.isLoading = true;
    if (this.form.valid) {
      this._wegithRangePageService.updateWeightRange(this.form.value,this.weightRange!.rango_cantidad_id).subscribe({
          next: () => {
            this.loadDefaultData();
            this.toastr.success('Cantidad actualizada correctamente', ' Éxito');
            this.isEditing = false;
          },
          error: (err) => {
              console.error(err);
              this.isEditing = false;
              this.isLoading = false;
          }
      });;
    } else {
      this.form.markAllAsTouched();
    }
  }

  constructor(
    private _wegithRangePageService: WeightRangePageService,
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    this.loadDefaultData();
  }

  loadDefaultData() {
    this.isLoading = true;
    this._wegithRangePageService.getWeightRange().subscribe({
      next: (weightRange: WeightRange[]) => {
        // Fiquem directamente el de 0 per poder obtenir el primer ja que només n'hi ha un registre d'aquest
        this.weightRange = weightRange[0];
        this.isLoading = false;
        this.buildForm();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  buildForm() {
    this.form = this.fb.group({
      min_kg: [this.weightRange?.min_kg, [Validators.required, Validators.min(0)]],
      max_kg: [this.weightRange?.max_kg, [Validators.required]]
    }, { validators: this.maxGteMinValidator });
  }

  toggleEdit() {
    if (this.isEditing) {
      this.isEditing = false;
    } else {
      this.isEditing = true;
    }
  }
}
