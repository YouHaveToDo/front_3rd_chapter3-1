import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, vi } from 'vitest';

import {
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', () => {
  const actual = vi.importActual('@chakra-ui/react');

  return {
    ...actual,
    useToast: () => mockToast,
  };
});

describe('useEventOperations', () => {
  const mockEvents = [...events] as Event[];

  const title = '테스트 코드를 위한 타이틀';
  const endTime = '22:00';

  const newEvent = {
    id: '1',
    title: title,
    date: '2024-07-02',
    startTime: '09:00',
    endTime: endTime,
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  } as Event;

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    const { result } = renderHook(() => useEventOperations(false, () => {}));

    await waitFor(() => {
      expect(result.current.events).toEqual(events);
    });
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    const { result } = renderHook(() => useEventOperations(false, () => {}));

    await waitFor(() => {
      expect(result.current.events).toHaveLength(1);
    });

    const newEvent = {
      id: '4',
      title: 'EVENT 4',
      date: '2024-07-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    } as Event;

    await waitFor(() => {
      result.current.saveEvent(newEvent);
    });

    await waitFor(() => {
      expect(result.current.events).toHaveLength(2);
    });
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    setupMockHandlerUpdating(mockEvents);

    const { result } = renderHook(() => useEventOperations(true, () => {}));

    await waitFor(() => {
      expect(result.current.events[0].title).toBe(events[0].title);
      expect(result.current.events[0].endTime).toBe(events[0].endTime);
    });

    await waitFor(() => {
      result.current.saveEvent(newEvent);
    });

    await waitFor(() => {
      expect(result.current.events[0].title).toBe(title);
      expect(result.current.events[0].endTime).toBe(endTime);
    });
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    setupMockHandlerDeletion(mockEvents);

    const { result } = renderHook(() => useEventOperations(false, () => {}));

    await waitFor(() => {
      console.log('result 입니다', result.current.events);
      expect(result.current.events).toHaveLength(1);
    });

    await waitFor(() => {
      result.current.deleteEvent('1');
    });

    await waitFor(() => {
      expect(result.current.events).toHaveLength(0);
    });
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useEventOperations(false, () => {}));

    await waitFor(() => {
      expect(result.current.events).toHaveLength(0);
    });

    await waitFor(() => {
      result.current.fetchEvents();
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: '이벤트 로딩 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    server.use(
      http.put('/api/events/:id', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useEventOperations(true, () => {}));

    await waitFor(() => {
      result.current.saveEvent(newEvent);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '일정 저장 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    server.use(
      http.delete('/api/events/:id', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useEventOperations(false, () => {}));

    await waitFor(() => {
      result.current.deleteEvent('1');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '일정 삭제 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
});
