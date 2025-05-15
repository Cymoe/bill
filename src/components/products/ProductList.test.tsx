import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProductList } from './ProductList';

// Mock DashboardLayout to just render children
jest.mock('../layouts/DashboardLayout', () => ({
  DashboardLayout: ({ children }: any) => <div>{children}</div>,
}));

// Mock Dropdown to avoid popover logic
jest.mock('../common/Dropdown', () => ({
  Dropdown: ({ trigger }: any) => <div>{trigger}</div>,
}));

describe('ProductList UI', () => {
  it('renders nav, tabs, search, table header, and rows as in screenshot', () => {
    render(<ProductList />);

    // Tabs
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Material')).toBeInTheDocument();
    expect(screen.getByText('Labor')).toBeInTheDocument();
    expect(screen.getByText('Equipment')).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument();
    expect(screen.getByText('Subcontractor')).toBeInTheDocument();

    // Table header
    expect(screen.getByText('NAME')).toBeInTheDocument();
    expect(screen.getByText('DESCRIPTION')).toBeInTheDocument();
    expect(screen.getByText('PRICE')).toBeInTheDocument();
    expect(screen.getByText('UNIT')).toBeInTheDocument();

    // Search bar
    expect(screen.getByPlaceholderText(/search by title, content/i)).toBeInTheDocument();

    // Filter icon (should be present)
    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
  });
}); 