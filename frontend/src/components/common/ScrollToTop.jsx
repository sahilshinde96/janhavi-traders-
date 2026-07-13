import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  const lastPathname = useRef(pathname);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const pathChanged = lastPathname.current !== pathname;
    lastPathname.current = pathname;

    const activeEl = document.activeElement;
    const isTyping = activeEl && 
      ((activeEl.tagName === 'INPUT' && activeEl.type !== 'checkbox' && activeEl.type !== 'radio') || 
       activeEl.tagName === 'TEXTAREA');

    if (pathChanged || !isTyping) {
      const performScroll = () => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        if (document.body) {
          document.body.scrollTop = 0;
        }
      };

      performScroll();
      requestAnimationFrame(performScroll);
      const timer = setTimeout(performScroll, 50);
      return () => clearTimeout(timer);
    }
  }, [pathname, search]);

  return null;
}
