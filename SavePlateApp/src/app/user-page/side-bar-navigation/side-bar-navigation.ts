import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-side-bar-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-bar-navigation.html',
  styleUrl: './side-bar-navigation.css',
})
export class SideBarNavigation {}
