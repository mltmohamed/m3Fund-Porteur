import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-projects',
  imports: [],
  templateUrl: './projects.html',
  styleUrl: './projects.css'
})
export class Projects {
  @Output() viewChange = new EventEmitter<string>();

  goToProjects() {
    this.viewChange.emit('projet');
  }
}
