'use client';

import React from 'react';

const MainBanner = () => {
  return (
    <section className="mx-auto max-w-[1280px] px-4 my-6 md:px-6 md:my-8">
      <img
        src="/banner.png"
        alt="Pikit banner"
        className="w-full h-[80px] object-cover md:h-[120px]"
        style={{ borderRadius: 'var(--radius-lg)' }}
      />
    </section>
  );
};

export default MainBanner;
