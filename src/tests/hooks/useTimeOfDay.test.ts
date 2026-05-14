import { renderHook, act } from '@testing-library/react';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';

describe('useTimeOfDay Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  it('should return morning time', () => {
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(8);
    const { result } = renderHook(() => useTimeOfDay());
    expect(result.current.timeOfDay).toBe('morning');
  });

  it('should return afternoon time', () => {
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(14);
    const { result } = renderHook(() => useTimeOfDay());
    expect(result.current.timeOfDay).toBe('afternoon');
  });

  it('should return evening time', () => {
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(18);
    const { result } = renderHook(() => useTimeOfDay());
    expect(result.current.timeOfDay).toBe('evening');
  });

  it('should return night time', () => {
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(22);
    const { result } = renderHook(() => useTimeOfDay());
    expect(result.current.timeOfDay).toBe('night');
  });

  it('should update time when hour changes', () => {
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(8);
    const { result } = renderHook(() => useTimeOfDay());
    expect(result.current.timeOfDay).toBe('morning');
    
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(14);
    act(() => {
      jest.advanceTimersByTime(60000);
    });
    expect(result.current.timeOfDay).toBe('afternoon');
  });
});