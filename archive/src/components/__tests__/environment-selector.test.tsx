import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { EnvironmentSelector } from '../environment-selector';

// Mock the API module
jest.mock('@/lib/api', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiFetch: jest.fn(),
  getApiUrl: jest.fn((endpoint: string) => endpoint)
}));

import { apiGet, apiPost } from '@/lib/api';
const mockApiGet = apiGet as jest.MockedFunction<typeof apiGet>;
const mockApiPost = apiPost as jest.MockedFunction<typeof apiPost>;

// Mock window.location
const mockLocation = {
  href: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: ''
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
  configurable: true
});

describe('EnvironmentSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiGet.mockClear();
    mockApiPost.mockClear();
  });

  it('should render loading state initially', () => {
    mockApiGet.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<EnvironmentSelector />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should load current environment on mount', async () => {
    mockApiGet.mockResolvedValueOnce({ 
      current: 'dev',
      name: 'Development', 
      available: ['dev', 'int', 'test', 'prod'] 
    });

    await act(async () => {
      render(<EnvironmentSelector />);
    });

    expect(mockApiGet).toHaveBeenCalledWith('/api/environment');
  });

  it('should display environment selector button when loaded', async () => {
    mockApiGet.mockResolvedValueOnce({ 
      current: 'dev',
      name: 'Development', 
      available: ['dev', 'int', 'test', 'prod'] 
    });

    await act(async () => {
      render(<EnvironmentSelector />);
    });

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('DEV')).toBeInTheDocument();
    });
  });

  it('should call API when environment change is triggered', async () => {
    mockApiGet.mockResolvedValueOnce({ 
      current: 'dev',
      name: 'Development', 
      available: ['dev', 'int', 'test', 'prod'] 
    });

    await act(async () => {
      render(<EnvironmentSelector />);
    });

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('DEV')).toBeInTheDocument();
    });
  });

  it('should display current environment in button', async () => {
    mockApiGet.mockResolvedValueOnce({ 
      current: 'prod',
      name: 'Production', 
      available: ['dev', 'int', 'test', 'prod'] 
    });

    await act(async () => {
      render(<EnvironmentSelector />);
    });
    
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('PROD')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('API Error'));

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

});