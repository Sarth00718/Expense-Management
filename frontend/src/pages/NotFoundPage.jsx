import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-secondary animate-pulse">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Page Not Found
          </h2>
          <p className="text-text-secondary text-lg">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard"
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-accent to-accent-secondary text-white rounded-lg font-semibold hover:shadow-glow transition-all duration-300"
          >
            <Home size={20} />
            <span>Go to Dashboard</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-secondary border-2 border-accent/30 text-accent rounded-lg font-semibold hover:bg-accent/10 transition-all duration-300"
          >
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center space-x-4">
          <div className="w-3 h-3 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 rounded-full bg-accent-secondary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 rounded-full bg-success animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
