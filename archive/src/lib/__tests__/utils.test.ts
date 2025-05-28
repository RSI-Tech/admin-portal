import { cn } from '../utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const result = cn('base-class', true && 'conditional-class', false && 'hidden-class');
    expect(result).toBe('base-class conditional-class');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('should handle undefined and null values', () => {
    const result = cn('valid-class', undefined, null, 'another-class');
    expect(result).toBe('valid-class another-class');
  });

  it('should handle Tailwind class conflicts', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle whitespace and empty strings', () => {
    const result = cn('', '  ', 'valid-class', '   ');
    expect(result).toBe('valid-class');
  });

  it('should handle complex class merging scenarios', () => {
    const result = cn(
      'px-4 py-2 bg-blue-500 text-white',
      'hover:bg-blue-600',
      false && 'hidden',
      'focus:outline-none'
    );
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
    expect(result).toContain('bg-blue-500');
    expect(result).toContain('text-white');
    expect(result).toContain('hover:bg-blue-600');
    expect(result).toContain('focus:outline-none');
    expect(result).not.toContain('hidden');
  });
});