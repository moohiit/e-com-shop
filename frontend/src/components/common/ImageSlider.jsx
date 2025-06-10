import { useEffect, useRef, useState } from 'react';

const ImageSlider = ({ images, width = '100px', height = '80px', interval = 2000 }) => {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);

  const startAutoSlide = () => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);
  };

  const stopAutoSlide = () => {
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [images.length]);

  if (!images || images.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded"
      style={{ width, height }}
      onMouseEnter={stopAutoSlide}
      onMouseLeave={startAutoSlide}
    >
      <img
        src={images[current].imageUrl}
        alt="Product"
        className="w-full h-full object-cover transition-all duration-300"
      />
    </div>
  );
};

export default ImageSlider;
