import { Component, OnInit } from '@angular/core';
import { GenericListComponent } from '../../shared/components/generic-list/generic-list.component';
import { UserPageService } from './user-page.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Profile } from '../../core/models/profile.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-page',
  standalone: true,
  templateUrl: './user-page.component.html',
  imports: [GenericListComponent,CommonModule]
})
export class UserPageComponent implements OnInit {

  users: Profile[] = [];

  isLoading: boolean = false;

  columns = [
    { key: 'username', label: 'Usuario' },
    { key: 'name', label: 'Nombre' },
    { key: 'apellidos', label: 'Apelllido' },
    { key: 'rol.nombre', label: 'Rol' },
    { key: 'PIN', label: 'PIN' },
    { key: 'NIF', label: 'NIF' },
    { key: 'email', label: 'Email' },
    { key: 'tel1', label: 'Telf. 1' },
    { key: 'estadoFormated', label: 'Estado' },
  ];

  constructor(
    private _userPageService: UserPageService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.loadDefaultData();
  }

  loadDefaultData() {
    this._userPageService.getUser().subscribe({
      next: (users: Profile[]) => {
        this.users = users.map((user) => {
          user.estadoFormated = user.estado === 1 ? 'Activo' : 'Inactivo';
          return user;
        })
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error getting users', err);
        this.isLoading = false;
      }
    })
  }

  onAdd() {
    this.router.navigate(['users/add'])
  }

  onEdit(user: Profile) {
    this.router.navigate(['users/edit'], {
      state: {
        user: { ...user },
        method: 'update'
      }
    });
  }

  onDelete(user: Profile) {
    this.isLoading = true;
    this._userPageService.deleteUser(user).subscribe({
      next: () => {
        this.loadDefaultData();
        this.toastr.success('Usuario eliminado correctamente','Èxito');
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error deleting user', err);
        this.isLoading = false;
      }
    })
  }

}
