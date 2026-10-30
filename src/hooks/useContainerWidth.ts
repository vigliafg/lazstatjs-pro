import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Width of a container, measured with `ResizeObserver`.
 *
 * The session-report switches between the side outline and the drawer on the
 * width of the output pane, not on the viewport: the same window can be wide
 * on screen and narrow because the library or setup panel is open.
 */
export const useContainerWidth = <T extends HTMLElement>(): [
  RefObject<T | null>,
  number,
] => {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setWidth(element.getBoundingClientRect().width);
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
};
