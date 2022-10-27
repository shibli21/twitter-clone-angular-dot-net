import { Component, OnInit } from '@angular/core';
import { DashboardData } from './../../core/models/admin.model';
import { AdminService } from './../../core/services/admin.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  dashboardData!: DashboardData;
  isLoading = false;
  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.isLoading = true;
    this.adminService
      .getDashboardData()
      .subscribe((data) => {
        this.dashboardData = data;
      })
      .add(() => {
        this.isLoading = false;
      });
  }
}
