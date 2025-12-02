import { Component, OnInit } from '@angular/core';
import { GenericFormComponent } from '../../../shared/components/generic-form/generic-form.component';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Profile } from '../../../core/models/usuario.model';
import { Observable } from 'rxjs';
import { UserAddUdpateService } from './user-add-update.service';

@Component({
  selector: 'app-user-add-udpate',
  standalone: true,
  templateUrl: './user-add-udpate.component.html',
  imports: [GenericFormComponent, CommonModule]
})
export class UserAddUdpateComponent implements OnInit {

  method: 'post' | 'update' = 'post';
  initialUserData: Profile | null = null;

  isLoading: boolean = false;

  constructor(
    private _userAddUpdateComponent: UserAddUdpateService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit() {
    const state = history.state
    if (state.method === 'update') {
      this.method = state.method;
      const {rol, ...resto} = state.user;
      console.log('Usurio a editar:', state.user);
      this.initialUserData = { ...rol, ...resto };
    }
  }

  onSubmit(user: Profile) {

    this.isLoading = true;

    let request: Observable<any>;
    if (this.method === 'post') {
      request = this._userAddUpdateComponent.storeMuelle(user);
    } else {
      request = this._userAddUpdateComponent.updateMuelle(user, history.state.user.id);
    }

    request.subscribe({
      next: () => {
        this.router.navigate(['users']);
        this.method === 'post'? this.toastr.success('Usuario añadido correctamente', 'Èxito') : this.toastr.success('Usuario actualizado correctamente', 'Èxito');
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error creating or updating users',err);
        this.isLoading = false;
      }
    })
  }
}
