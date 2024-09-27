// components/__tests__/Hello.test.tsx
import { render, screen } from '@testing-library/react';
import Hello from '../Hello'; 

describe('Hello Component', () => {
  it('renders a heading', () => {
    render(<Hello />);
    const heading = screen.getByRole('heading', {
      name: /hello, world!/i,
    });
    expect(heading).toBeInTheDocument();
  });
});
