// frontend/src/app/services/page.js
import React from 'react';

export const metadata = {
    title: 'Our Services - Demo Project',
    description: 'Discover the services demonstrated in this project.',
};

export default function ServicesPage() {
    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Our Services</h2>
            <p className="text-gray-700 mb-4">
                While this is a demonstration, it illustrates how various "services" could be
                presented or offered by a web application.
            </p>
            <ul className="list-disc list-inside text-gray-800 space-y-2">
                <li>
                    <span className="font-semibold">User Authentication:</span> Demonstrating a basic login/logout flow (conceptual for this demo).
                </li>
                <li>
                    <span className="font-semibold">Data Management:</span> Illustrating how data can be fetched from a backend API.
                </li>
                <li>
                    <span className="font-semibold">Dynamic Content Rendering:</span> Showing how Next.js renders dynamic content efficiently.
                </li>
                <li>
                    <span className="font-semibold">Navigation and Routing:</span> Providing seamless navigation between different sections of the application.
                </li>
            </ul>
            <p className="mt-4 text-gray-700">
                Each "service" represents a potential feature or module that can be integrated into a larger web application.
            </p>
        </div>
    );
}
