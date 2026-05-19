import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InventoryItem {
   id: string;
   _id?: string;
   name: string;
   category: string;
   quantity: number;
   expiryDate: string;
   location: string;
   status: string;
   note: string;
   daysLeft?: number;
   isUsed?: boolean;
   isPlanned?: boolean;
   isClaimed?: boolean;
   unit?: string;
}

@Injectable({
   providedIn: 'root'
})
export class InventoryService {
   private http = inject(HttpClient);
   private _items = signal<InventoryItem[]>([]);
   
   today = new Date();
   readonly items = this._items.asReadonly();

   constructor() { }

   // Clear local cache (for logout/account reset)
   clearLocalItems() {
      this._items.set([]);
   }

   // 1. Fetch all items from backend
   loadItems(): Observable<any> {
      return this.http.get<any>(`${environment.apiUrl}/inventory?_t=${Date.now()}`).pipe(
         tap((res: any) => {
            if (res.success) {
               const mapped = res.data.map((item: any) => this.mapToFrontend(item));
               this._items.set(mapped);
               this.refreshStatuses();
            }
         })
      );
   }

   // 2. Add food item
   addItem(itemData: any): Observable<any> {
      const payload = this.mapToBackend(itemData);
      return this.http.post<any>(`${environment.apiUrl}/inventory`, payload).pipe(
         tap((res: any) => {
            if (res.success) {
               const newItem = this.mapToFrontend(res.data);
               this._items.update(items => [...items, newItem]);
               this.refreshStatuses();
            }
         })
      );
   }

   // 3. Update food item
   updateItem(id: string, updates: any): Observable<any> {
      // If we are passing partial frontend updates, map them to backend schema
      const payload = this.mapToBackend(updates);
      return this.http.put<any>(`${environment.apiUrl}/inventory/${id}`, payload).pipe(
         tap((res: any) => {
            if (res.success) {
               const updated = this.mapToFrontend(res.data);
               this._items.update(items => items.map(i => i.id === id ? updated : i));
               this.refreshStatuses();
            }
         })
      );
   }

   // 4. Delete food item
   removeItem(id: string): Observable<any> {
      return this.http.delete<any>(`${environment.apiUrl}/inventory/${id}`).pipe(
         tap((res: any) => {
            if (res.success) {
               this._items.update(items => items.filter(i => i.id !== id));
               this.refreshStatuses();
            }
         })
      );
   }

   // Helper: Refresh front-end calculated daysLeft and statuses
   refreshStatuses() {
      // Get real time day today
      this.today = new Date();
      this._items.update(items => {
         return items.map(item => {
            let expDate = new Date(item.expiryDate);
            if (isNaN(expDate.getTime()) && item.expiryDate) {
               // Try parsing DD-MM-YYYY or DD/MM/YYYY
               const parts = item.expiryDate.split(/[-/]/);
               if (parts.length === 3) {
                  // Assuming DD-MM-YYYY
                  expDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
               }
            }

            let diffDays = 0;
            if (!isNaN(expDate.getTime())) {
               // Calculate using 00:00:00 to avoid timezone shift issues on the same day
               const todayMidnight = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
               const expMidnight = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
               const diffTime = expMidnight.getTime() - todayMidnight.getTime();
               diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }

            // Respect terminal status for the label
            if (item.status === 'Donated' || item.status === 'Planned' || item.status === 'Used') {
               return { ...item, daysLeft: diffDays };
            }

            let newStatus = item.status;
            if (diffDays <= 0) {
               newStatus = 'Expired';
            } else if (diffDays <= 3) {
               newStatus = 'Expiring soon';
            } else {
               newStatus = 'Good';
            }
            return { ...item, daysLeft: diffDays, status: newStatus };
         });
      });
   }

   // Deserializer: Mongoose to Front-end model
   private mapToFrontend(backendItem: any): InventoryItem {
      let frontendStatus = 'Good';
      if (backendItem.status === 'expired') frontendStatus = 'Expired';
      else if (backendItem.status === 'expiring') frontendStatus = 'Expiring soon';
      else if (backendItem.status === 'donated' || backendItem.status === 'donating') frontendStatus = 'Donated';
      else if (backendItem.status === 'used') frontendStatus = 'Used';
      else if (backendItem.status === 'claimed') frontendStatus = 'Planned';

      // Parse location and note from the backend notes string
      let location = 'Fridge';
      let note = '-';
      if (backendItem.notes && backendItem.notes.includes('Location:')) {
         const parts = backendItem.notes.split(';');
         const locPart = parts[0]?.split('Location:')[1];
         const notePart = parts[1]?.split('Note:')[1];
         if (locPart) location = locPart.trim();
         if (notePart) note = notePart.trim();
      } else if (backendItem.notes) {
         note = backendItem.notes;
      }

      return {
         id: backendItem._id,
         name: backendItem.name,
         category: backendItem.category,
         quantity: backendItem.quantity,
         expiryDate: backendItem.expiryDate ? backendItem.expiryDate.split('T')[0] : '',
         location: location,
         status: frontendStatus,
         note: note,
         isUsed: backendItem.status === 'used',
         isPlanned: backendItem.status === 'claimed' || backendItem.status === 'Planned',
         unit: backendItem.unit || 'units'
      };
   }

   // Serializer: Front-end model to Mongoose
   private mapToBackend(frontendItem: any) {
      const payload: any = {};

      if (frontendItem.name) payload.name = frontendItem.name;
      if (frontendItem.category) payload.category = frontendItem.category;
      if (frontendItem.quantity != null) payload.quantity = frontendItem.quantity;
      payload.unit = frontendItem.unit || 'units';
      if (frontendItem.expiryDate) payload.expiryDate = new Date(frontendItem.expiryDate).toISOString();
      
      // Map status
      if (frontendItem.status) {
         if (frontendItem.status === 'Expired') payload.status = 'expired';
         else if (frontendItem.status === 'Expiring soon') payload.status = 'expiring';
         else if (frontendItem.status === 'Donated') payload.status = 'donated';
         else if (frontendItem.status === 'Planned') payload.status = 'claimed';
         else if (frontendItem.status === 'Used') payload.status = 'used';
         else if (frontendItem.status === 'Good') payload.status = 'available';
      }

      if (frontendItem.isUsed !== undefined) {
         payload.status = frontendItem.isUsed ? 'used' : 'available';
      }

      // Encode location and note
      if (frontendItem.location || frontendItem.note) {
         const loc = frontendItem.location || 'Fridge';
         const noteText = frontendItem.note || '-';
         payload.notes = `Location: ${loc}; Note: ${noteText}`;
      }

      // Donation-specific fields
      if (frontendItem.donationQuantity != null) payload.donationQuantity = frontendItem.donationQuantity;
      if (frontendItem.pickupDate) payload.pickupDate = frontendItem.pickupDate;
      if (frontendItem.pickupTime) payload.pickupTime = frontendItem.pickupTime;
      if (frontendItem.contactPhone) payload.contactPhone = frontendItem.contactPhone;
      if (frontendItem.pickupLocation) payload.pickupLocation = frontendItem.pickupLocation;

      return payload;
   }

   // For components that still need standard read utilities
   getItemById(id: string): InventoryItem | undefined {
      return this._items().find(i => i.id === id);
   }

   getNotifications() {
      return this._items().filter(item => item.status === 'Expired' || item.status === 'Expiring soon')
         .map(item => ({
            id: item.id,
            title: item.status === 'Expired' ? 'Food Expired' : 'Expiring Soon',
            description: item.status === 'Expired' 
               ? `${item.name} has expired. Please dispose of it safely.` 
               : `${item.name} in your ${item.location} is expiring in ${item.daysLeft} days.`,
            time: 'Just now',
            type: item.status === 'Expired' ? 'danger' : 'warning',
            icon: item.status === 'Expired' 
               ? 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' 
               : 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
            action: item.status === 'Expired' ? 'Remove Item' : 'Plan Meal',
            details: {
               impactText: item.status === 'Expired' 
                  ? `Removing this item will keep your inventory clean.` 
                  : `Consuming this ${item.name} today prevents food waste.`,
               actionButtons: item.status === 'Expired'
                  ? [{ label: 'Remove Item', action: 'remove', style: 'danger' as const }]
                  : [
                     { label: 'Add to Meal Plan', action: 'plan', style: 'primary' as const },
                     { label: 'Mark as Donated', action: 'donate', style: 'secondary' as const }
                  ]
            }
         }));
   }

   getDashboardAlerts() {
      return this._items().filter(item => item.status === 'Expired' || item.status === 'Expiring soon')
         .map(item => ({
            type: item.status === 'Expired' ? 'alert' : 'warning',
            title: item.status === 'Expired' ? 'EXPIRED ITEM' : 'EXPIRING ITEM',
            subtitle: item.status === 'Expired' 
               ? `${item.name} expired on ${item.expiryDate}` 
               : `${item.name} expires in ${item.daysLeft} days`
         }));
   }
}
