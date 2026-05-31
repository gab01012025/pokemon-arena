'use client';

import { useEffect } from 'react';

export function ScrollAnimations() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-visible');

            // Stagger children with scroll-reveal-item class
            const items = entry.target.querySelectorAll('.scroll-reveal-item');
            items.forEach((item, index) => {
              setTimeout(() => {
                item.classList.add('scroll-visible');
              }, index * 100);
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
