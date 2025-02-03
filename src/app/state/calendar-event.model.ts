export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  description?: string;
  type: string;
  completed?: boolean; 

}