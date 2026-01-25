import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { MaterialAddUpdateService } from './material-add-update.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { forkJoin, map, Observable, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TipoCamion } from '../../../core/models/tipo_camion.model';
import { Muelle } from '../../../core/models/muelle.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Material } from '../../../core/models/material.model';

@Component({
  selector: 'app-material-add-update',
  standalone: true,
  templateUrl: './material-add-update.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule
  ]
})

export class MaterialAddUpdateComponent implements OnInit {

  form!: FormGroup;
  formTitle = 'Afegir / Modificar Material';
  method: 'post' | 'update' = 'post';

  isLoading: boolean = false;

  truckControl: FormControl<any> = new FormControl('');
  filteredTrucks: TipoCamion[] = [];
  selectedTrucks: TipoCamion[] = [];
  trucks: TipoCamion[] = [];

  muelleControl: FormControl<any> = new FormControl('');
  filteredMuelles: Muelle[] = [];
  selectedMuelles: Muelle[] = [];
  muelles: Muelle[] = [];



  constructor(
    private fb: FormBuilder,
    private _materialAddUpdateService: MaterialAddUpdateService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.loadDefaultData();

    // Filtratges a temps real
    this.truckControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.name),
      map(name => name ? this._filterTrucks(name) : this.trucks.slice())
    ).subscribe((filtered) => {
      this.filteredTrucks = filtered;
    });
    this.muelleControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.name),
      map(name => name ? this._filterMuelles(name) : this.muelles.slice())
    ).subscribe((filtered) => {
      this.filteredMuelles = filtered;
    });
  }


  //Esta función llena los campos para hacer un update
  loadDefaultData() {
    forkJoin({
      trucks: this._materialAddUpdateService.getTrucks(),
      muelles: this._materialAddUpdateService.getMuelles()
    }).subscribe(({ trucks, muelles }) => {
      this.trucks = trucks;
      this.muelles = muelles;

      const state = history.state;
      if (state.method === 'update') {
        this.method = state.method;
        this.selectedTrucks = state.material.tipo_camiones || [];
        this.selectedMuelles = state.material.muelles || [];
        this.buildForm(state.material);
      } else {
        this.buildForm();
      }
      this.isLoading = false;
    });
  }

  // Exemple d'omplir el formulari per modificar:
  loadMaterialToEdit(material: any) {
    this.form.patchValue({
      nombre: material.nombre,
      codigo_sap: material.codigo_sap,
      trucks: material.trucks?.map((t: any) => t.id) || [],
      muelles: material.muelles?.map((m: any) => m.id) || []
    });
  }

  buildForm(material?: Material) {
    this.form = this.fb.group({
      nombre: [material ? material.nombre : '', Validators.required],
      codigo_sap: [material ? material.codigo_sap : '', Validators.required],
      tipo_camiones: [this.selectedTrucks],
      muelles: [this.selectedMuelles]
    });
  }

  // No s'ha tipat perquè donava error si es tipava correctament
  // les dues funcions serveixen per fer la càrrega inicial
  loadUpdateMuelles(control: any): any[] {
    return [];
    const muelles: any[] = control.map((controlMM: any) => controlMM.muelle);
    const uniqueMuelles = muelles.filter(
      (muelle: any, index: number, self: any[]) =>
        index === self.findIndex((m: any) => m.muelle_id === muelle.muelle_id)
    );
    return uniqueMuelles;
  }
  loadUpdateTrucks(control: any): any[] {
    return [];
    const trucks: any[] = control.map((controlMM: any) => controlMM.tipo_camion);
    const uniqueTrucks = trucks.filter(
      (truck: any, index: number, self: any[]) =>
        index === self.findIndex((t: any) => t.tipo_camion_id === truck.tipo_camion_id)
    );
    return uniqueTrucks;
  }

  onSelected(selected: TipoCamion | Muelle) {
    if ('tipo_camion_id' in selected) {
      if (!this.selectedTrucks.some(t => t.tipo_camion_id === selected.tipo_camion_id)) {
        this.selectedTrucks.push(selected);
        this.form.get('trucks')?.setValue(this.selectedTrucks);
      }
      this.truckControl.setValue(null);
    }
    if ('muelle_id' in selected) {
      if (!this.selectedMuelles.some(m => m.muelle_id === selected.muelle_id)) {
        this.selectedMuelles.push(selected);
        this.form.get('muelles')?.setValue(this.selectedMuelles);
      }
      this.muelleControl.setValue(null);
    }
  }

  deleteTrucksFromArray(index: number) {
    this.selectedTrucks.splice(index, 1);
    this.form.get('trucks')?.setValue(this.selectedTrucks)
  }

  deleteMuellesFromArray(index: number) {
    this.selectedMuelles.splice(index, 1);
    this.form.get('muelles')?.setValue(this.selectedMuelles)
  }

  private _filterTrucks(name: string): TipoCamion[] {
    const filterValue = name.toLowerCase();
    return this.trucks.filter(truck =>
      truck.nombre.toLowerCase().includes(filterValue) &&
      !this.selectedTrucks.some(t => t.tipo_camion_id === truck.tipo_camion_id)
    );
  }

  private _filterMuelles(name: string): Muelle[] {
    const filterValue = name.toLowerCase();
    return this.muelles.filter(muelle =>
      muelle.nombre.toLowerCase().includes(filterValue) &&
      !this.selectedMuelles.some(m => m.muelle_id === muelle.muelle_id)
    );
  }

  onSubmit() {
    this.isLoading = true;
    if (this.form.invalid) {
      this.toastr.error('Revisa los campos del formulario');
      return;
    }
    const materialData = this.form.value;
    console.log('Material data to submit: ', materialData);

    let response: Observable<any>;

    if (this.method === 'post') {
      response = this._materialAddUpdateService.storeMaterial(materialData);
    } else {
      response = this._materialAddUpdateService.updateMaterial(materialData, history.state.material.material_id);
    }

    response.subscribe({
      next: () => {
        this.method === 'post' ? this.toastr.success('Material añadida correctamente', 'Éxito') : this.toastr.success('Material actualizada correctamente', 'Éxito');
        this.router.navigate(['materials']);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error storing or updating material ', err);
        this.isLoading = false;
      }
    });
  }
}
