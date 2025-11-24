import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.css'
})
export class ConfirmationModal {
  @Input() isVisible: boolean = false;
  @Input() isSuccess: boolean = true;
  @Input() message: string = '';
  @Input() confirmMode: boolean = false;
  @Input() confirmTitle: string = '';
  @Input() confirmProceedText: string = 'Confirmer';
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }

  proceed() {
    this.confirm.emit();
  }
}


