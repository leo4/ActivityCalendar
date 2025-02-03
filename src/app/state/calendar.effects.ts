import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, Observable } from 'rxjs';
import { map, mergeMap, catchError, withLatestFrom } from 'rxjs/operators';
import * as CalendarActions from './calendar.actions';
import { CalendarService } from './calendar.service';
import { selectAllEvents } from './calendar.selectors';
import { CalendarEvent } from './calendar-event.model';

interface AppState {
  calendar: CalendarEvent[];
}

@Injectable({ providedIn: 'root' })
export class CalendarEffects {
  public loadEvents$: Observable<any>;
  public addEvent$: Observable<any>;
  public updateEvent$: Observable<any>;
  public completeEvent$: Observable<any>;
  public removeEvent$: Observable<any>;

  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private calendarService: CalendarService
  ) {
    this.loadEvents$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CalendarActions.loadEvents),
        mergeMap(() => {
          const load$ = this.calendarService && this.calendarService.loadEvents
            ? this.calendarService.loadEvents()
            : of([]);
          return load$.pipe(
            map(events =>
              CalendarActions.loadEventsSuccess({
                events: Array.isArray(events) ? events : []
              })
            ),
            catchError(error => of(CalendarActions.loadEventsFailure({ error })))
          );
        })
      )
    );

    this.addEvent$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CalendarActions.addEvent),
        withLatestFrom(this.store.select(selectAllEvents)),
        mergeMap(([action, events]) => {
          const save$ =
            this.calendarService && this.calendarService.saveEvents
              ? this.calendarService.saveEvents([...events, action.event])
              : of(void 0);
          return save$.pipe(
            map(() => CalendarActions.addEventSuccess({ event: action.event })),
            catchError(error => of(CalendarActions.addEventFailure({ error })))
          );
        })
      )
    );

    this.updateEvent$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CalendarActions.updateEvent),
        withLatestFrom(this.store.select(selectAllEvents)),
        mergeMap(([action, events]) => {
          const updatedEvents = events.map(event =>
            event.id === action.event.id ? action.event : event
          );
          const save$ =
            this.calendarService && this.calendarService.saveEvents
              ? this.calendarService.saveEvents(updatedEvents)
              : of(void 0);
          return save$.pipe(
            map(() => CalendarActions.updateEventSuccess({ event: action.event })),
            catchError(error => of(CalendarActions.updateEventFailure({ error })))
          );
        })
      )
    );

    this.completeEvent$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CalendarActions.completeEvent),
        withLatestFrom(this.store.select(selectAllEvents)),
        mergeMap(([action, events]) => {
          const updatedEvents = events.map(event =>
            event.id === action.eventId ? { ...event, completed: true } : event
          );
          const save$ =
            this.calendarService && this.calendarService.saveEvents
              ? this.calendarService.saveEvents(updatedEvents)
              : of(void 0);
          return save$.pipe(
            map(() =>
              CalendarActions.completeEventSuccess({ eventId: action.eventId })
            ),
            catchError(error =>
              of(CalendarActions.completeEventFailure({ error }))
            )
          );
        })
      )
    );

    this.removeEvent$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CalendarActions.removeEvent),
        withLatestFrom(this.store.select(selectAllEvents)),
        mergeMap(([action, events]) => {
          const filteredEvents = events.filter(event => event.id !== action.eventId);
          const save$ = 
            this.calendarService && this.calendarService.saveEvents
              ? this.calendarService.saveEvents(filteredEvents)
              : of(void 0);
          return save$.pipe(
            map(() => CalendarActions.removeEventSuccess({ eventId: action.eventId })),
            catchError(error => of(CalendarActions.removeEventFailure({ error })))
          );
        })
      )
    );
  }
}