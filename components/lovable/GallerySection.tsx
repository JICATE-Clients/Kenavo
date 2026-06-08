'use client';

import React from 'react';
import Link from 'next/link';

const GallerySection = () => {
  return (
    <section
      id="gallery"
      className="w-full py-8 sm:py-10 md:py-12 lg:py-14"
      style={{ backgroundColor: '#ffffff' }}
      aria-labelledby="gallery-heading"
    >
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-5 sm:mb-6 md:mb-8">
          <h2
            id="gallery-heading"
            className="font-bold leading-tight"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: '1.2', color: 'rgba(78,46,140,1)' }}
          >
            Snapshots from the Hill
          </h2>
          <p
            className="text-[rgba(217,81,100,1)] font-normal mt-4 sm:mt-5 md:mt-6"
            style={{ fontSize: 'clamp(15px, 1.8vw, 20px)', lineHeight: '1.5' }}
          >
            School days. Reunions. Everything in between.
          </p>
        </div>

        {/* Gallery Preview Image */}
        <div className="w-full flex items-center justify-center mb-5 sm:mb-6 md:mb-8">
          <img
            src="https://api.builder.io/api/v1/image/assets/b95740542f8a4181a070e70dfc13758e/93ac5ec72bbc1db90c9a7382fddaa6ace2c20646?placeholderIfAbsent=true"
            alt="Gallery preview showing various school and reunion photos"
            className="w-auto max-w-full max-h-[450px] object-contain rounded-lg shadow-lg"
          />
        </div>

        {/* View Gallery Button */}
        <div className="flex justify-center">
          <Link href="/gallery">
            <button className="bg-[rgba(217,81,100,1)] text-neutral-100 font-black text-sm sm:text-base px-8 sm:px-12 md:px-14 py-2.5 sm:py-3 !rounded-full hover:bg-[rgba(197,61,80,1)] hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg focus:outline-none focus:ring-4 focus:ring-[rgba(217,81,100,0.3)] focus:ring-offset-2 focus:ring-offset-[rgba(64,34,120,1)]">
              View Gallery
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
