import { createReducer, on } from '@ngrx/store';
import * as CalendarActions from './calendar.actions';
import { CalendarEvent } from './calendar-event.model';

export const initialState: CalendarEvent[] = [];

export const calendarReducer = createReducer(
  initialState,
  // Load Events
  on(CalendarActions.loadEventsSuccess, (_, { events }) => events),
  
  // Add Event
  on(CalendarActions.addEventSuccess, (state, { event }) => [...state, event]),
  
  // Update Event
  on(CalendarActions.updateEventSuccess, (state, { event }) => 
    state.map(item => item.id === event.id ? event : item)
  ),
  
  // Remove Event
  on(CalendarActions.removeEventSuccess, (state, { eventId }) => 
    state.filter(event => event.id !== eventId)
  ),
  
  // Complete Event
  on(CalendarActions.completeEventSuccess, (state, { eventId }) => 
    state.map(event => 
      event.id === eventId 
        ? { ...event, completed: true }
        : event
    )
  )
);