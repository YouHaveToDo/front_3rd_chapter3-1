import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe } from 'vitest';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

describe('useSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-07-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const events: Event[] = [
    {
      id: '1',
      title: 'event 1',
      date: '2024-07-02',
      startTime: '09:00',
      endTime: '12:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: 'EVENT 2',
      date: '2024-10-15',
      startTime: '12:00',
      endTime: '13:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: 'EVENT 3',
      date: '2024-07-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '외부 회의',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '4',
      title: '시험',
      date: '2024-07-30',
      startTime: '12:00',
      endTime: '13:00',
      description: '시험',
      location: '학교',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '5',
      title: '점심 약속',
      date: '2024-07-03',
      startTime: '12:00',
      endTime: '13:00',
      description: '점심 식사',
      location: '구내식당',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  it('검색어가 비어있을 때, view("month")타입에 맞는 모든 이벤트를 반환해야 한다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-07-01'));

    const { result } = renderHook(() => useSearch(events, new Date(), 'month'));
    expect(result.current.filteredEvents).toHaveLength(4);
  });

  it('검색어가 비어있을 때, view("week")타입에 맞는 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, new Date(), 'week'));
    expect(result.current.filteredEvents).toHaveLength(3);
  });

  it('검색어에 맞는 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, new Date(), 'week'));

    act(() => {
      result.current.setSearchTerm('event 1');
    });

    expect(result.current.filteredEvents).toEqual([events[0]]);
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, new Date(), 'month'));

    act(() => {
      result.current.setSearchTerm('event 1');
    });

    expect(result.current.filteredEvents).toEqual([events[0]]);

    act(() => {
      result.current.setSearchTerm('학교');
    });

    expect(result.current.filteredEvents).toEqual([events[3]]);

    act(() => {
      result.current.setSearchTerm('외부 회의');
    });

    expect(result.current.filteredEvents).toEqual([events[2]]);
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, new Date('2024-07-01'), 'week'));

    expect(result.current.filteredEvents).toEqual([events[0], events[2], events[4]]);
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch(events, new Date('2024-07-01'), 'week'));

    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.filteredEvents).toEqual([events[0], events[2]]);

    act(() => {
      result.current.setSearchTerm('점심');
    });

    expect(result.current.filteredEvents).toEqual([events[4]]);
  });
});
