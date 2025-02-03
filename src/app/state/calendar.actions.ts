// calendar.actions.ts
import { createAction, props } from '@ngrx/store';
import { CalendarEvent } from './calendar-event.model';


export const loadEvents = createAction('[Calendar] Load Events');
export const loadEventsSuccess = createAction(
  '[Calendar] Load Events Success',
  props<{ events: CalendarEvent[] }>()
);
export const loadEventsFailure = createAction(
  '[Calendar] Load Events Failure',
  props<{ error: any }>()
);

export const addEvent = createAction(
  '[Calendar] Add Event',
  props<{ event: CalendarEvent }>()
);
export const addEventSuccess = createAction(
  '[Calendar] Add Event Success',
  props<{ event: CalendarEvent }>()
);
export const addEventFailure = createAction(
  '[Calendar] Add Event Failure',
  props<{ error: any }>()
);

// Update Event
export const updateEvent = createAction(
  '[Calendar] Update Event',
  props<{ event: CalendarEvent }>()
);
export const updateEventSuccess = createAction(
  '[Calendar] Update Event Success',
  props<{ event: CalendarEvent }>()
);
export const updateEventFailure = createAction(
  '[Calendar] Update Event Failure',
  props<{ error: any }>()
);


export const removeEvent = createAction(
  '[Calendar] Remove Event',
  props<{ eventId: string }>()
);
export const removeEventSuccess = createAction(
  '[Calendar] Remove Event Success',
  props<{ eventId: string }>()
);
export const removeEventFailure = createAction(
  '[Calendar] Remove Event Failure',
  props<{ error: any }>()
);


export const completeEvent = createAction(
  '[Calendar] Complete Event',
  props<{ eventId: string }>()
);
export const completeEventSuccess = createAction(
  '[Calendar] Complete Event Success',
  props<{ eventId: string }>()
);
export const completeEventFailure = createAction(
  '[Calendar] Complete Event Failure',
  props<{ error: any }>()
);