"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=2200&q=90",
    position: "center 54%",
  },
  {
    image:
      "https://images.unsplash.com/photo-1757387240036-d7eb9b096c40?auto=format&fit=crop&w=2200&q=90",
    position: "center 52%",
  },
  {
    image:
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=2200&q=90",
    position: "center 56%",
  },
];

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 5500);

    return () => window.clearInterval(intervalId);
  }, []);

  function showPrevious() {
    setActiveIndex((index) => (index - 1 + slides.length) % slides.length);
  }

  function showNext() {
    setActiveIndex((index) => (index + 1) % slides.length);
  }

  return (
    <>
      <div className="hero-photos" aria-hidden="true">
        {slides.map((slide, index) => (
          <div
            className={`hero-photo${index === activeIndex ? " is-active" : ""}`}
            key={slide.image}
            style={{
              backgroundImage: `url("${slide.image}")`,
              backgroundPosition: slide.position,
            }}
          />
        ))}
      </div>
      <div className="hero-slider-controls" role="group" aria-label="Hero images">
        <button aria-label="Previous image" onClick={showPrevious} type="button">
          <span aria-hidden="true">←</span>
        </button>
        <div className="hero-slider-dots">
          {slides.map((slide, index) => (
            <button
              aria-label={`Show image ${index + 1} of ${slides.length}`}
              aria-pressed={index === activeIndex}
              className={index === activeIndex ? "is-active" : ""}
              key={slide.image}
              onClick={() => setActiveIndex(index)}
              type="button"
            />
          ))}
        </div>
        <button aria-label="Next image" onClick={showNext} type="button">
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </>
  );
}
