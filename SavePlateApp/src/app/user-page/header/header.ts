import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  constructor(public layoutService: LayoutService) {}
}
