// frontend/src/app/about/page.js
import React from 'react';

export const metadata = {
    title: 'About Us - Demo Project',
    description: 'Learn more about our demonstration project.',
};

export default function AboutPage() {
    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">About Our Project</h2>
            <p className="text-gray-700 mb-4">
                This project serves as a comprehensive demonstration of a full-stack web application.
                It showcases the integration of a modern React framework (Next.js) for the user interface
                and a powerful JavaScript runtime (Node.js with Express.js) for backend functionalities.
            </p>

            <p className="text-gray-700 mb-4">
                Our goal is to provide a clear and concise example of how these technologies can work
                together to create a scalable and maintainable web presence.
            </p>
            
            <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
            <p className="text-gray-700">
                To simplify complex web development concepts through practical, hands-on examples.
            </p>
        </div>
    );
}
