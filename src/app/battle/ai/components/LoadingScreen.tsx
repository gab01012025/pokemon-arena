'use client';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="pokeball-loader" />
        <p className="loading-text">Loading...</p>
      </div>
    </div>
  );
}
