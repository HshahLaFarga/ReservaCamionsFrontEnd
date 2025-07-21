import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Profile } from './profile-page.types';
import { ProfilePageService } from './profile-page.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  templateUrl: './profile-page.component.html',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule]
})
export class ProfilePageComponent implements OnInit {
  form!: FormGroup;
  user: Profile | undefined;
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
      console.log('entra');
      this.user = {
        name: this.form.value.name,
        email: this.form.value.email,
        password: this.form.value.password,
        pin: this.form.value.pin,
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
