// components/__tests__/LoginForm.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import thunk from 'redux-thunk'; // Import redux-thunk
import LoginForm from '../signIn/SignInForm';
import { login } from '@/lib/store/features/counterSlice';
import { AppDispatch } from '@/lib/store/store'; // Import the AppDispatch type

type RootState = {}; // Bạn có thể cập nhật kiểu này theo cấu trúc thực tế của store

const mockStore = configureStore<RootState, AppDispatch>([thunk]); // Thêm redux-thunk vào middleware
let store: MockStoreEnhanced<RootState, AppDispatch>;

jest.mock('@/lib/store/features/counterSlice', () => ({
  login: jest.fn(),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    store = mockStore({});
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );
  });

  it('renders the login form', () => {
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('updates the username and password fields when typing', () => {
    const usernameInput = screen.getByLabelText(/username/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  it('dispatches the login action when the form is submitted', () => {
    const usernameInput = screen.getByLabelText(/username/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(login).toHaveBeenCalledWith({ username: 'testuser', password: 'password123' });
  });
});
