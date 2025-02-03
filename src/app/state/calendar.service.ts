import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { CalendarEvent } from './calendar-event.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private readonly STORE_NAME = 'calendar_events';
  private readonly DB_NAME = 'CalendarDB';
  private readonly VERSION = 1;

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  saveEvents(events: CalendarEvent[]): Observable<void> {
    return from(
      this.openDB().then(db => {
        return new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(this.STORE_NAME, 'readwrite');
          const store = transaction.objectStore(this.STORE_NAME);

          store.clear();
          events.forEach(event => store.add(event));

          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });
      })
    );
  }

  loadEvents(): Observable<CalendarEvent[]> {
    return from(
      this.openDB().then(db => {
        return new Promise<CalendarEvent[]>((resolve, reject) => {
          const transaction = db.transaction(this.STORE_NAME, 'readonly');
          const store = transaction.objectStore(this.STORE_NAME);
          const request = store.getAll();

          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      })
    );
  }
}