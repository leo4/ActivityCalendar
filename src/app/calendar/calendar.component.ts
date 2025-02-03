import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import * as CalendarActions from '../state/calendar.actions';
import { CalendarEvent } from '../state/calendar-event.model';
import { EventModalComponent } from './event-form-modal.component';
import { selectAllEvents } from '../state/calendar.selectors';

interface AppState {
  calendar: CalendarEvent[];
}

interface EventExtendedProps {
  description?: string;
  type: string;
  completed: boolean;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  standalone: true,
  imports: [CommonModule, FullCalendarModule, MatButtonModule, MatIconModule]
})
export class CalendarComponent implements OnInit, OnDestroy {
  events$: Observable<CalendarEvent[]>;
  private eventListeners: { type: string; listener: EventListener }[] = [];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    events: [],
    eventContent: (info) => {
      const event = info.event;
      const props = event.extendedProps as EventExtendedProps;
      
      return {
        html: `
          <div class="event-content">
            <div class="event-title">${event.title}</div>
            <div class="event-description">${props['description'] || ''}</div>
            <div class="event-actions">
              <button class="btn btn-success btn-sm" 
                      ${props['completed'] ? 'disabled' : ''}
                      onclick="document.querySelector('#calendar').dispatchEvent(new CustomEvent('calendar-complete', {detail: '${event.id}'}))">
                ✓
              </button>
              <button class="btn btn-primary btn-sm" 
                      onclick="document.querySelector('#calendar').dispatchEvent(new CustomEvent('calendar-edit', {detail: '${event.id}'}))">
                ✎
              </button>
              <button class="btn btn-danger btn-sm" 
                      onclick="document.querySelector('#calendar').dispatchEvent(new CustomEvent('calendar-delete', {detail: '${event.id}'}))">
                ×
              </button>
            </div>
          </div>
        `
      };
    },
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth'
    },
    timeZone: 'local',
    displayEventTime: false,
    eventDisplay: 'block',
    eventBackgroundColor: '#fff',
    eventBorderColor: '#ddd',
    eventTextColor: '#333'
  };

  constructor(
    private store: Store<AppState>,
    private dialog: MatDialog
  ) {
    this.events$ = this.store.select(selectAllEvents);
  }

  ngOnInit() {
    this.store.dispatch(CalendarActions.loadEvents());
    
    this.events$.subscribe(events => {
      const sortedEvents = events
        .filter(event => event && event.date)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(event => {
          const eventDate = new Date(event.date);
          return {
            id: event.id,
            title: `${event.title} (${event.type})`,
            start: eventDate.toISOString().split('T')[0],
            allDay: true,
            color: event.type.toLowerCase() === 'race' ? '#ff4081' : '#3f51b5',
            textColor: 'white',
            description: event.description,
            extendedProps: {
              type: event.type,
              completed: event.completed,
              description: event.description
            }
          };
        });

      this.calendarOptions = {
        ...this.calendarOptions,
        events: sortedEvents
      };
    });

    const calendar = document.querySelector('#calendar');
    if (calendar) {
      const completeListener = ((e: CustomEvent) => {
        this.completeEvent(e.detail);
      }) as EventListener;

      const editListener = ((e: CustomEvent) => {
        const event = this.findEventById(e.detail);
        if (event) this.editEvent(event);
      }) as EventListener;

      const deleteListener = ((e: CustomEvent) => {
        this.removeEvent(e.detail);
      }) as EventListener;

      calendar.addEventListener('calendar-complete', completeListener);
      calendar.addEventListener('calendar-edit', editListener);
      calendar.addEventListener('calendar-delete', deleteListener);

      this.eventListeners = [
        { type: 'calendar-complete', listener: completeListener },
        { type: 'calendar-edit', listener: editListener },
        { type: 'calendar-delete', listener: deleteListener }
      ];
    }
  }

  ngOnDestroy() {
    const calendar = document.querySelector('#calendar');
    if (calendar) {
      this.eventListeners.forEach(({ type, listener }) => {
        calendar.removeEventListener(type, listener);
      });
    }
  }

  openEventModal(type: string): void {
    const dialogRef = this.dialog.open(EventModalComponent, {
      width: '400px',
      data: { type }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const event: CalendarEvent = {
          id: Date.now().toString(),
          completed: false,
          ...result
        };
        this.store.dispatch(CalendarActions.addEvent({ event }));
      }
    });
  }

  editEvent(event: CalendarEvent): void {
    const dialogRef = this.dialog.open(EventModalComponent, {
      width: '400px',
      data: { 
        type: event.type,
        event: event
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedEvent: CalendarEvent = {
          ...event,
          ...result
        };
        this.store.dispatch(CalendarActions.updateEvent({ event: updatedEvent }));
      }
    });
  }

  removeEvent(eventId: string): void {
    if (confirm('Are you sure you want to delete this event?')) {
      this.store.dispatch(CalendarActions.removeEvent({ eventId }));
    }
  }

  completeEvent(eventId: string): void {
    this.store.dispatch(CalendarActions.completeEvent({ eventId }));
  }

  private findEventById(id: string): CalendarEvent | undefined {
    const events = this.calendarOptions.events as any[];
    const event = events.find(e => e.id === id);
    if (event) {
      return {
        id: event.id,
        title: event.title.split(' (')[0],
        date: event.start,
        description: event.extendedProps.description,
        type: event.extendedProps.type,
        completed: event.extendedProps.completed
      };
    }
    return undefined;
  }
}