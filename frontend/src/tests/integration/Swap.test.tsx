import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Connect } from '@stacks/connect-react';
import App from '../../App';

jest.mock('@stacks/connect-react', () => ({
Connect: ({ children }: { children: React.ReactNode }) => <>{children}</>,
useConnect: () => ({
  doContractCall: jest.fn(),
  userSession: { isUserSignedIn: () => true },
}),
}));

describe('Swap Integration', () => {
it('completes a swap transaction', async () => {
  render(
    <Connect>
      <App />
    </Connect>
  );

  // Simuler une transaction de swap
  const inputAmount = screen.getByPlaceholderText(/Enter amount/i);
  fireEvent.change(inputAmount, { target: { value: '100' } });

  const swapButton = screen.getByText(/Swap/i);
  fireEvent.click(swapButton);

  await waitFor(() => {
    expect(screen.getByText(/Transaction successful/i)).toBeInTheDocument();
  });
});
});