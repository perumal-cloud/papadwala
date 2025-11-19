'use client';
import { useState, useEffect } from 'react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  comment: string;
  image?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Naga Priya',
    location: 'Madurai',
    rating: 5,
    comment: 'These papads are absolutely delicious! Reminds me of my grandmother\'s cooking. The quality is exceptional and delivery is always on time.'
  },
  {
    id: 2,
    name: 'Kumar',
    location: 'Kovilpatti',
    rating: 5,
    comment: 'Best papads I\'ve ever tasted! The traditional flavors are authentic and the crispiness is perfect. Highly recommended for all papad lovers.'
  },
  {
    id: 3,
    name: 'Ranjith Pandi',
    location: 'Dindugal',
    rating: 5,
    comment: 'Amazing quality and taste! My family loves these papads. They are made with such care and attention to detail. Will definitely order again.'
  },
  {
    id: 4,
    name: 'Abirami',
    location: 'Vathagundu',
    rating: 4,
    comment: 'Great variety and excellent packaging. The papads arrived fresh and crispy. Perfect for family meals and special occasions.'
  },
  {
    id: 5,
    name: 'Naveen Kumar',
    location: 'Chennai',
    rating: 5,
    comment: 'Outstanding taste and quality! These handcrafted papads are a treat for the taste buds. Love the traditional preparation method.'
  },
  {
    id: 6,
    name: 'Perumal',
    location: 'Madurai',
    rating: 5,
    comment: 'Excellent service and product quality. The papads are crispy, flavorful, and made with natural ingredients. Truly satisfied with my purchase.'
  }
];

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(testimonials.length / 2));
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(testimonials.length / 2));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(testimonials.length / 2)) % Math.ceil(testimonials.length / 2));
  };

  const goToSlide = (slide: number) => {
    setCurrentSlide(slide);
  };
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        } transition-colors duration-200`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-teal-50 via-white to-teal-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border border-teal-300 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 border border-teal-300 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 border border-teal-300 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-black mb-6">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Hear from our satisfied customers who love our authentic handcrafted papads.
          </p>
          <div className="mt-6 w-24 h-1 bg-gradient-to-r from-teal-400 to-teal-400 mx-auto rounded-full"></div>
        </div>

        {/* Testimonials Carousel */}
        <div 
          className="relative"
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
        >
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: Math.ceil(testimonials.length / 2) }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-2 px-4">
                    {testimonials.slice(slideIndex * 2, slideIndex * 2 + 2).map((testimonial, index) => (
                      <div
                        key={testimonial.id}
                        className="flex items-start space-x-6 p-6 transition-all duration-300"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Profile Image */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {testimonial.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>

                        {/* Review Content */}
                        <div className="flex-1 min-w-0">
                          {/* Customer Name */}
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {testimonial.name}
                          </h3>
                          
                          {/* Product Info */}
                          <p className="text-sm text-gray-500 mb-3">
                            has purchased our traditional papads
                          </p>

                          {/* Rating */}
                          <div className="flex items-center mb-4">
                            {renderStars(testimonial.rating)}
                          </div>

                          {/* Review Text */}
                          <blockquote className="text-gray-700 leading-relaxed text-base">
                            {testimonial.comment}
                          </blockquote>

                          {/* Location */}
                          <div className="mt-4 text-sm text-gray-500 flex items-center">
                            <svg className="w-4 h-4 mr-1 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000-4z" clipRule="evenodd" />
                            </svg>
                            {testimonial.location}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-3 hover:bg-teal-50 transition-all duration-200 hover:shadow-xl group"
            aria-label="Previous testimonials"
          >
            <svg className="w-6 h-6 text-teal-600 group-hover:text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-3 hover:bg-teal-50 transition-all duration-200 hover:shadow-xl group"
            aria-label="Next testimonials"
          >
            <svg className="w-6 h-6 text-teal-600 group-hover:text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center mt-12 space-x-3">
          {Array.from({ length: Math.ceil(testimonials.length / 2) }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-gradient-to-r from-teal-500 to-teal-500 w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/20">
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600 mb-2">5000+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600 mb-2">4.9★</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600 mb-2">100%</div>
            <div className="text-gray-600">Natural Ingredients</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600 mb-2">50+</div>
            <div className="text-gray-600">Varieties</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers who love our papads!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="/products"
              className="group px-10 py-4 bg-gradient-to-r from-teal-500 to-teal-500 text-white font-bold hover:from-teal-600 hover:to-teal-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden"
            >
              <span className="relative z-10">Shop Our Papads</span>
              <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            </a>
            <a
              href="/contact"
              className="px-10 py-4 border-2 border-teal-500 text-teal-600 font-bold hover:bg-teal-500 hover:text-white transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Share Your Review
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;