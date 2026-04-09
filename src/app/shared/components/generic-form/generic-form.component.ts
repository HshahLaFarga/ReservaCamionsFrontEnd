import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule, NgClass } from '@angular/common';
import { GenericFormService } from './generic-from.service';
import { mysqlToDateInput, mysqlToDatetimeInput, formatDateToMySQL } from '../../utils/date.utils';

@Component({
  selector: 'app-generic-form',
  standalone: true,
  templateUrl: './generic-form.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  styles: `
    /* Estils addicionals si cal */
  `
})
export class GenericFormComponent implements OnInit {
  // Camps d'entrada
  @Input() formTitle!: string;
  @Input() tableName!: string;
  @Input() selectFields: {
    [key: string]: {
      api: string;
      labelField: string;
      valueField: string;
      label?: string; // Nou camp opcional per mostrar com a label
    }
  } = {};
  @Input() fieldLabels: { [key: string]: string } = {};
  @Input() excludedFields: string[] = [];
  @Input() optionalFields: string[] = []; // Campos que deben ser opcionales
  @Input() initialData: any | null = null;
  // @Input() requiredFields: string[] = [];


  // Camp de sortida
  @Output() submitForm = new EventEmitter<any>();

  // Variables entrorn
  columns: any[] = [];
  form!: FormGroup;
  selectOptions: { [key: string]: any[] } = {};

  constructor(private fb: FormBuilder, private http: HttpClient, private _genericFormService: GenericFormService) { }

  // Càrrega inicial columnes
  ngOnInit(): void {
    this.loadColumns();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialData'] && this.form) {
      const patchedData: any = { ...this.initialData };

      this.columns.forEach((col) => {
        if (col.Type.includes('datetime') && patchedData[col.Field]) {
          patchedData[col.Field] = mysqlToDatetimeInput(patchedData[col.Field]);
        } else if (col.Type.includes('date') && patchedData[col.Field]) {
          patchedData[col.Field] = mysqlToDateInput(patchedData[col.Field]);
        }
      });


      this.form.patchValue(patchedData);
    }
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

        this.buildForm();
        // Cargar los combobox
        this.loadSelectOptions();
      },
      error: (err) => {
      },
    });
  }

  buildForm() {
    const group: any = {};
    this.columns.forEach((col) => {
      let initialValue = this.initialData ? this.initialData[col.Field] : '';

      // Formatejar les dates perquè es puguin interpretar
      if (col.Type.includes('datetime') && initialValue) {
        initialValue = mysqlToDatetimeInput(initialValue);
      } else if (col.Type.includes('date') && initialValue) {
        initialValue = mysqlToDateInput(initialValue);
      }

      group[col.Field] = [initialValue];
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
          this.selectOptions[field] = [];
        },
      });
    }
  }

  // Obtner el tipo de input según el DataType de la BBDD
  getInputType(columnType: string): string {
    if (/^tinyint\(1\)/.test(columnType)) return 'checkbox';
    if (columnType.includes('int')) return 'number';
    if (columnType.includes('varchar') || columnType.includes('text')) return 'text';
    if (columnType.includes('datetime')) return 'datetime-local';
    if (columnType.includes('date')) return 'date';
    if (columnType.includes('time')) return 'time';
    return 'text';
  }


  // Formateo de cada label pera que sea más legible a la vista
  getLabel(field: string): string {
    return this.selectFields[field]?.label ?? this.fieldLabels[field] ?? field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    // Prepara objecte per enviar al backend (PUT/POST)
    const preparedValue = Object.keys(this.form.value)
      .filter(key => !this.excludedFields.includes(key))
      .reduce((obj: any, key) => {
        let value = this.form.value[key];

        // Trobar dades de la columna
        const col = this.columns.find(c => c.Field === key);

        if (col) {
          // Si és datetime formatem la data perquè a API arribi ben per defecte a MYSQL format (amb timestamp ISO a local pot fallar depenent del timezone back vs front)
          if (col.Type.includes('datetime') && value) {
            value = formatDateToMySQL(value);
          }

          // Si és date convertir a format MySQL
          // if (col.Type.includes('date') && value) {
          //   const [yyyy, mm, dd] = value.split('-');
          //   value = `${yyyy}-${mm}-${dd} 00:00:00`;
          // }

          // IMPORTANT CONSERVAR AIXÒ, JA QUE HI HA EL PROBLEMA QUE SI L'USUARI NO MARCA RES RETORNA "",
          // I AMB AIXÒ ES SOLUCIONA EL PROBLEMA
          if (col.Type.includes('tinyint(1)')) {
            value = value ? 1 : 0;
          }
        }

        obj[key] = value;
        return obj;
      }, {});

    // Emetem les dades preparades al component pare
    this.submitForm.emit(preparedValue);
  }

}
