import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AddFoodItemDto, FoodCategory, StorageLocation } from '../../../app/shared/models/food-item';

@Component({
  selector: 'app-add-item-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-item-modal.html',
  styleUrl: './add-item-modal.css',
})
export class AddItemModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<AddFoodItemDto>();

  readonly categories: FoodCategory[] = ['Vegetable', 'Fruit', 'Dairy', 'Meat', 'Grain', 'Snack', 'Beverage', 'Other'];
  readonly locations: StorageLocation[] = ['Fridge', 'Pantry', 'Freezer'];
  readonly today = new Date().toISOString().split('T')[0];

  form: AddFoodItemDto = {
    name: '',
    category: 'Other',
    quantity: 1,
    expiryDate: '',
    storageLocation: 'Fridge',
    remarks: '',
  };

  onClose(): void {
    this.close.emit();
  }

  onSubmit(ngForm: NgForm): void {
    if (ngForm.invalid) return;
    this.save.emit({ ...this.form });
    this.form = { name: '', category: 'Other', quantity: 1, expiryDate: '', storageLocation: 'Fridge', remarks: '' };
    ngForm.resetForm();
  }
}
