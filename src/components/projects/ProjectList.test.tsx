/// <reference types="@testing-library/jest-dom" />
import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { ProjectList } from './ProjectList';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

// Mock db
jest.mock('../../lib/database', () => ({
  db: {
    projects: {
      list: jest.fn().mockResolvedValue([
        {
          id: '1',
          name: 'Test Project',
          status: 'active',
          budget: 10000,
          start_date: '2024-01-01T00:00:00Z',
          end_date: '2024-12-31T00:00:00Z',
        },
        {
          id: '2',
          name: 'Completed Project',
          status: 'completed',
          budget: 20000,
          start_date: '2023-01-01T00:00:00Z',
          end_date: '2023-12-31T00:00:00Z',
        },
      ]),
    },
  },
}));

// Silence DashboardLayout
jest.mock('../layouts/DashboardLayout', () => ({
  DashboardLayout: ({ children }: { children: ReactNode }) => <div data-testid="dashboard-layout">{children}</div>,
}));

// Silence PlusIcon
jest.mock('./ProjectList', () => {
  const actual = jest.requireActual('./ProjectList');
  return {
    ...actual,
    PlusIcon: () => <svg data-testid="plus-icon" />,
  };
});

describe('ProjectList (Design System)', () => {
  it('renders the projects table with design system components', async () => {
    render(<ProjectList />);
    // Wait for projects to load
    expect(await screen.findByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Completed Project')).toBeInTheDocument();

    // Table headings
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Budget')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();

    // Buttons
    expect(screen.getByText('New Project')).toBeInTheDocument();
    expect(screen.getAllByText('Edit').length).toBeGreaterThan(0);

    // Status pills
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();

    // Snapshot for visual regression
    expect(document.body).toMatchSnapshot();
  });
}); 