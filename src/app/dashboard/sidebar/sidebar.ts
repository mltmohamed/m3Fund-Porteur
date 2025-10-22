import { Component, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  @Output() viewChange = new EventEmitter<string>();
  currentView: string = 'dashboard';

  setView(view: string) {
    this.currentView = view;
    this.viewChange.emit(view);
  }
}
