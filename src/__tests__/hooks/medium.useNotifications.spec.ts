import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe } from 'vitest';

import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-10-15T08:50:01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockEvents = [...events] as Event[];

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    expect(result.current.notifications).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      expect(result.current.notifications[0]).toMatchObject({
        id: '1',
        message: '10분 후 기존 회의 일정이 시작됩니다.',
      });
    });
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      expect(result.current.notifications[0]).toMatchObject({
        id: '1',
        message: '10분 후 기존 회의 일정이 시작됩니다.',
      });
    });

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toEqual([]);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));

    act(() => {
      expect(result.current.notifiedEvents).toEqual([]);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      expect(result.current.notifications[0]).toMatchObject({
        id: '1',
        message: '10분 후 기존 회의 일정이 시작됩니다.',
      });
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      expect(result.current.notifiedEvents).toHaveLength(1);
    });
  });
});
