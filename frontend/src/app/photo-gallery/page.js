// frontend/src/app/photo-gallery/page.js

import GalleryClient from "./GalleryClient";

export const metadata = {
  title: "CARC Photo Gallery",
  description: "Browse photos from Coastside Amateur Radio Club events and meetings.",
};

export default function CARCPhotoGalleryPage() {
  return <GalleryClient />;
}
