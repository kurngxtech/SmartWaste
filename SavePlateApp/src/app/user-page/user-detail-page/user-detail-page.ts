import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideBarNavigation } from '../side-bar-navigation/side-bar-navigation';
import { Header } from '../header/header';
import { RouterLink } from '@angular/router';

@Component({
   selector: 'app-user-detail-page',
   standalone: true,
   imports: [CommonModule, SideBarNavigation, Header, RouterLink],
   templateUrl: './user-detail-page.html'
})
export class UserDetailPage { }