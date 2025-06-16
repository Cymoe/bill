import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollRestoration() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Small delay to ensure DOM is updated
    const scrollToTop = () => {
      // Scroll the window
      window.scrollTo(0, 0);
      
      // Scroll all scrollable containers
      const scrollableElements = document.querySelectorAll('.overflow-y-auto, .overflow-y-scroll');
      scrollableElements.forEach(element => {
        element.scrollTop = 0;
      });
      
      // Specifically target the main content area
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.scrollTop = 0;
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(scrollToTop);
  }, [pathname]);

  return null;
}