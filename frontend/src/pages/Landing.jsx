import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-primary rounded-full opacity-10 blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-secondary rounded-full opacity-10 blur-3xl animate-float delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-accent rounded-full opacity-5 blur-3xl animate-float delay-500"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo and Title */}
          <div className="mb-8 animate-scale-in">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow mx-auto">
                <span className="text-4xl font-bold text-white">📚</span>
              </div>
              <div className="absolute -inset-4 bg-gradient-primary rounded-3xl blur opacity-20 animate-pulse"></div>
            </div>
            <h1 className="heading-1 mb-4">
              Welcome to{' '}
              <span className="text-gradient-primary">LibraryHub</span>
            </h1>
            <p className="body-text text-lg max-w-2xl mx-auto mb-8">
              Discover, borrow, and track your favorite books in a beautiful, modern library experience. 
              Join thousands of readers and start your digital reading journey today!
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up delay-300">
            <Link 
              to="/register" 
              className="btn-primary text-lg px-8 py-4"
            >
              🚀 Get Started Free
            </Link>
            <Link 
              to="/login" 
              className="btn-outline text-lg px-8 py-4"
            >
              🔐 Already have an account?
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-slide-up delay-500">
            <div className="card p-6 text-center group hover-scale">
              <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center shadow-glow mb-4 mx-auto group-hover:shadow-glow-accent transition-all duration-300">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="heading-3 mb-2">Advanced Search</h3>
              <p className="body-text">
                Find books by title, author, or genre with lightning-fast search and intelligent filters.
              </p>
            </div>

            <div className="card p-6 text-center group hover-scale">
              <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center shadow-glow mb-4 mx-auto group-hover:shadow-glow-accent transition-all duration-300">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="heading-3 mb-2">Reading Analytics</h3>
              <p className="body-text">
                Track your reading progress, history, and get personalized insights to improve your reading habits.
              </p>
            </div>

            <div className="card p-6 text-center group hover-scale">
              <div className="w-16 h-16 bg-gradient-success rounded-2xl flex items-center justify-center shadow-glow mb-4 mx-auto group-hover:shadow-glow-accent transition-all duration-300">
                <span className="text-2xl">🌙</span>
              </div>
              <h3 className="heading-3 mb-2">Beautiful Design</h3>
              <p className="body-text">
                Enjoy a stunning, accessible interface with dark mode support and smooth animations.
              </p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto animate-slide-up delay-700">
            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow flex-shrink-0">
                  <span className="text-xl">📚</span>
                </div>
                <div>
                  <h3 className="heading-3 mb-2">Extensive Library</h3>
                  <p className="body-text">
                    Access thousands of books from our curated collection, including both local and Google Books integration.
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-glow flex-shrink-0">
                  <span className="text-xl">⭐</span>
                </div>
                <div>
                  <h3 className="heading-3 mb-2">Rate & Review</h3>
                  <p className="body-text">
                    Share your thoughts with star ratings and help other readers discover great books.
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center shadow-glow flex-shrink-0">
                  <span className="text-xl">📱</span>
                </div>
                <div>
                  <h3 className="heading-3 mb-2">Responsive Design</h3>
                  <p className="body-text">
                    Perfect experience on all devices - desktop, tablet, and mobile with adaptive layouts.
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center shadow-glow flex-shrink-0">
                  <span className="text-xl">🔒</span>
                </div>
                <div>
                  <h3 className="heading-3 mb-2">Secure & Private</h3>
                  <p className="body-text">
                    Your reading data is protected with industry-standard security and privacy measures.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="mt-16 text-center animate-slide-up delay-1000">
            <div className="card p-8 max-w-2xl mx-auto">
              <h2 className="heading-2 mb-4">Ready to Start Reading?</h2>
              <p className="body-text mb-6">
                Join LibraryHub today and transform your reading experience with our modern, feature-rich platform.
              </p>
              <Link 
                to="/register" 
                className="btn-primary text-lg px-8 py-4"
              >
                🚀 Create Your Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 