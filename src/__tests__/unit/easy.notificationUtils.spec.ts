import { Event } from '../../types.ts';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
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

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    expect(getUpcomingEvents(events, new Date('2024-07-02T08:59:00'), [])).toEqual([events[0]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    expect(getUpcomingEvents(events, new Date('2024-07-02T08:59:00'), ['1'])).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(events, new Date('2024-07-02T08:49:00'), [])).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(events, new Date('2024-07-02T09:01:00'), [])).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
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
    };

    expect(createNotificationMessage(event)).toBe('10분 후 event 1 일정이 시작됩니다.');
  });
});
