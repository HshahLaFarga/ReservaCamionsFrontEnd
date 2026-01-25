import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfilePageService } from './profile-page.service';
import { Profile } from '../../core/models/usuario.model';
import { LoginService } from '../../features/auth/login/login.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  templateUrl: './profile-page.component.html',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule]
})
export class ProfilePageComponent implements OnInit {
  form!: FormGroup;
  // user: Profile | null = null; // No longer strict Profile
  instanceType: 'usuario' | 'entidad' | null = null;

  constructor(
    private fb: FormBuilder,
    private _profilePageService: ProfilePageService,
    private _loginService: LoginService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      // Relaxed PIN: Optional by default, we enforce it for Entidad in loadUserData if needed.
      pin: ['', [Validators.minLength(4), Validators.maxLength(10)]],
      tel1: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      password: ['', [Validators.minLength(6)]]
    });

    this.loadUserData();
  }

  loadUserData() {
    const logged = this._loginService.currentUser;
    console.log('Loading User Data:', logged);

    if (!logged) return;

    this.instanceType = logged.instance;

    if (this.instanceType === 'usuario') {
      const u = (logged as any).user;

      this.form.get('pin')?.clearValidators();
      this.form.get('pin')?.updateValueAndValidity();
      this.form.get('pin')?.disable();

      this.form.patchValue({
        name: u.nombre,
        email: u.email,
        tel1: u.tel1 ? String(u.tel1).replace(/\s/g, '') : '',
      });
    } else if (this.instanceType === 'entidad') {
      const e = (logged as any).user;

      const pinControl = this.form.get('pin');
      pinControl?.enable();
      // If you want it required for Entity:
      // pinControl?.addValidators(Validators.required);

      this.form.patchValue({
        name: e.nombre,
        email: e.email,
        tel1: e.telefono1 ? String(e.telefono1).replace(/\s/g, '') : '',
        // Try multiple casings for PIN just in case
        pin: e.pin || e.PIN || ''
      });
      pinControl?.updateValueAndValidity();
    }
  }

  updateUser() {
    console.log('Update button clicked. Form valid?', this.form.valid, 'Status:', this.form.status);
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        const err = this.form.get(key)?.errors;
        if (err) console.log('Error in', key, err);
      });
    }

    if (this.form.valid) {
      const formVal = this.form.value;
      const logged = this._loginService.currentUser;

      if (!logged) return;

      if (this.instanceType === 'usuario') {
        const userPayload: Profile = {
          /* Preserve existence to avoid breaking backend if it expects full obj, 
             but ideally we merge with existing or send partial. 
             Code previously rebuilt it manually. */
          ...(logged as any).user,
          nombre: formVal.name,
          email: formVal.email,
          tel1: formVal.tel1,
          // Handle Password if set
          ...(formVal.password ? { contraseña: formVal.password } : {})
        };

        // Use existing Update Profile for internal
        this._profilePageService.updateProfile(userPayload).subscribe({
          next: () => console.log('Usuari Modificat Correctament'),
          error: () => console.error('Error Modificant Usuari')
        });

      } else if (this.instanceType === 'entidad') {
        // Prepare Entidad Payload
        const entidadPayload: any = {
          ...(logged as any).user,
          nombre: formVal.name,
          email: formVal.email,
          telefono1: formVal.tel1,
          pin: formVal.pin,
          ...(formVal.password ? { password: formVal.password } : {})
        };

        this._profilePageService.updateEntidad(entidadPayload).subscribe({
          next: () => console.log('Entidad Modificada Correctament'),
          error: (err) => console.error('Error Modificant Entidad', err)
        });
      }
    }
  }
}
