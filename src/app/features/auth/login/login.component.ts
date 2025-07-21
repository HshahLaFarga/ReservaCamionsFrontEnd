import { Component } from '@angular/core';
import { LoginService } from './login.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [CommonModule,FormsModule],
  styles: []
})
export class LoginComponent{
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(private _loginService: LoginService, private router: Router) {}

  onSubmit() {
    if (!this.email || !this.password) return;

    this.loading = true;
    this.errorMessage = '';

    this._loginService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Error en usuario o contraseña.';
        console.error(err);
      }
    });
  }
}
