import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerReading,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils.ts';
import { events } from '../__mocks__/response/events.json' assert { type: 'json' };
import App from '../App.tsx';
import { Event } from '../types.ts';

const renderApp = () => {
  return render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
};

describe('all', () => {
  describe('일정 CRUD 및 기본 기능', () => {
    const mockEvents = [...events] as Event[];

    it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
      setupMockHandlerCreation(mockEvents);
      renderApp();

      await userEvent.type(screen.getByLabelText('제목'), '테스트');
      await userEvent.type(screen.getByLabelText('날짜'), '2024-11-06');
      await userEvent.type(screen.getByLabelText('시작 시간'), '09:00');
      await userEvent.type(screen.getByLabelText('종료 시간'), '10:00');
      await userEvent.type(screen.getByLabelText('설명'), '테스트 코드 작성');
      await userEvent.type(screen.getByLabelText('위치'), '사무실');
      await userEvent.selectOptions(screen.getByLabelText('카테고리'), '업무');

      await userEvent.click(screen.getByRole('button', { name: '일정 추가' }));

      const eventList = screen.getByTestId('event-list');
      const searchInput = within(eventList).getByPlaceholderText('검색어를 입력하세요');
      await userEvent.type(searchInput, '테스트');

      await waitFor(() => {
        expect(within(eventList).getByText('테스트')).toBeInTheDocument();
        expect(within(eventList).getByText('2024-11-06')).toBeInTheDocument();
        expect(within(eventList).getByText(/09:00/)).toBeInTheDocument();
        expect(within(eventList).getByText(/10:00/)).toBeInTheDocument();
        expect(within(eventList).getByText('테스트 코드 작성')).toBeInTheDocument();
        expect(within(eventList).getByText('사무실')).toBeInTheDocument();
        expect(within(eventList).getByText(/업무/)).toBeInTheDocument();
      });
    });

    it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-11-06T08:50:00'));

      setupMockHandlerUpdating([
        {
          id: '1',
          title: '기존 회의',
          date: '2024-11-06',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      renderApp();

      const eventList = screen.getByTestId('event-list');
      const searchInput = within(eventList).getByPlaceholderText('검색어를 입력하세요');

      vi.useRealTimers();
      await userEvent.type(searchInput, '기존 회의');

      await waitFor(() => {
        expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /Edit event/i });
      await userEvent.click(editButton);

      await userEvent.clear(screen.getByLabelText('제목'));
      await userEvent.type(screen.getByLabelText('제목'), '테스트 기존 회의');
      await userEvent.clear(screen.getByLabelText('설명'));
      await userEvent.type(screen.getByLabelText('설명'), '테스트 설명');

      await userEvent.click(screen.getByRole('button', { name: '일정 수정' }));

      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, '테스트 기존 회의');

      await waitFor(() => {
        expect(within(eventList).getByText('테스트 기존 회의')).toBeInTheDocument();
        expect(within(eventList).getByText('테스트 설명')).toBeInTheDocument();
      });
    });

    it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-10-15T08:50:00'));

      setupMockHandlerDeletion(events as Event[]);

      renderApp();

      const eventList = screen.getByTestId('event-list');
      const searchInput = within(eventList).getByPlaceholderText('검색어를 입력하세요');

      vi.useRealTimers();
      await userEvent.type(searchInput, '기존 회의');

      await waitFor(() => {
        expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
      });

      const deleteButton = screen.getByLabelText('Delete event');
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryByText('기존 회의')).not.toBeInTheDocument();
      });
    });
  });

  describe('일정 뷰', () => {
    it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-10-01T08:50:00'));

      renderApp();

      vi.useRealTimers();
      await userEvent.selectOptions(screen.getByLabelText('view'), 'week');

      const weekView = screen.getByTestId('week-view');

      expect(within(weekView).queryByText('기존 회의')).not.toBeInTheDocument();
    });

    it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-10-15T00:00:00'));

      renderApp();

      const viewSelect = screen.getByLabelText('view');

      vi.useRealTimers();
      await userEvent.selectOptions(viewSelect, 'week');

      const weekView = screen.getByTestId('week-view');
      expect(within(weekView).getByText('기존 회의')).toBeInTheDocument();
    });

    it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
      vi.useFakeTimers();
      vi.setSystemTime('2024-10-15T00:00:00');

      const { unmount } = renderApp();

      let viewSelect = screen.getByLabelText('view');

      vi.useRealTimers();
      await userEvent.selectOptions(viewSelect, 'month');

      let monthView = screen.getByTestId('month-view');
      expect(within(monthView).queryByText('기존 회의')).toBeInTheDocument();

      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime('2024-01-15T00:00:00');

      unmount();
      renderApp();

      viewSelect = screen.getByLabelText('view');

      vi.useRealTimers();
      await userEvent.selectOptions(viewSelect, 'month');

      monthView = screen.getByTestId('month-view');

      expect(within(monthView).queryByText('기존 회의')).not.toBeInTheDocument();
    });

    it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-10-15T00:00:00'));

      renderApp();

      const viewSelect = screen.getByLabelText('view');

      vi.useRealTimers();
      await userEvent.selectOptions(viewSelect, 'month');

      const monthView = screen.getByTestId('month-view');
      expect(within(monthView).getByText('기존 회의')).toBeInTheDocument();
    });

    it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T00:00:00'));

      renderApp();

      const monthView = screen.getByTestId('month-view');
      expect(within(monthView).getByText('신정')).toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  describe('검색 기능', () => {
    it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
      renderApp();

      const eventList = screen.getByTestId('event-list');
      const searchInput = within(eventList).getByPlaceholderText('검색어를 입력하세요');
      await userEvent.type(searchInput, '이건 아무것도 없겠지?');

      await waitFor(() => {
        expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
      });
    });

    it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
      setupMockHandlerReading([
        {
          id: '1',
          title: '팀 회의',
          date: '2024-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime('2024-10-15T00:00:00');

      renderApp();

      const eventList = screen.getByTestId('event-list');
      const searchInput = within(eventList).getByPlaceholderText('검색어를 입력하세요');
      await userEvent.type(searchInput, '팀 회의');

      await waitFor(() => {
        expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
      });
    });

    it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
      setupMockHandlerReading([
        {
          id: '1',
          title: '팀 회의',
          date: '2024-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '기본 회의',
          date: '2024-10-15',
          startTime: '11:00',
          endTime: '12:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime('2024-10-15T00:00:00');

      renderApp();

      const eventList = screen.getByTestId('event-list');
      const searchInput = within(eventList).getByPlaceholderText('검색어를 입력하세요');
      await userEvent.type(searchInput, '팀 회의');

      await waitFor(() => {
        expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
      });

      await userEvent.clear(searchInput);

      await waitFor(() => {
        expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
        expect(within(eventList).getByText('기본 회의')).toBeInTheDocument();
      });
    });
  });

  describe('일정 충돌', () => {
    it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime('2024-10-15T00:00:00');

      renderApp();

      await userEvent.type(screen.getByLabelText('제목'), '테스트');
      await userEvent.type(screen.getByLabelText('날짜'), '2024-10-15');
      await userEvent.type(screen.getByLabelText('시작 시간'), '09:00');
      await userEvent.type(screen.getByLabelText('종료 시간'), '10:00');
      await userEvent.type(screen.getByLabelText('설명'), '테스트 코드 작성');
      await userEvent.type(screen.getByLabelText('위치'), '사무실');
      await userEvent.selectOptions(screen.getByLabelText('카테고리'), '업무');

      await userEvent.click(screen.getByRole('button', { name: '일정 추가' }));

      await waitFor(() => {
        expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
      });
    });

    it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime('2024-10-15T00:00:00');

      setupMockHandlerUpdating([
        {
          id: '1',
          title: '기존 회의',
          date: '2024-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      renderApp();

      const eventList = screen.getByTestId('event-list');
      const searchInput = within(eventList).getByPlaceholderText('검색어를 입력하세요');

      vi.useRealTimers();
      await userEvent.type(searchInput, '기존 회의');

      await waitFor(() => {
        expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /Edit event/i });
      await userEvent.click(editButton);

      await userEvent.clear(screen.getByLabelText('시작 시간'));
      await userEvent.type(screen.getByLabelText('시작 시간'), '12:30');

      await userEvent.click(screen.getByRole('button', { name: '일정 수정' }));

      await waitFor(() => {
        expect(screen.getByText(/시간 설정을 확인해주세요/)).toBeInTheDocument();
      });
    });
  });

  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime('2024-10-15T08:51:00');

    setupMockHandlerReading([
      {
        id: '1',
        title: '기존 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ] as Event[]);

    renderApp();

    await waitFor(() => {
      expect(screen.getByText('기존 팀 미팅')).toBeInTheDocument();
      expect(screen.getByText('10분 전')).toBeInTheDocument();
    });
  });
});
