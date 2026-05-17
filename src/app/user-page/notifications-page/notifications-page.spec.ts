import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsPage } from './notifications-page';
import { provideRouter } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification.service';
import { AnalyticsService } from '../../services/analytics.service';
import { LayoutService } from '../../services/layout.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('NotificationsPage', () => {
  let component: NotificationsPage;
  let fixture: ComponentFixture<NotificationsPage>;
  let notificationService: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsPage, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        InventoryService,
        NotificationService,
        AnalyticsService,
        LayoutService
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsPage);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load notifications from NotificationService', () => {
    const expectedCount = notificationService.notifications().length;
    expect(component.notifications().length).toBe(expectedCount);
  });

  it('should have notification properties (id, title, type)', () => {
    const notifications = component.notifications();
    if (notifications.length > 0) {
      const first = notifications[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('title');
      expect(first).toHaveProperty('type');
    }
  });
});
