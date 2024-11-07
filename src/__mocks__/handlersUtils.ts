import { http, HttpResponse } from 'msw';

import { server } from '../setupTests.ts';
import { Event } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const newEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: newEvents });
    }),

    http.post('/api/events', async ({ request }) => {
      const requestBody = await request.json();

      const newEvent = { ...(requestBody as Event), id: String(events.length + 1) };

      newEvents.push(newEvent as Event);

      return HttpResponse.json(newEvent, { status: 201 });
    })
  );
};

export const setupMockHandlerUpdating = (initEvents = [] as Event[]) => {
  const newEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: newEvents });
    }),

    http.put('/api/events/:id', async ({ request, params }) => {
      const { id } = params;
      const requestEvent = (await request.json()) as Event;

      const index = newEvents.findIndex((event) => event.id === id);

      if (index === -1) {
        return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
      }

      newEvents[index] = requestEvent;

      return HttpResponse.json(newEvents[index]);
    })
  );
};

export const setupMockHandlerDeletion = (initEvents = [] as Event[]) => {
  const newEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: newEvents });
    }),

    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;

      const index = newEvents.findIndex((event) => event.id === id);

      if (index === -1) {
        return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
      }

      newEvents.splice(index, 1);

      return HttpResponse.json({ message: 'Event deleted' });
    })
  );
};

export const setupMockHandlerReading = (initEvents = [] as Event[]) => {
  const newEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: newEvents });
    })
  );
};
