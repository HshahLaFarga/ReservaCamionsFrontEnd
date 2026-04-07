import { Component, OnInit } from '@angular/core';
import { GenericFormComponent } from '../../../shared/components/generic-form/generic-form.component';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CompanyAddUpdateService } from './company-add-update.service';
import { Company } from '../../../core/models/company.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-company-add-update',
  standalone: true,
  templateUrl: './company-add-update.component.html',
  imports: [GenericFormComponent,CommonModule]
})

export class CompanyAddUpdateComponent implements OnInit {

  method: 'post' | 'update' = 'post';

  initialCompanyData: Company | null = null;

  isLoading: boolean = false;

  constructor(
    private _companyAddUpdateService: CompanyAddUpdateService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit() {
    const state = history.state
    if (state.method === 'update') {
      this.method = 'update'
      this.initialCompanyData = state.company;
    }
  }

  onSubmit(company: Company) {
    this.isLoading = true;

    let request: Observable<any>;

    if(this.method === 'post'){
      request = this._companyAddUpdateService.storeCompany(company);
    } else {
      request = this._companyAddUpdateService.updateCompany(company, history.state.company.empresa_lfycs_id);
    }

    request.subscribe({
      next: () => {
        this.router.navigate(['companys']);
        this.method === 'post'? this.toastr.success('Empresa creada correctamente', 'Èxito') : this.toastr.success('Empresa modificada correctamente', 'Èxito')
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      }
    });

  }

}
