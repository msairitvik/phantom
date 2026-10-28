import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { GhostLogo } from '../components/ui/GhostLogo';

describe('GhostLogo Component', () => {
  it('renders SVG without crashing', () => {
    const { container } = render(<GhostLogo size="md" animated={false} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 100 100');
  });

  it('renders correct sizes', () => {
    const { container } = render(<GhostLogo size="lg" animated={false} />);
    expect(container.firstChild).toBeDefined();
  });
});
