import { createSelector, createFeatureSelector } from '@ngrx/store';
import { CalendarEvent } from './calendar-event.model';

export const selectCalendarState = createFeatureSelector<CalendarEvent[]>('calendar');

export const selectAllEvents = createSelector(
  selectCalendarState,
  (state: CalendarEvent[]) => state
);
