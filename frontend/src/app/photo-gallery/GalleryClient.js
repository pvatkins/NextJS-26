// frontend/src/app/photo-gallery/GalleryClient.js
"use client";

import { useState } from "react";
import PhotoAlbum from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import galleryEvents from "../../data/galleryEvents";

export default function GalleryClient() {
  // Default to first event
  const [selectedEvent, setSelectedEvent] = useState(galleryEvents[0]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  // Prepare slides for Lightbox from selected event
  const slides = selectedEvent.photos.map((photo) => ({
    src: `/images/gallery/${selectedEvent.folder}/${photo.filename}`,
    width: photo.width,
    height: photo.height,
    alt: photo.alt,
    title: `${selectedEvent.name} (${selectedEvent.date})`,
    description: photo.caption || photo.alt,
  }));

  return (
    <div className="flex">
      {/* Sidebar with event list */}
      <aside className="w-64 bg-gray-100 p-4 space-y-2 border-r border-gray-300">
        <h2 className="text-lg font-bold mb-3">Photo Collections</h2>
        {galleryEvents.map((event) => (
          <button
            key={event.id}
            onClick={() => {
              setSelectedEvent(event);
              setLightboxIndex(-1); // close lightbox when switching
            }}
            className={`block w-full text-left p-2 rounded transition ${
              selectedEvent.id === event.id
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-200"
            }`}
          >
            {event.name} ({event.date})
          </button>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-extrabold text-blue-800 mb-6">
          {selectedEvent.name} ({selectedEvent.date})
        </h1>

        <p className="text-gray-700 mb-6">
          Click any photo to view in fullscreen.
        </p>

        <PhotoAlbum
          layout="rows"
          photos={slides}
          targetRowHeight={200}
          onClick={({ index }) => setLightboxIndex(index)}
        />

        <Lightbox
          open={lightboxIndex >= 0}
          close={() => setLightboxIndex(-1)}
          slides={slides}
          index={lightboxIndex}
          on={{ view: ({ index }) => setLightboxIndex(index) }}
render={{
  description: ({ slide }) => (
    <div className="text-center mt-4">
      <div className="font-semibold text-lg text-gray-900">
        {slide.title}
      </div>
      <div className="text-sm text-gray-600 italic mt-1">
        {slide.description}
      </div>
    </div>
  ),
  controls: () => (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center text-white text-sm">
      {lightboxIndex + 1} / {slides.length}
    </div>
  ),
}}
        />
      </main>
    </div>
  );
}