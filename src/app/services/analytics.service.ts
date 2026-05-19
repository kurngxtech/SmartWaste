import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
   providedIn: 'root'
})
export class AnalyticsService {
   private http = inject(HttpClient);
   
   // Signal to hold summary data dynamically from DB
   summary = signal({
      totalUsed: 0,
      totalDonated: 0,
      totalWasted: 0,
      wasteReductionRate: 0
   });

   // Flag indicating cached data is stale and should be re-fetched
   private _stale = true;

   constructor() { }

   /** Mark analytics as stale so next dashboard visit triggers a fresh fetch */
   invalidate() {
      this._stale = true;
   }

   /** Returns true if the summary data needs re-fetching */
   isStale(): boolean {
      return this._stale;
   }

   // Fetch the real summary from the backend
   fetchSummary(): Observable<any> {
      return this.http.get<any>(`${environment.apiUrl}/analytics/summary?_t=${Date.now()}`).pipe(
         tap(res => {
            if (res && res.success && res.data) {
               // Map backend property names → frontend signal names
               this.summary.set({
                  totalUsed: res.data.usedItems ?? res.data.totalUsed ?? 0,
                  totalDonated: res.data.donatedItems ?? res.data.totalDonated ?? 0,
                  totalWasted: res.data.wastedItems ?? res.data.totalWasted ?? 0,
                  wasteReductionRate: res.data.wasteReductionRate ?? 0
               });
               this._stale = false;
            }
         }),
         catchError(err => {
            console.error('Failed to load analytics', err);
            return of(null);
         })
      );
   }

   // Generate an empty zero-based chart for now since backend doesn't provide historical data yet
   getMonthlyImpactChart(monthsRange: number = 6, categoryFilter: string = 'All') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      const chartData = [];

      for (let i = monthsRange - 1; i >= 0; i--) {
         let mIndex = currentMonth - i;
         if (mIndex < 0) mIndex += 12;

         chartData.push({
            month: months[mIndex],
            totalKG: '0', 
            height: '0%' // Graph will look completely flat for new accounts
         });
      }

      return chartData;
   }
}
