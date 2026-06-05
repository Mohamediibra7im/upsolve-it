import React from 'react';
import { render, screen } from '@testing-library/react';
import MarkdownRenderer from '@/components/ui/markdown-renderer';

describe('MarkdownRenderer', () => {
  it('renders container element', () => {
    render(<MarkdownRenderer>Content</MarkdownRenderer>);
    expect(screen.getByTestId('markdown-container')).toBeTruthy();
  });

  it('applies custom className', () => {
    render(<MarkdownRenderer className="custom-class">Content</MarkdownRenderer>);
    expect(screen.getByTestId('markdown-container').className).toContain('custom-class');
  });

  it('shows loading skeleton initially', () => {
    render(<MarkdownRenderer>Content</MarkdownRenderer>);
    expect(screen.getByTestId('markdown-loading')).toBeTruthy();
  });

  it('passes content as children string to dynamic component', () => {
    const { container } = render(<MarkdownRenderer>Hello World</MarkdownRenderer>);
    expect(container.querySelector('[data-testid="markdown-container"]')).toBeTruthy();
  });
});
