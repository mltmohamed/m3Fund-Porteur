import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
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
