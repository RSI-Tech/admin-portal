import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { UserForm } from '../user-form';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock UserProfiles component
jest.mock('../user-profiles', () => ({
  UserProfiles: ({ onProfilesChange }: { onProfilesChange: (profiles: string[]) => void }) => (
    <div data-testid="user-profiles">
      <button onClick={() => onProfilesChange(['ADMIN'])}>Set Admin Profile</button>
    </div>
  )
}));

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
const mockPush = jest.fn();

describe('UserForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
    mockFetch.mockClear();
  });

  it('should render form with mandatory fields', () => {
    render(<UserForm />);
    
    expect(screen.getByText('Required Information')).toBeInTheDocument();
    expect(screen.getByLabelText(/user id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
  });

  it('should show optional fields when toggled', () => {
    render(<UserForm />);
    
    const showFieldsButton = screen.getByText('Show Fields');
    fireEvent.click(showFieldsButton);
    
    expect(screen.getByText('Hide Fields')).toBeInTheDocument();
  });

  it('should validate required fields on submit', async () => {
    render(<UserForm />);
    
    const submitButton = screen.getByText('Add User');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/user id is required/i)).toBeInTheDocument();
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    });
  });

  it('should handle form input changes', () => {
    render(<UserForm />);
    
    const userIdInput = screen.getByLabelText(/user id/i);
    fireEvent.change(userIdInput, { target: { value: 'testuser123' } });
    
    expect(userIdInput).toHaveValue('testuser123');
  });

  it('should clear validation errors when field is corrected', async () => {
    render(<UserForm />);
    
    const submitButton = screen.getByText('Add User');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/user id is required/i)).toBeInTheDocument();
    });
    
    const userIdInput = screen.getByLabelText(/user id/i);
    fireEvent.change(userIdInput, { target: { value: 'testuser123' } });
    
    expect(screen.queryByText(/user id is required/i)).not.toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ userKey: 123 })
    } as Response);

    render(<UserForm />);
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText(/user id/i), { target: { value: 'testuser123' } });
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/updated by/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/status/i), { target: { value: 'Active' } });
    
    const submitButton = screen.getByText('Add User');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('testuser123')
      });
    });
  });

  it('should handle form submission errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: async () => 'User already exists'
    } as Response);

    render(<UserForm />);
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText(/user id/i), { target: { value: 'testuser123' } });
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/updated by/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/status/i), { target: { value: 'Active' } });
    
    const submitButton = screen.getByText('Add User');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('User already exists')).toBeInTheDocument();
    });
  });

  it('should render in edit mode with initial data', () => {
    const initialData = {
      USER_KEY: 123,
      USER_ID: 'testuser',
      FIRST_NAME: 'John',
      LAST_NAME: 'Doe'
    };
    
    render(<UserForm initialData={initialData} isEdit={true} />);
    
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByText('Update User')).toBeInTheDocument();
  });

  it('should handle cancel button', () => {
    render(<UserForm />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should render select fields with options', () => {
    render(<UserForm />);
    
    const statusSelect = screen.getByLabelText(/status/i);
    expect(statusSelect.tagName).toBe('SELECT');
    
    const options = statusSelect.querySelectorAll('option');
    expect(options.length).toBeGreaterThan(1);
  });

  it('should disable submit button during submission', async () => {
    mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<UserForm />);
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText(/user id/i), { target: { value: 'testuser123' } });
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/updated by/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/status/i), { target: { value: 'Active' } });
    
    const submitButton = screen.getByText('Add User');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Adding...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should handle profile changes', () => {
    render(<UserForm />);
    
    const setProfileButton = screen.getByText('Set Admin Profile');
    fireEvent.click(setProfileButton);
    
    // Profile should be set through the mocked component
    expect(screen.getByTestId('user-profiles')).toBeInTheDocument();
  });
});