import { renderHook, act } from '@testing-library/react-hooks';
import { useSwap } from './useSwap';

describe('useSwap', () => {
it('should calculate swap amount correctly', () => {
  const { result } = renderHook(() => useSwap());

  act(() => {
    result.current.setInputAmount('100');
  });

  expect(result.current.outputAmount).toBe('98'); // Assuming 2% fee
});
});