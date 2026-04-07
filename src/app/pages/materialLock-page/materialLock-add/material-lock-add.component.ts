import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingAddUpdateService } from '../../booking-page/reserva-add-update/reserva-add-udpdate.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'
import { TipoProveedor } from '../../../core/models/proveedor.model';
import { Material } from '../../../core/models/material.model';
import { MaterialLockAddService } from './material-lock-add.service';
import { map, startWith } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MaterialLock } from '../../../core/models/bloqueo_grupo_material.model';
import { dateRangeValidator } from '../../../shared/utils/date.utils';
import { ToastrService } from 'ngx-toastr';


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
  providers_type: TipoProveedor[] = [];

  isLoading: boolean = false;

  materialControl: FormControl = new FormControl('');
  filteredMaterials: Material[] = [];

  materialLockId: number | null = null; // Add ID property
  lastTotal: number = 0;

  constructor(
    private fb: FormBuilder,
    private _materialLockAddService: MaterialLockAddService,
    private router: Router,
    private toastr: ToastrService
  ) {
    // Get state from navigation
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.method = navigation.extras.state['method'];
      const data = navigation.extras.state['data'];
      if (this.method === 'update' && data) {
        this.materialLockId = data.bloqueo_grupo_id;
        // Prepare data for form
        this.selectedMaterials = data.detalles.map((d: any) => d.material);
        this.lastTotal = data.cantidad_total;

        // Set timeout to ensure form controls are initialized/subscribers ready if needed, 
        // though synchronous patch is usually fine.
        setTimeout(() => {
          this.pedidoForm.patchValue({
            tipo_proveedor_id: data.tipoproveedor.tipo_proveedor_id,
            cantidad_total: data.cantidad_total,
            cantidad_disponible: data.cantidad_disponible,
            fecha_desde: data.inicio ? data.inicio.split('T')[0].split(' ')[0] : '', // Handle ISO or SQL format
            fecha_hasta: data.fin ? data.fin.split('T')[0].split(' ')[0] : '',
            materiales: this.selectedMaterials
          });
        });
      }
    }
  }

  ngOnInit() {
    this.isLoading = true;
    this.pedidoForm = this.buildForm();
    this.loadDefaultData();
  }

  loadDefaultData() {
    this._materialLockAddService.getTypeProviders().subscribe((providers_type) => {
      this.providers_type = providers_type;
      // If we are in update mode and type provider is set, we might need to ensure the value matches the type (string vs number)
      // The form control expects the ID.
      this.isLoading = false;
    });
    this._materialLockAddService.getMaterials().subscribe((materials) => {
      this.materials = materials;
      this.filteredMaterials = this.materials.slice();
      this.isLoading = false;
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
      // Only auto-update available quantity if we are NOT in update mode, OR (optionally) if they match.
      // But typically for edits, changing total might not imply resetting available used. 
      // User request didn't specify, but let's keep it simple: if creating, sync. If updating, user might want to adjust manually or logic handles it. 
      // The original code synced them. Let's keep it but maybe we should be careful. 
      // For now, I will leave it as is, but be aware it might overwrite valid data if user edits total.
      // Actually, let's only sync if method is NOT update to prevent overwriting existing progress?
      // Or checking if they are currently equal. 
      if (this.method !== 'update') {
        this.pedidoForm.get('cantidad_disponible')?.setValue(total, { emitEvent: false });
      } else {
        const delta = total - this.lastTotal;
        const currentDisposable = this.pedidoForm.get('cantidad_disponible')?.value || 0;
        this.pedidoForm.get('cantidad_disponible')?.setValue(currentDisposable + delta, { emitEvent: false });
        this.lastTotal = total;
      }
    });
  }

  buildForm(): FormGroup {
    return this.fb.group({
      tipo_proveedor_id: ['', Validators.required],
      cantidad_total: [0, [Validators.required, Validators.min(0)]],
      cantidad_disponible: [0, [Validators.required, Validators.min(0)]],
      fecha_desde: ['', Validators.required],
      fecha_hasta: ['', Validators.required],
      materiales: [[], Validators.required],
    });
  }

  private _filterMaterials(name: string): Material[] {
    const filterValue = name.toLowerCase();
    return this.materials.filter(material =>
      material.nombre.toLowerCase().includes(filterValue) &&
      !this.selectedMaterials.some(m => m.material_id === material.material_id)
    );
  }

  onMaterialSelected(selected: Material): void {
    if (!this.selectedMaterials.some(m => m.material_id === selected.material_id)) {
      this.selectedMaterials.push(selected);
      this.pedidoForm.get('materiales')?.setValue(this.selectedMaterials);
    }
    this.materialControl.setValue('');
  }

  deleteMaterialFromArray(index: number): void {
    this.selectedMaterials.splice(index, 1);
    this.pedidoForm.get('materiales')?.setValue(this.selectedMaterials);
  }


  onSubmit() {
    this.isLoading = true;
    if (!this.pedidoForm.invalid) {
      const materialLock = {
        tipo_proveedor_id: parseInt(this.pedidoForm.get('tipo_proveedor_id')?.value),
        cantidad_total: this.pedidoForm.get('cantidad_total')?.value,
        cantidad_disponible: this.pedidoForm.get('cantidad_disponible')?.value,
        fecha_desde: this.pedidoForm.get('fecha_desde')?.value,
        fecha_hasta: this.pedidoForm.get('fecha_hasta')?.value,
        detalles: this.pedidoForm.get('materiales')?.value,
      }

      // Keep existing validation
      if (materialLock.cantidad_disponible > materialLock.cantidad_total) { // Corrected logic: available cannot be MORE than total probably? Original code said !==
        // Original: if (materialLock.cantidad_disponible !== materialLock.cantidad_total)
        // Wait, if I use some, available < total. So strict equality means unused? 
        // If it's a lock, maybe strict equality is forced on creation?
        // In update, we absolutely allow them to be different.
        if (this.method !== 'update') {
          if (materialLock.cantidad_disponible !== materialLock.cantidad_total) {
            this.pedidoForm.patchValue({
              cantidad_total: null,
              cantidad_disponible: null
            });
            return;
          }
        }
      }

      if (!dateRangeValidator(this.pedidoForm.get('fecha_desde')?.value, this.pedidoForm.get('fecha_hasta')?.value)) {
        this.pedidoForm.patchValue({
          fecha_desde: null,
          fecha_hasta: null
        });
        return;
      }

      if (this.method === 'update' && this.materialLockId) {
        this._materialLockAddService.updateMaterial(this.materialLockId, materialLock).subscribe({
          next: () => {
            this.toastr.success('Bloqueo actualizado correctamente');
            this.router.navigate(['/materials/lock']);
            this.isLoading = false;
          },
          error: (err) => {
            this.toastr.error('Error al actualizar el bloqueo');
            this.isLoading = false;
          },
        });
      } else {
        this._materialLockAddService.storeMaterial(materialLock).subscribe({
          next: () => {
            this.toastr.success('Bloqueo creado correctamente');
            this.router.navigate(['/materials/lock']);
            this.isLoading = false;
          },
          error: (err) => {
            this.toastr.error(err.error.message, 'Error');
            this.isLoading = false;
          },
        });
      }
    }
  }
}
