'use client';

import { useState, useEffect } from 'react';

export function OnlineCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Simulate online players with a realistic base + random variation
    const base = 42;
    const variation = Math.floor(Math.random() * 20);
    setCount(base + variation);

    const interval = setInterval(() => {
      setCount((prev) => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(15, prev + change);
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <div className="online-counter">
      <span className="online-dot" />
      <span className="online-text">{count} trainers online</span>
    </div>
  );
}
