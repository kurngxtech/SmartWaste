import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgClass],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.css',
})
export class UserLayout {
  menuItems = [
    { label: 'Dashboard and Impact', icon: '📊', route: '/dashboard' },
    { label: 'Food And Inventory', icon: '🍎', route: '/inventory' },
    { label: 'Donation Hub', icon: '🤝', route: '/donation' },
    { label: 'Meal Planner', icon: '🗓️', route: '/meal-planner' },
    { label: 'Setting', icon: '⚙️', route: '/settings' },
  ];
}
