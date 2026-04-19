import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {
  chartData = [
    { month: 'Jan', height: '40%' },
    { month: 'Feb', height: '60%' },
    { month: 'Mar', height: '35%' },
    { month: 'Apr', height: '80%' },
    { month: 'May', height: '100%' },
  ];

  alerts = [
    { title: 'EXPIRING ITEM', subtitle: 'Milk expires in 2 days' },
    { title: 'EXPIRING ITEM', subtitle: 'Bread expires tomorrow' },
    { title: 'DONATION UPDATE', subtitle: 'Your listing was claimed' },
  ];
}
