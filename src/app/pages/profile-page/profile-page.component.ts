import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfilePageService } from './profile-page.service';
import { Profile } from '../../core/models/usuario.model';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  templateUrl: './profile-page.component.html',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule]
})
export class ProfilePageComponent implements OnInit {
  form!: FormGroup;
  user: Profile | null = null;
  constructor(
    private fb: FormBuilder,
    private _profilePageService: ProfilePageService,
  ) { }

  // Inicialitzem el formulari amb les validacions pertinents
  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      pin: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(6)]],
      tel1: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  updateUser() {
    // En el cas que sigui vàlid efectuem la petició
    if (this.form.valid) {
      this.user = {
        name: this.form.value.name,
        username: 'prova',
        apellidos:'asa',
        email: this.form.value.email,
        password: this.form.value.password,
        tel1: this.form.value.tel1
      }

      this._profilePageService.updateProfile(this.user).subscribe({
        next: (response) => {
          console.log('Usuari Modificat Correctament');
        },
        error: (err) => {
          console.log('Error Modificant Usuari');
        }
      });
    }
  }
}
