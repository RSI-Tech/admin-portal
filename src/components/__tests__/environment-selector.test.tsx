import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnvironmentSelector } from '../environment-selector';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('EnvironmentSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  it('should render environment selector', () => {
    render(<EnvironmentSelector />);
    
    expect(screen.getByLabelText(/environment/i)).toBeInTheDocument();
  });

  it('should load current environment on mount', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ environment: 'dev' })
    } as Response);

    render(<EnvironmentSelector />);

    expect(mockFetch).toHaveBeenCalledWith('/api/environment');
  });

  it('should display environment selector', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ environment: 'dev' })
    } as Response);

    render(<EnvironmentSelector />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  it('should handle environment change', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ environment: 'dev' })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ environment: 'prod' })
      } as Response);

    render(<EnvironmentSelector />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'prod' } });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/environment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environment: 'prod' })
      });
    });
  });

  it('should show all environment options', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ environment: 'dev' })
    } as Response);

    render(<EnvironmentSelector />);
    
    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(4);
    });
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(<EnvironmentSelector />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});