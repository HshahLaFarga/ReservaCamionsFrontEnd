import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingAddService } from '../../booking-page/booking-add-update/booking-add-update.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'
import { ProviderType } from '../../../core/models/provider.module';
import { Material } from '../../../core/models/material.module';
import { MaterialLockAddService } from './material-lock-add.service';
import { map, startWith } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MaterialLock } from '../../../core/models/material-lock.module';
import { dateRangeValidator } from '../../../shared/utils/date.utils';

@Component({
  selector: 'app-material-lock-add',
  standalone: true,
  templateUrl: './material-lock-add.component.html',
  imports: [CommonModule, ReactiveFormsModule, MatAutocompleteModule, MatInputModule, MatOptionModule, MatFormFieldModule]
})

export class MaterialLockAddComponent implements OnInit {
  method: string = '';
  pedidoForm!: FormGroup;

  materials: Material[] = [];
  selectedMaterials: Material[] = [];
  materialSearch: string = '';
  providers_type: ProviderType[] = [];

  isLoading: boolean = false;

  materialControl: FormControl = new FormControl('');
  filteredMaterials: Material[] = [];

  constructor(
    private fb: FormBuilder,
    private _materialLockAddService: MaterialLockAddService,
    private router: Router
  ) { }

  ngOnInit() {
    this.pedidoForm = this.buildForm();
    this.loadDefaultData();
  }

  loadDefaultData() {
    this._materialLockAddService.getTypeProviders().subscribe((providers_type) => {
      this.providers_type = providers_type;
    });
    this._materialLockAddService.getMaterials().subscribe((materials) => {
      this.materials = materials;
      this.filteredMaterials = this.materials.slice();
    });
    // Filtrat reactiu
    this.materialControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.name),
      map(name => name ? this._filterMaterials(name) : this.materials.slice())
    ).subscribe(filtered => {
      this.filteredMaterials = filtered;
    });

    this.pedidoForm.get('cantidad_total')?.valueChanges.subscribe((total: number) => {
      this.pedidoForm.get('cantidad_disponible')?.setValue(total, { emitEvent: false });
    });
  }

  buildForm(): FormGroup {
    return this.fb.group({
      tipo_proveedor_id: ['', Validators.required],
      cantidad_total: [0, [Validators.required, Validators.min(1)]],
      cantidad_disponible: [0, [Validators.required, Validators.min(1)]],
      fecha_desde: ['', Validators.required],
      fecha_hasta: ['', Validators.required],
      materiales: [[], Validators.required],
    });
  }

  private _filterMaterials(name: string): Material[] {
    const filterValue = name.toLowerCase();
    return this.materials.filter(material =>
      material.nombre_material.toLowerCase().includes(filterValue) &&
      !this.selectedMaterials.some(m => m.material_id === material.material_id)
    );
  }

  onMaterialSelected(selected: Material): void {
    if (!this.selectedMaterials.some(m => m.material_id === selected.material_id)) {
      this.selectedMaterials.push(selected);
      this.pedidoForm.get('materiales')?.setValue(this.selectedMaterials);
    }
    this.materialControl.setValue(''); // Neteja l’input
  }

  deleteMaterialFromArray(index: number): void {
    this.selectedMaterials.splice(index, 1);
    this.pedidoForm.get('materiales')?.setValue(this.selectedMaterials);
  }


  onSubmit() {
    if (!this.pedidoForm.invalid) {
      const materialLock = {
        tipo_proveedor_id: parseInt(this.pedidoForm.get('tipo_proveedor_id')?.value),
        cantidad_total: this.pedidoForm.get('cantidad_total')?.value,
        cantidad_disponible: this.pedidoForm.get('cantidad_disponible')?.value,
        fecha_desde: this.pedidoForm.get('fecha_desde')?.value,
        fecha_hasta: this.pedidoForm.get('fecha_hasta')?.value,
        detalles: this.pedidoForm.get('materiales')?.value,
      }

      if (materialLock.cantidad_disponible !== materialLock.cantidad_total) {
        this.pedidoForm.patchValue({
          cantidad_total: null,
          cantidad_disponible: null
        });
        return;
      }
      if (!dateRangeValidator(this.pedidoForm.get('fecha_desde')?.value, this.pedidoForm.get('fecha_hasta')?.value)) {
        this.pedidoForm.patchValue({
          fecha_desde: null,
          fecha_hasta: null
        });
        return;
      }

      this._materialLockAddService.storeMaterial(materialLock).subscribe({
        next: (value) => {
          console.log('entra?');
          this.router.navigate(['/materials/lock']);
        },
        error: (err) => {
          console.error('Error creating materialLock ' + err);
        },
      });
    }
  }
}
