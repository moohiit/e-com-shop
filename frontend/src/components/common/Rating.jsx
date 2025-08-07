import React from 'react';
import { Star, StarHalf } from 'lucide-react';

const Rating = ({ value, text, color = '#f8e825' }) => {
  return (
    <div className="flex items-center">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((index) => {
          if (value >= index) {
            return (
              <Star
                key={index}
                size={18}
                className="fill-current"
                style={{ color }}
              />
            );
          } else if (value >= index - 0.5) {
            return (
              <div key={index} className="relative">
                <Star
                  size={18}
                  className="absolute top-0 left-0 text-gray-300"
                />
                <StarHalf
                  size={18}
                  className="fill-current"
                  style={{ color }}
                />
              </div>
            );
          } else {
            return (
              <Star
                key={index}
                size={18}
                className="text-gray-300"
              />
            );
          }
        })}
      </div>
      {text && <span className="ml-2 text-gray-600 dark:text-gray-400">{text}</span>}
    </div>
  );
};

export default Rating;