import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';

const url = 'https://userpic.codeforces.org/422/avatar/2b5dbe87f0d859a2.jpg';

describe('Codeforces avatar recovery', () => {
  let images: HTMLImageElement[];
  const OriginalImage = window.Image;
  beforeEach(() => {
    jest.useFakeTimers();
    images = [];
    window.Image = jest.fn(() => { const image = document.createElement('img'); images.push(image); return image; }) as unknown as typeof window.Image;
  });
  afterEach(() => { window.Image = OriginalImage; jest.useRealTimers(); });
  it('uses the cached same-origin image route and recovers after an upstream failure', () => {
    render(<Avatar><AvatarImage src={url} alt="tourist" /><AvatarFallback>T</AvatarFallback></Avatar>);
    expect(images[0].getAttribute('src')).toBe('/api/profile-image?url=' + encodeURIComponent(url));
    act(() => images[0].dispatchEvent(new Event('error')));
    expect(screen.getByText('T')).toBeTruthy();
    act(() => jest.advanceTimersByTime(2000));
    expect(images).toHaveLength(2);
    Object.defineProperties(images[1], { complete: { value: true }, naturalWidth: { value: 100 } });
    act(() => images[1].dispatchEvent(new Event('load')));
    expect(screen.getByRole('img', { name: 'tourist' })).toBeTruthy();
    expect(screen.queryByText('T')).toBeNull();
  });
  it('bounds retries and cancels pending work when unmounted', () => {
    const view = render(<Avatar><AvatarImage src={url} alt="tourist" /><AvatarFallback>T</AvatarFallback></Avatar>);
    for (const delay of [2000, 10000, 60000]) {
      act(() => images.at(-1)!.dispatchEvent(new Event('error')));
      act(() => jest.advanceTimersByTime(delay));
    }
    expect(images).toHaveLength(3);
    view.unmount();
    act(() => jest.runAllTimers());
    expect(images).toHaveLength(3);
  });
});
