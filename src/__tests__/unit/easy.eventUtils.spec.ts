import { expect } from 'vitest';

import { Event } from '../../types.ts';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
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
      title: '이벤트 2',
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
      description: '기존 팀 미팅',
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
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    expect(getFilteredEvents(events, '이벤트 2', new Date('2024-10-15'), 'week')).toEqual([
      events[1],
    ]);
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    expect(getFilteredEvents(events, '', new Date('2024-07-01'), 'week')).toEqual([
      events[0],
      events[2],
    ]);
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(events, '', new Date('2024-07-01'), 'month')).toEqual([
      events[0],
      events[2],
      events[3],
    ]);
  });

  it('검색어 "event"와 주간 뷰 필터링을 동시에 적용할 경우, 해당 날짜의 "이벤트"라는 이름을 가진 주의 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(events, 'event', new Date('2024-07-01'), 'week')).toEqual([
      events[0],
      events[2],
    ]);
  });

  it('검색어가 없을 때 해당 날짜의 주(week)의 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(events, '', new Date('2024-07-01'), 'week')).toEqual([
      events[0],
      events[2],
    ]);
  });

  it('검색어가 없을 때 해당 날짜의 달(month)의 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(events, '', new Date('2024-07-01'), 'month')).toEqual([
      events[0],
      events[2],
      events[3],
    ]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    expect(getFilteredEvents(events, 'event', new Date('2024-07-01'), 'week')).toEqual([
      events[0],
      events[2],
    ]);

    expect(getFilteredEvents(events, 'EVENT', new Date('2024-07-01'), 'week')).toEqual([
      events[0],
      events[2],
    ]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    expect(getFilteredEvents(events, '', new Date('2024-07-01'), 'month')).toEqual([
      events[0],
      events[2],
      events[3],
    ]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    expect(getFilteredEvents([], '', new Date('2024-07-01'), 'month')).toEqual([]);
  });
});
