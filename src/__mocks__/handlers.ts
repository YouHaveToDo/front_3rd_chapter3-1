import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  http.post('/api/events', async ({ request }) => {
    const requestBody = await request.json();

    const newEvent = { ...(requestBody as Event), id: String(events.length + 1) };

    events.push(newEvent as Event);

    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ request, params }) => {
    const { id } = params;
    const requestEvent = await request.json();

    const index = events.findIndex((event) => event.id === id);

    if (index === -1) {
      return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    events[index] = requestEvent as Event;

    return HttpResponse.json(events[index]);
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;

    const index = events.findIndex((event) => event.id === id);

    if (index === -1) {
      return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    events.splice(index, 1);

    return HttpResponse.json({ message: 'Event deleted' });
  }),
];
