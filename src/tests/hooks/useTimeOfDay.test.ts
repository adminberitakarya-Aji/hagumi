import { renderHook } from '@testing-library/react';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';

describe('useTimeOfDay Hook', () => {
  it('should return morning time', () => {
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(8);
    const { result } = renderHook(() => useTimeOfDay());
    expect(result.current).toBe('morning');
  });

  it('should return afternoon time', () => {
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(14);
    const { result } = renderHook(() => useTimeOfDay());
    expect(result.current).toBe('afternoon');
  });

  it('should return evening time', () => {
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(18);
    const { result } = renderHook(() => useTimeOfDay());
    expect(result.current).toBe('evening');
  });

  it('should return night time', () => {
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(22);
    const { result } = renderHook(() => useTimeOfDay());
    expect(result.current).toBe('night');
  });

  it('should update time when hour changes', () => {
    const { result, rerender } = renderHook(() => useTimeOfDay());
    
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(8);
    rerender();
    expect(result.current).toBe('morning');
    
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(14);
    rerender();
    expect(result.current).toBe('afternoon');
  });
});