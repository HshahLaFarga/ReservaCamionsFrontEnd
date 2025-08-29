import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SidebarService } from './sidebar.service';
import { SidebarItem } from '../../../core/models/sidebar.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  imports: [RouterModule, TranslateModule, CommonModule],
})
export class SidebarComponent implements OnInit {

  sidebarItems: SidebarItem[] = [];

  openDropdown: string | null = null;

  constructor (
    private _sidebarService:  SidebarService
  ) {}

  ngOnInit(): void {
    this.loadDefaultData();
  }
  loadDefaultData() {
    this.sidebarItems = this._sidebarService.getSidebarItems();
  }

  toggleDropdown(label: string) {
    if (this.openDropdown === label) {
      this.openDropdown = null;
    } else {
      this.openDropdown = label;
    }
  }

  logout() {
    throw new Error('Method not implemented.');
  }
}
