"use client";

import { useState } from "react";
import ContactModal from "./ContactModal";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="#" className="flex items-center">
              <span className="text-2xl font-bold">
                <span className="text-gray-900">Water</span>
                <span className="text-primary-500">Go</span>
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-primary-500 transition-colors">
                Xususiyatlar
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary-500 transition-colors">
                Qanday ishlaydi
              </a>
              <a href="#download" className="text-gray-600 hover:text-primary-500 transition-colors">
                Yuklab olish
              </a>
              <button
                onClick={() => setIsContactOpen(true)}
                className="text-gray-600 hover:text-primary-500 transition-colors"
              >
                Aloqa
              </button>
            </nav>

            {/* CTA Button */}
            <button
              onClick={() => setIsContactOpen(true)}
              className="hidden md:inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-full font-medium hover:bg-primary-600 transition-colors"
            >
              Bog&apos;lanish
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col gap-4">
                <a href="#features" className="text-gray-600 hover:text-primary-500" onClick={() => setIsMenuOpen(false)}>
                  Xususiyatlar
                </a>
                <a href="#how-it-works" className="text-gray-600 hover:text-primary-500" onClick={() => setIsMenuOpen(false)}>
                  Qanday ishlaydi
                </a>
                <a href="#download" className="text-gray-600 hover:text-primary-500" onClick={() => setIsMenuOpen(false)}>
                  Yuklab olish
                </a>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsContactOpen(true);
                  }}
                  className="text-left text-gray-600 hover:text-primary-500"
                >
                  Aloqa
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsContactOpen(true);
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 bg-primary-500 text-white rounded-full font-medium"
                >
                  Bog&apos;lanish
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Contact Modal */}
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  );
}
