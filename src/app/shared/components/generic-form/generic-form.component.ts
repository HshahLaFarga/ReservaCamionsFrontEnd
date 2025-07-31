import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgClass } from '@angular/common';
import { GenericFormService } from './generic-from.service';

@Component({
  selector: 'app-generic-form',
  standalone: true,
  templateUrl: './generic-form.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgClass
  ],
})
export class GenericFormComponent implements OnInit {
  // Camps d'entrada
  @Input() tableName!: string;
  @Input() selectFields: {
    [key: string]: {
      api: string;
      labelField: string;
      valueField: string;
    };
  } = {};
  @Input() excludedFields: string[] = [];

  // Camp de sortida
  @Output() submitForm = new EventEmitter<any>();

  // Variables entrorn
  columns: any[] = [];
  form!: FormGroup;
  selectOptions: { [key: string]: any[] } = {};

  constructor(private fb: FormBuilder, private http: HttpClient, private _genericFormService: GenericFormService) {}

  // Càrrega inicial columnes
  ngOnInit(): void {
    this.loadColumns();
  }

  loadColumns() {
    this._genericFormService.getGenericItems(this.tableName).subscribe({
      next: (cols) => {
        // Apliquem filtre per treure les columnes que s'hagi passat que no es vulguin
        this.columns = cols.filter((col: { Field: string; Extra: string | string[]; }) =>
          col.Field !== 'id' &&
          !col.Extra.includes('auto_increment') &&
          !this.excludedFields.includes(col.Field)
        );
        // Construcció del formulari
        this.buildForm();
        // Carregar els que siguin combobox que s'hagin indicat en el component
        this.loadSelectOptions();
      },
      error: (err) => {
        console.error('Error loading columns', err);
      },
    });
  }

  buildForm() {
    const group: any = {};
    this.columns.forEach((col) => {
      group[col.Field] = [''];
    });
    this.form = this.fb.group(group);
  }

  loadSelectOptions() {
    for (const field in this.selectFields) {
      const config = this.selectFields[field];
      this._genericFormService.getComboboxItems(config.api).subscribe({
        next: (data) => {
          this.selectOptions[field] = data;
        },
        error: (err) => {
          console.error(`Error loading select options for ${field}`, err);
          this.selectOptions[field] = [];
        },
      });
    }
  }
  // Entendre el tipus
  getInputType(columnType: string): string {
    if (columnType.includes('int')) return 'number';
    if (columnType.includes('varchar') || columnType.includes('text')) return 'text';
    if (columnType.includes('date')) return 'date';
    if (columnType.includes('tinyint(1)')) return 'checkbox';
    return 'text';
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }
    // Excloem els camps indicats
    const filteredValue = Object.keys(this.form.value)
      .filter(key => !this.excludedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = this.form.value[key];
        return obj;
      }, {});

    // Emetem les dades filtrades al component pare
    this.submitForm.emit(filteredValue);
  }
}
