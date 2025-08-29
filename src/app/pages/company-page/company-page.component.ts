import { Component, OnInit } from '@angular/core';
import { GenericListComponent } from '../../shared/components/generic-list/generic-list.component';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Company } from '../../core/models/company.model';
import { CompanyPageService } from './company-page.service';

@Component({
  selector: 'app-company-page',
  standalone: true,
  templateUrl: './company-page.component.html',
  imports: [GenericListComponent, CommonModule]
})
export class CompanyPageComponent implements OnInit {

  companys: Company[] = [];
  isLoading: boolean = false;

  columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'estadoFormated', label: 'Estado' }
  ];

  constructor(
    private _companyPageService: CompanyPageService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.loadDefaultData();
  }

  loadDefaultData() {
    this.isLoading = true;
    this._companyPageService.getCompanys().subscribe({
      next: (companys: Company[]) => {
        this.companys = companys.map((company) => {
          company.estadoFormated = company.estado === 1 ? 'Activo' : 'Inactivo';
          return company
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error getting companys ', err);
      }
    })
  }

  onAdd() {
    this.router.navigate(['companys/add']);
  }

  onEdit(company: Company) {
    this.router.navigate(['companys/edit'], {
      state: {
        company: { ...company },
        method: 'update'
      }
    });
  }

  onDelete(company: Company) {
    this.isLoading = true;
    this._companyPageService.deleteCompany(company).subscribe({
      next: () => {
        this.loadDefaultData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error on delete company', err);
        this.isLoading = false;
      }
    });
  }
}
