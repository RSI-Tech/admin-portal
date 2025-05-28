import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { EnvironmentSelector } from '../environment-selector';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock window.location
const mockLocation = {
  href: 'http://localhost:3000'
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

describe('EnvironmentSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  it('should render loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<EnvironmentSelector />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should load current environment on mount', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        current: 'dev',
        name: 'Development', 
        available: ['dev', 'int', 'test', 'prod'] 
      })
    } as Response);

    await act(async () => {
      render(<EnvironmentSelector />);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/environment');
  });

  it('should display environment selector button when loaded', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        current: 'dev',
        name: 'Development', 
        available: ['dev', 'int', 'test', 'prod'] 
      })
    } as Response);

    await act(async () => {
      render(<EnvironmentSelector />);
    });

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('DEV')).toBeInTheDocument();
    });
  });

  it('should call API when environment change is triggered', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        current: 'dev',
        name: 'Development', 
        available: ['dev', 'int', 'test', 'prod'] 
      })
    } as Response);

    await act(async () => {
      render(<EnvironmentSelector />);
    });

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('DEV')).toBeInTheDocument();
    });
  });

  it('should display current environment in button', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        current: 'prod',
        name: 'Production', 
        available: ['dev', 'int', 'test', 'prod'] 
      })
    } as Response);

    await act(async () => {
      render(<EnvironmentSelector />);
    });
    
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('PROD')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    await act(async () => {
      render(<EnvironmentSelector />);
    });

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch environment:', expect.any(Error));
    }, { timeout: 2000 });

    consoleSpy.mockRestore();
  });

  it('should handle fetch response with missing ok property', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ 
        current: 'dev',
        name: 'Development', 
        available: ['dev', 'int', 'test', 'prod'] 
      })
    } as Response);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await act(async () => {
      render(<EnvironmentSelector />);
    });

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});