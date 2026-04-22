import { Component, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface AppNotification {
  id: string;
  item_name: string;
  message: string;
  timestamp: string;
  is_read: boolean;
  route: string;
}

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  showNotifications = false;

  notifications: AppNotification[] = [
    {
      id: '1',
      item_name: 'Milk',
      message: 'Milk will expire in 2 days.',
      timestamp: '10 mins ago',
      is_read: false,
      route: '/inventory',
    },
    {
      id: '2',
      item_name: 'Spinach',
      message: 'Spinach will expire tomorrow.',
      timestamp: '2 hours ago',
      is_read: false,
      route: '/inventory',
    },
    {
      id: '3',
      item_name: 'Yogurt',
      message: 'Yogurt has expired.',
      timestamp: '1 day ago',
      is_read: true,
      route: '/inventory',
    },
  ];

  constructor(
    private router: Router,
    private eRef: ElementRef,
  ) {}

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.is_read).length;
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
  }

  handleNotificationClick(notif: AppNotification) {
    notif.is_read = true;
    this.showNotifications = false;
    this.router.navigate([notif.route]);
  }

  markAllAsRead(event: Event) {
    event.stopPropagation();
    this.notifications.forEach((n) => (n.is_read = true));
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showNotifications = false;
    }
  }
}
