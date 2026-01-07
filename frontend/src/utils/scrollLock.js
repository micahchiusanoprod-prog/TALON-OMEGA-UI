// Utility to manage body scroll lock for modals
// This prevents the page from scrolling when a modal is open

let scrollPosition = 0;
let lockCount = 0;

export const lockBodyScroll = () => {
  if (lockCount === 0) {
    scrollPosition = window.scrollY;
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
