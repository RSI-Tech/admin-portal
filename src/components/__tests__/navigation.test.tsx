import { render, screen } from '@testing-library/react';
import { Navigation } from '../navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/'
}));

// Mock the environment selector component
jest.mock('../environment-selector', () => ({
  EnvironmentSelector: () => <div data-testid="environment-selector">Environment Selector</div>
}));

describe('Navigation', () => {
  it('should render navigation with title', () => {
    render(<Navigation />);
    
    expect(screen.getByText('GovPremiere')).toBeInTheDocument();
  });

  it('should render company name link', () => {
    render(<Navigation />);
    
    const companyLink = screen.getByText('GovPremiere');
    expect(companyLink).toBeInTheDocument();
  });

  it('should include environment selector', () => {
    render(<Navigation />);
    
    expect(screen.getByTestId('environment-selector')).toBeInTheDocument();
  });

  it('should have proper navigation structure', () => {
    render(<Navigation />);
    
    const nav = screen.getByRole('banner');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass('sticky', 'top-0', 'z-40');
  });

  it('should have responsive layout classes', () => {
    render(<Navigation />);
    
    const container = screen.getByRole('banner').firstChild;
    expect(container).toHaveClass('max-w-screen-xl', 'mx-auto', 'px-8');
  });

  it('should display navigation items', () => {
    render(<Navigation />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Add User')).toBeInTheDocument();
  });

  it('should display admin user section', () => {
    render(<Navigation />);
    
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });
});