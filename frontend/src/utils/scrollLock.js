// Utility to manage body scroll lock for modals
// This prevents the page from scrolling when a modal is open

let scrollPosition = 0;
let lockCount = 0;

// Call this BEFORE any action that might trigger scrolling
export const captureScrollPosition = () => {
  if (lockCount === 0) {
    window.__capturedScrollPosition = window.scrollY;
  }
};

export const lockBodyScroll = () => {
  if (lockCount === 0) {
    // Use pre-captured position if available, otherwise use current
    scrollPosition = window.__capturedScrollPosition ?? window.scrollY;
    delete window.__capturedScrollPosition;
    
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
    document.body.style.overflowY = 'scroll';
  }
  lockCount++;
};

export const unlockBodyScroll = () => {
  lockCount--;
  if (lockCount <= 0) {
    lockCount = 0;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflowY = '';
    window.scrollTo(0, scrollPosition);
  }
};

export const getLockedScrollPosition = () => scrollPosition;
