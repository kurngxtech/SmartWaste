import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

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

   constructor() { }

   // Fetch the real summary from the backend
   fetchSummary(): Observable<any> {
      return this.http.get<any>(`${environment.apiUrl}/analytics/summary`).pipe(
         tap(res => {
            if (res.success) {
               this.summary.set(res.data);
            }
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
