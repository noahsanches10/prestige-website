'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface GalleryProps {
  content: any;
}

function getBackgroundClass(background: string) {
  switch (background) {
    case 'white':
      return 'bg-white';
    case 'primary-light':
      return 'bg-primary-light';
    case 'secondary-light':
      return 'bg-secondary-light';
    case 'accent-light':
      return 'bg-accent-light';
    default:
      return 'bg-gray-50';
  }
}

export default function Gallery({ content }: GalleryProps) {
  const section = content.sections?.gallery;
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!section?.enabled || !section?.items?.length) {
    return null;
  }

  const displayStyle = section.displayStyle || 'grid';
  const autoRotateInterval = parseInt(section.autoRotateInterval || '5');
  const items = section.items;

  // Carousel navigation
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Auto-rotation
  useEffect(() => {
    if (displayStyle === 'carousel' && autoRotateInterval > 0) {
      const interval = setInterval(nextSlide, autoRotateInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [displayStyle, autoRotateInterval, nextSlide, currentSlide]);

  // Helpers
  const isPortrait = (img: any) => {
    if (!img) return false;
    if (typeof img === 'object' && img.width && img.height) {
      return img.height > img.width;
    }
    if (typeof img === 'string') {
      const match = img.match(/-(\d{2,5})x(\d{2,5})\./);
      if (match) {
        const w = parseInt(match[1], 10);
        const h = parseInt(match[2], 10);
        return h > w;
      }
    }
    return false;
  };

  const getSrcDims = (img: any) => {
    if (!img) return { src: '', width: undefined, height: undefined };
    if (typeof img === 'string') return { src: img, width: undefined, height: undefined };
    return { src: img.src, width: img.width, height: img.height };
  };

  const getDimsWithFallback = (portrait: boolean, width?: number, height?: number) => {
    if (width && height) return { width, height };
    return portrait
      ? { width: 800, height: 1200 }
      : { width: 1600, height: 1000 };
  };

  // For carousel only: landscape wrapper
  const getLandscapeAspect = () => 'aspect-[16/10]';

  const renderOneImage = (
    src: string,
    alt: string,
    portrait: boolean,
    dims?: { width?: number; height?: number },
    badge?: 'Before' | 'After',
    badgePos: 'left' | 'right' = 'left',
    forceNaturalHeight: boolean = false
  ) => {
    const { width, height } = getDimsWithFallback(portrait, dims?.width, dims?.height);

    // In grid mode we always use natural height
    if (forceNaturalHeight) {
      return (
        <div className="relative w-full">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="w-full h-auto object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {badge && (
            <div className={`absolute top-4 ${badgePos === 'left' ? 'left-4' : 'right-4'}`}>
              <Badge variant="secondary" className={badge === 'Before' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                {badge === 'Before' ? 'Avant' : 'Apres'}
              </Badge>
            </div>
          )}
        </div>
      );
    }

    // Carousel: keep landscape aspect ratio boxes
    if (!portrait) {
      return (
        <div className={`relative ${getLandscapeAspect()}`}>
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {badge && (
            <div className={`absolute top-4 ${badgePos === 'left' ? 'left-4' : 'right-4'}`}>
              <Badge variant="secondary" className={badge === 'Before' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                {badge}
              </Badge>
            </div>
          )}
        </div>
      );
    }

    // Carousel: portrait inside aspect box
    return (
      <div className="relative w-full">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {badge && (
          <div className={`absolute top-4 ${badgePos === 'left' ? 'left-4' : 'right-4'}`}>
            <Badge variant="secondary" className={badge === 'Before' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
              {badge === 'Before' ? 'Avant' : 'Apres'}
            </Badge>
          </div>
        )}
      </div>
    );
  };

  const renderGalleryItem = (item: any, index: number, isCarousel: boolean = false) => {
    const { src: beforeSrc, width: bw, height: bh } = getSrcDims(item.beforeImage);
    const { src: afterSrc, width: aw, height: ah } = getSrcDims(item.afterImage);

    const beforePortrait = isPortrait(item.beforeImage);
    const afterPortrait = isPortrait(item.afterImage);

    return (
      <Card
        key={index}
        className={`border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden ${
          isCarousel ? 'w-full' : ''
        }`}
      >
        <CardContent className="p-0">
          <div className="relative">
            {/* Images */}
            <div className={`grid ${afterSrc ? 'grid-cols-2' : 'grid-cols-1'} items-start`}>
              {beforeSrc && renderOneImage(
                beforeSrc,
                afterSrc ? `${item.title} - Before` : item.title,
                !!beforePortrait,
                { width: bw, height: bh },
                afterSrc ? 'Before' : undefined,
                'left',
                !isCarousel // force natural height in grid
              )}
              {afterSrc && renderOneImage(
                afterSrc,
                beforeSrc ? `${item.title} - After` : item.title,
                !!afterPortrait,
                { width: aw, height: ah },
                beforeSrc ? 'After' : undefined,
                'right',
                !isCarousel // force natural height in grid
              )}
            </div>

            {/* Content */}
            {(item.title || item.description) && (
              <div className="p-6">
                {item.title && (
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                )}
                {item.description && (
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <section className={`py-20 ${getBackgroundClass(section.background || 'gray')}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {section.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {section.subtitle}
          </p>
        </div>

        {/* Gallery Content */}
        {displayStyle === 'grid' ? (
          // Grid Layout — natural heights now
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {items.map((item: any, index: number) => renderGalleryItem(item, index))}
          </div>
        ) : (
          // Carousel Layout — aspect ratio maintained
          <div className="relative max-w-4xl mx-auto">
            {/* Carousel Container */}
            <div className="relative overflow-hidden rounded-lg">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {items.map((item: any, index: number) => (
                  <div key={index} className="w-full flex-shrink-0">
                    {renderGalleryItem(item, index, true)}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            {items.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 z-10"
                  aria-label="Diapositive precedente"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 z-10"
                  aria-label="Diapositive suivante"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Pagination Dots */}
            {items.length > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {items.map((_: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                      currentSlide === index
                        ? 'bg-primary'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Aller a la diapositive ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
