import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { calendarReducer } from './app/state/calendar.reducer';
import { CalendarEffects } from './app/state/calendar.effects';
import { routes } from './app/app.routes';
import { isDevMode } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideStore({
      calendar: calendarReducer
    }),
    provideEffects([CalendarEffects]), // Pass as array
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode()
    }),
    provideAnimations()
  ]
}).catch(err => console.error(err));