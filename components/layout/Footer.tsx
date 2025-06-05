import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-xl font-bold text-purple-400">Lust66</h2>
            <p className="mt-2 text-sm text-gray-300">
              Your trusted platform for classified listings.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 grid grid-cols-2 gap-2">
              <li>
                <Link href="/" className="text-base text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/listings" className="text-base text-gray-300 hover:text-white">
                  Listings
                </Link>
              </li>
              <li>
                <a 
                  href="https://bbs.lust66.com" 
                  className="text-base text-gray-300 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Forum
                </a>
              </li>
              <li>
                <Link href="/contact" className="text-base text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/privacy" className="text-base text-gray-300 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-base text-gray-300 hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} Lust66. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 