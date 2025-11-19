'use client';
import { useState } from 'react';
import Image from 'next/image';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  title?: string;
  category?: string;
  description?: string;
}

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    src: '/images/gallery1.jpg',
    alt: 'Traditional papad making process',
    title: 'Handcrafted with Love',
    category: 'Traditional',
    description: 'Authentic papad made using age-old traditional methods passed down through generations. Each papad is carefully rolled by hand, preserving the artisanal quality that makes our products truly special. The dedication and skill of our craftspeople ensures every bite carries the essence of tradition.'
  },
  {
    id: 2,
    src: '/images/carosuel2.jpg',
    alt: 'Fresh papad ingredients',
    title: 'Premium Ingredients',
    category: 'Quality',
    description: 'Only the finest ingredients sourced from trusted farmers across India. We select premium quality lentils, rice flour, and aromatic spices that form the foundation of our delicious papads. Our commitment to quality starts from the very first ingredient, ensuring exceptional taste in every product.'
  },
  {
    id: 3,
    src: '/images/gallery4.jpg',
    alt: 'Papads drying in sunlight',
    title: 'Sun-Dried Perfection',
    category: 'Process',
    description: 'Natural sun-drying process that gives papads their authentic taste and texture. Under the warm Indian sun, our papads develop their characteristic crispness and concentrated flavors. This time-tested method requires patience but delivers unmatched quality that modern machines simply cannot replicate.'
  },
  {
    id: 4,
    src: '/images/carosule4.jpg',
    alt: 'Different varieties of papads',
    title: 'Diverse Collection',
    category: 'Variety',
    description: 'Wide range of flavors and varieties to suit every palate and preference. From classic plain papads to spicy pepper varieties, herb-infused options, and regional specialties. Each variety is crafted with unique spice blends and ingredients, offering a delightful culinary journey through different tastes of India.'
  },
  {
    id: 5,
    src: '/images/carosuel1.jpg',
    alt: 'Traditional rolling technique',
    title: 'Traditional Methods',
    category: 'Craft',
    description: 'Time-honored techniques ensure consistent quality and authentic taste. Our skilled artisans use traditional wooden rolling pins and techniques perfected over decades. The precise thickness, uniform texture, and perfect consistency achieved through these methods create papads that cook evenly and deliver exceptional crispiness.'
  },
  {
    id: 6,
    src: '/images/gallery7.jpg',
    alt: 'Cooking fresh papads',
    title: 'Ready to Serve',
    category: 'Cooking',
    description: 'Fresh, crispy papads ready to be enjoyed with your favorite meals. Whether deep-fried to golden perfection or flame-roasted for a smoky flavor, our papads transform into delightful accompaniments. The satisfying crunch and burst of flavors make every meal more enjoyable and memorable.'
  },
  {
    id: 7,
    src: '/images/gallery2.jpg',
    alt: 'Family making papads together',
    title: 'Family Tradition',
    category: 'Heritage',
    description: 'Multi-generational expertise passed down through loving family traditions. Our recipes and techniques have been carefully preserved and passed down through three generations of papad makers. This rich heritage brings authenticity, passion, and deep cultural knowledge to every product we create.'
  },
  {
    id: 8,
    src: '/images/carosule3.jpg',
    alt: 'Aromatic spices for papads',
    title: 'Authentic Flavors',
    category: 'Spices',
    description: 'Carefully selected aromatic spices create the distinctive taste profile. Our master spice blenders combine cumin, black pepper, asafoetida, and other premium spices in precise proportions. Each spice is sourced directly from spice gardens and ground fresh to maintain potency and create the complex, layered flavors our papads are known for.'
  }
];

const ImageGallery = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const openModal = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <section className="py-10 bg-gradient-to-br from-teal-50 via-white to-yellow-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-40 h-40 border border-teal-300 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-56 h-56 border border-yellow-300 rounded-full"></div>
        <div className="absolute top-1/3 right-1/4 w-32 h-32 border border-red-300 rounded-full"></div>
      </div>

      <div className="max-w-8xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-black mb-6">
  Image Gallery
</h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            You can change the image gallery block to instagram gallery apps
          </p>
          <div className="mt-6 w-24 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 mx-auto rounded-full"></div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {galleryImages.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden cursor-pointer"
              onClick={() => openModal(image)}
            >
              {/* Image Container with Aspect Ratio */}
              <div className="relative aspect-square bg-gradient-to-br from-teal-200 to-cyan-200 overflow-hidden">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />

                {/* Detailed Content Overlay sliding from bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/30 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out flex items-end">
                  <div className="text-center p-4 w-full">
                    {/* Category Badge */}
                    <div className="inline-block bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                      {image.category}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-white text-lg font-bold mb-2 leading-tight">
                      {image.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
                      {image.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instagram Integration Info */}
        <div className="mt-16 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/20 p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg p-3 mr-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.404-5.965 1.404-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.99 3.992-.281 1.189.597 2.159 1.769 2.159 2.123 0 3.756-2.239 3.756-5.471 0-2.861-2.056-4.86-4.991-4.86-3.398 0-5.393 2.549-5.393 5.184 0 1.027.395 2.127.889 2.726a.36.36 0 01.083.343c-.091.378-.293 1.189-.332 1.355-.053.218-.173.265-.4.159-1.492-.694-2.424-2.875-2.424-4.627 0-3.769 2.737-7.229 7.892-7.229 4.144 0 7.365 2.953 7.365 6.899 0 4.117-2.595 7.431-6.199 7.431-1.211 0-2.357-.63-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Connect with Instagram</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Replace this gallery with live Instagram feed to showcase your latest papad creations and behind-the-scenes moments.
            </p>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-teal-500 text-white font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.404-5.965 1.404-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.99 3.992-.281 1.189.597 2.159 1.769 2.159 2.123 0 3.756-2.239 3.756-5.471 0-2.861-2.056-4.86-4.991-4.86-3.398 0-5.393 2.549-5.393 5.184 0 1.027.395 2.127.889 2.726a.36.36 0 01.083.343c-.091.378-.293 1.189-.332 1.355-.053.218-.173.265-.4.159-1.492-.694-2.424-2.875-2.424-4.627 0-3.769 2.737-7.229 7.892-7.229 4.144 0 7.365 2.953 7.365 6.899 0 4.117-2.595 7.431-6.199 7.431-1.211 0-2.357-.63-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
              </svg>
              Follow on Instagram
            </a>
          </div>
        </div>
      </div>

      {/* Modal for Image Preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="relative bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-white/90 rounded-full p-2 hover:bg-white transition-colors z-10"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="relative aspect-video bg-gradient-to-br from-teal-400 to-cyan-400 overflow-hidden">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
              
              {/* Overlay with title */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-white text-2xl font-bold mb-2">{selectedImage.title}</h3>
                <p className="text-white/80 text-lg">{selectedImage.alt}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ImageGallery;