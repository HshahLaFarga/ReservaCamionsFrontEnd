import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfilePageService } from './profile-page.service';
import { Profile } from '../../core/models/usuario.model';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../features/auth/login/login.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  templateUrl: './profile-page.component.html',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule]
})
export class ProfilePageComponent implements OnInit {
  form!: FormGroup;
  currentUser: any = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private _profilePageService: ProfilePageService,
    private toastr: ToastrService,
    private loginService: LoginService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      idioma: ['es', [Validators.required]],
      tel1: ['', [Validators.pattern(/^[0-9]{9}$/)]],
      NIF: [''],
      password: ['', [Validators.minLength(8)]]
    });

    this.loginService.authState$.subscribe(userState => {
      if (userState?.user) {
        this.currentUser = userState.user;
        this.form.patchValue({
          nombre: this.currentUser.nombre || '',
          apellidos: this.currentUser.apellidos || '',
          username: this.currentUser.username || '',
          email: this.currentUser.email || '',
          idioma: this.currentUser.idioma || 'es',
          tel1: this.currentUser.tel1 || '',
          NIF: this.currentUser.NIF || ''
        });
      }
    });
  }

  updateUser() {
    if (this.form.valid) {
      this.isLoading = true;
      const userPayload: any = {
        id: this.currentUser.id ?? this.currentUser.usuario_id,
        nombre: this.form.value.nombre,
        username: this.form.value.username,
        apellidos: this.form.value.apellidos,
        email: this.form.value.email,
        tel1: this.form.value.tel1,
        NIF: this.form.value.NIF,
        idioma: this.form.value.idioma,
        rol_id: this.currentUser.rol_id
      };

      if (this.form.value.password) {
        userPayload.contraseña = this.form.value.password;
      }

      this._profilePageService.updateProfile(userPayload).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastr.success('Perfil actualizado correctamente', 'Éxito');
          this.currentUser.nombre = userPayload.nombre;
          this.currentUser.apellidos = userPayload.apellidos;
          this.currentUser.username = userPayload.username;
          this.currentUser.email = userPayload.email;
          this.currentUser.tel1 = userPayload.tel1;
          this.currentUser.NIF = userPayload.NIF;
          this.currentUser.idioma = userPayload.idioma;
          if (this.form.value.password) {
            this.form.get('password')?.setValue('');
          }
        },
        error: (err) => {
          this.isLoading = false;
          const msg = err?.error?.message || 'Error al actualizar el perfil';
          this.toastr.error(msg, 'Error');
        }
      });
    } else {
      this.toastr.warning('Por favor, completa los campos requeridos correctamente.', 'Advertencia');
    }
  }
}
