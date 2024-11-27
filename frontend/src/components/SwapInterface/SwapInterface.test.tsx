import { render, screen, fireEvent } from '@testing-library/react';
import { SwapInterface } from './index';

describe('SwapInterface', () => {
it('renders swap interface', () => {
  render(<SwapInterface />);
  expect(screen.getByText(/Swap/i)).toBeInTheDocument();
});

it('handles token input change', () => {
  render(<SwapInterface />);
  const input = screen.getByPlaceholderText(/Enter amount/i);
  fireEvent.change(input, { target: { value: '100' } });
  expect(input).toHaveValue('100');
});
});