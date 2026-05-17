export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'danger' | 'warning' | 'success' | 'info';
  icon: string;
  action?: string;
  isRead: boolean;
  details?: {
    impactText: string;
    actionButtons: { label: string; action: string; style: 'primary' | 'secondary' | 'danger' }[];
  };
}
