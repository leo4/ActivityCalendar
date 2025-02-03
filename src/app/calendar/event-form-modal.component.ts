import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { 
  MatDatetimepickerModule, 
  MatNativeDatetimeModule,
  DatetimeAdapter, 
  MAT_DATETIME_FORMATS,
  NativeDatetimeAdapter
} from '@mat-datetimepicker/core';
import { CalendarEvent } from '../state/calendar-event.model';

@Component({
  selector: 'app-event-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDatetimepickerModule,
    MatNativeDatetimeModule
  ],
  providers: [
    {
      provide: DatetimeAdapter,
      useClass: NativeDatetimeAdapter
    },
    {
      provide: MAT_DATETIME_FORMATS,
      useValue: {
        parse: {
          dateInput: 'YYYY-MM-DD HH:mm',
          monthInput: 'MMMM',
          timeInput: 'HH:mm',
          datetimeInput: 'YYYY-MM-DD HH:mm'
        },
        display: {
          dateInput: 'YYYY-MM-DD HH:mm',
          monthInput: 'MMMM',
          timeInput: 'HH:mm',
          datetimeInput: 'YYYY-MM-DD HH:mm',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
          popupHeaderDateLabel: 'ddd, DD MMM'
        }
      }
    }
  ],
  template: `
    <div class="event-modal">
      <h2 mat-dialog-title>{{ data.event ? 'Edit' : 'Add' }} {{ data.type }} Event</h2>
      
      <div mat-dialog-content>
        <form [formGroup]="eventForm">
          <mat-form-field appearance="fill">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title">
            <mat-error *ngIf="eventForm.get('title')?.hasError('required') && eventForm.get('title')?.touched">
              Title is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Date and Time</mat-label>
            <input matInput [matDatetimepicker]="picker" 
                   formControlName="date"
                   placeholder="Choose date and time">
            <mat-datetimepicker-toggle matSuffix [for]="picker"></mat-datetimepicker-toggle>
            <mat-datetimepicker #picker type="datetime"></mat-datetimepicker>
            <mat-error *ngIf="eventForm.get('date')?.hasError('required') && eventForm.get('date')?.touched">
              Date and time is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="4"></textarea>
            <mat-error *ngIf="eventForm.get('description')?.hasError('required') && eventForm.get('description')?.touched">
              Description is required
            </mat-error>
          </mat-form-field>
        </form>
      </div>

      <div mat-dialog-actions>
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button 
                color="primary" 
                [disabled]="!eventForm.valid" 
                (click)="onSubmit()">
          {{ data.event ? 'Update' : 'Save' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .event-modal {
      padding: 20px;
      max-width: 500px;
    }
    
    mat-form-field {
      width: 100%;
      margin-bottom: 16px;
    }

    textarea {
      min-height: 100px;
    }

    .mat-dialog-actions {
      justify-content: flex-end;
      padding: 16px 0 0;
      margin-bottom: 0;
    }

    .mat-dialog-actions button {
      margin-left: 8px;
    }

    h2 {
      margin: 0 0 20px;
      font-size: 24px;
    }
  `]
})
export class EventModalComponent implements OnInit {
  eventForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EventModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      type: string;
      event?: CalendarEvent;
    }
  ) {}

  ngOnInit() {
    this.eventForm = this.initializeForm();
  }

  private initializeForm(): FormGroup {
    const event = this.data?.event;
    const currentDate = event?.date ? new Date(event.date) : new Date();
    
    // Ensure time component is preserved
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);
    
    return this.fb.group({
      title: [event?.title || '', Validators.required],
      date: [currentDate, Validators.required],
      description: [event?.description || '', Validators.required],
      type: [event?.type || this.data.type.toLowerCase()]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;
      // Ensure date is properly formatted with time
      const date = formValue.date instanceof Date 
        ? formValue.date.toISOString()
        : new Date(formValue.date).toISOString();
        
      this.dialogRef.close({
        ...formValue,
        date,
        type: this.data.type.toLowerCase()
      });
    }
  }
}