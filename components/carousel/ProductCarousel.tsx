'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  description: string;
  stock: number;
  weight?: number;
  tags: string[];
  featured: boolean;
  categoryId: {
    name: string;
    slug: string;
  };
}

interface ProductCarouselProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
  slidesToShow?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onLoginRequired?: () => void;
}

// Custom Arrow Components
const NextArrow = (props: any) => {
  const { style, onClick } = props;
  return (
    <div
      className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg p-3 rounded-full transition-all duration-200 z-10 text-gray-800 hover:bg-teal-50 hover:shadow-xl hover:scale-110 cursor-pointer"
      style={{ ...style, display: "block" }}
      onClick={onClick}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
};

const PrevArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <div
      className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg p-3 rounded-full transition-all duration-200 z-10 text-gray-800 hover:bg-teal-50 hover:shadow-xl hover:scale-110 cursor-pointer"
      style={{ ...style, display: "block" }}
      onClick={onClick}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </div>
  );
};

export default function ProductCarousel({
  products,
  onAddToCart,
  slidesToShow = 3,
  autoPlay = false,
  autoPlayInterval = 3000,
  onLoginRequired
}: ProductCarouselProps) {
  const router = useRouter();

  if (!products || products.length === 0) {
    return null;
  }

  const handleProductClick = (e: React.MouseEvent, productSlug: string) => {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // User not logged in, redirect to login page
      e.preventDefault();
      router.push('/auth/login');
      return;
    }
    // If logged in, allow normal navigation to product page
  };

  const handleAddToCartClick = (e: React.MouseEvent, productId: string) => {
    // Stop event from bubbling to parent Link
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // User not logged in, redirect to login page
      router.push('/auth/login');
      return;
    }
    
    // User is logged in, proceed with adding to cart
    onAddToCart(productId);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    autoplay: autoPlay,
    autoplaySpeed: autoPlayInterval,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, slidesToShow),
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, slidesToShow),
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ],
    customPaging: (i: number) => (
      <div className="w-3 h-3 rounded-full bg-gray-300 hover:bg-teal-400 transition-colors duration-200 cursor-pointer" />
    ),
    dotsClass: "slick-dots !flex !justify-center !items-center !space-x-2 !mt-8"
  };

  return (
    <div className="product-carousel">
      <style jsx global>{`
        .product-carousel .slick-dots {
          bottom: -50px !important;
        }
        
        .product-carousel .slick-dots li {
          margin: 0 4px !important;
        }
        
        .product-carousel .slick-dots li button {
          display: none !important;
        }
        
        .product-carousel .slick-dots li.slick-active > div {
          background-color: #0d9488 !important;
          transform: scale(1.1) !important;
        }
        
        .product-carousel .slick-track {
          display: flex !important;
          align-items: stretch !important;
        }
        
        .product-carousel .slick-slide > div {
          height: 100% !important;
        }
        
        .product-carousel .slick-slide > div > div {
          height: 100% !important;
          min-height: 500px !important;
        }
        
        .product-carousel .slick-slide {
          display: flex !important;
        }
      `}</style>
      
      <Slider {...settings}>
        {products.map((product) => {
          const discountPercentage = product.compareAtPrice && product.compareAtPrice > product.price 
            ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
            : 0;
          
          return (
            <div key={product._id} className="px-3 h-full">
              <div className="group bg-white rounded-lg overflow-hidden transition-all duration-300 flex flex-col h-[500px] border border-gray-100">
                <Link 
                  href={`/products/${product.slug}`} 
                  className="flex flex-col h-full"
                  onClick={(e) => handleProductClick(e, product.slug)}
                >
                  {/* Image Section */}
                  <div className="relative h-70 bg-gradient-to-br from-teal-50 to-teal-100 overflow-hidden">
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 bg-teal-500 text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
                      {product.categoryId?.name || 'Papad'}
                    </div>
                    
                    {/* Discount Badge */}
                    {discountPercentage > 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                        -{discountPercentage}%
                      </div>
                    )}

                    {/* Product Image */}
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">
                          {product.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Add to Cart Button - Appears on Hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-20">
                      <button 
                        onClick={(e) => handleAddToCartClick(e, product._id)}
                        disabled={product.stock <= 0}
                        className={`w-full flex items-center justify-center gap-2 h-12 px-4 font-semibold transition-all duration-200 ${
                          product.stock <= 0 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-teal-500 text-white cursor-pointer hover:bg-teal-600 transform hover:scale-105 active:scale-95'
                        }`}
                      >
                        {product.stock <= 0 ? (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>
                            Out of Stock
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                            </svg>
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>

                    {/* Stock Status Overlay */}
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-30">
                        <span className="text-white font-bold text-lg">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-6 text-left flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-teal-600 transition-colors h-[3rem] flex items-start">
                      {product.name}
                    </h3>
                    
                    <p className="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed flex-1 min-h-[4rem] max-h-[4rem] overflow-hidden">
                      {product.description}
                    </p>

                    {/* Price Section */}
                    <div className="mb-4 min-h-[4rem]">
                      <div className="flex items-center justify-between ">
                        {/* Left side - Price */}
                        <div className="text-left">
                          <span className="text-2xl font-bold text-gray-800">
                            ₹{product.price}
                          </span>
                          {product.weight && (
                            <span className="text-sm text-gray-500 ml-1">/ {product.weight}g</span>
                          )}
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <div className="text-sm text-gray-400 line-through">
                              ₹{product.compareAtPrice}
                            </div>
                          )}
                        </div>
                        
                        {/* Right side - Offer/Discount */}
                        {discountPercentage > 0 && (
                          <div className="text-right">
                            <span className="text-xs text-green-600 font-medium bg-green-50 px-2  rounded-full">
                              Save ₹{product.compareAtPrice! - product.price}
                            </span>
                            <div className="text-xs text-green-600 font-bold mt-1">
                              {discountPercentage}% OFF
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
}