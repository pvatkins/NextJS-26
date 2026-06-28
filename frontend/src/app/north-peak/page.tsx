// frontend/src/app/north-peak/page.js

// Import the Image component from next/image for optimized images
import Image from "next/image";

export const metadata = {
  title: "CARC North Peak Repeater Site", // More descriptive title
  description:
    "A photo tour of the North Peak repeater site, including past and recent installations and key personnel.",
};

// Centralize image data
const northPeakPhotos = [
  {
    src: "/images/northpeak/fullantenna.jpg", // Adjust path relative to public/
    alt: "The Repeater Bunker and Antenna Mast on North Peak",
    caption: "The Bunker",
    width: 500, // Replace with actual dimensions if known, or use 'fill'
    height: 666, // Replace with actual dimensions if known, or use 'fill'
  },
  {
    src: "/images/northpeak/tow2.jpg", // Adjust path relative to public/
    alt: "Old repeaters being hauled out from the bunker",
    caption: "The old repeaters hauled out",
    width: 500,
    height: 666,
  },
  {
    src: "/images/northpeak/tow.jpg", // Adjust path relative to public/
    alt: "New repeaters installed in place inside the bunker",
    caption: "The new repeaters in place",
    width: 500,
    height: 666,
  },
  {
    src: "/images/northpeak/emptytow.jpg", // Adjust path relative to public/
    alt: "Bill Dunbar and Bill Lillie at the repeater site",
    caption: "Bill Dunbar and Bill Lillie",
    width: 500,
    height: 666,
  },
  {
    src: "/images/northpeak/newrepeater.jpg", // Adjust path relative to public/
    alt: "Repeater cavities, components used for signal filtering",
    caption: "The Cavities",
    width: 500,
    height: 376,
  },
  {
    src: "/images/northpeak/roger.jpg", // Adjust path relative to public/
    alt: "Roger making connections at the repeater installation",
    caption: "Roger makes connections",
    width: 500,
    height: 376,
  },
];

export default function CARCNorthPeak() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      <h1 className="text-4xl font-extrabold text-blue-800 mb-6 text-center">
        The CARC North Peak Repeater Site
      </h1>

      <p className="text-gray-700 leading-relaxed text-lg mb-8 text-center">
        Here's a brief photo description of the North Peak site where the repeater is installed.
        We'll add more photos of the recent repeater installation process soon!
      </p>

      {/* Grid container for photos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {northPeakPhotos.map((photo, index) => (
          <figure
            key={index} // Index is okay for static lists like this
            className="bg-white shadow-lg rounded-xl overflow-hidden flex flex-col items-center"
          >
            {/* Using Next.js Image component for optimization */}
            <div className="w-full h-auto relative"> {/* Container for Image component if using layout="responsive" or fill */}
               {/*
                 IMPORTANT: You MUST replace width/height with actual dimensions
                 if you want fixed aspect ratio. If you want images to fill
                 their parent div and crop, use 'fill' prop on Image.
                 Example for 'fill':
                 <Image
                   src={photo.src}
                   alt={photo.alt}
                   fill // Make image fill parent
                   style={{ objectFit: 'cover' }} // Cover the container while maintaining aspect ratio
                   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Optimize for different viewports
                 />
               */}
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}   // Set actual width from data
                height={photo.height} // Set actual height from data
                className="w-full h-auto object-cover" // Ensure image covers its container
              />
            </div>
            
            <figcaption className="p-4 text-center text-gray-700 font-medium text-lg">
              {photo.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
