import React from 'react';

export default function Hero() {
  return (
    <div className="bg-gradient-to-r from-primary to-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-5xl font-bold mb-6">
          Welcome to HealthFlexx
        </h1>
        <p className="text-xl text-white/90 max-w-2xl mb-8">
          Your comprehensive guide to health, wellness, and personal growth. Discover expert insights on nutrition, fitness, and mindful living.
        </p>
      </div>
    </div>
  );
}