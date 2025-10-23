import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  imports: [],
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
