'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { City } from '@/types';
import { getCities } from '@/lib/api/cities';

export default function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Fetch cities for dropdown
    async function fetchCities() {
      try {
        const response = await getCities();
        setCities(response.data || []);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    }
    
    fetchCities();
    
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const slug = searchQuery.trim().toLowerCase().replace(/\s+/g, '-');
      router.push(`/listings?slug=${slug}`);
    }
  };
  
  const handleCitySelect = (citySlug: string) => {
    router.push(`/${citySlug}`);
    setShowCityDropdown(false);
  };
  
  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };
  
  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Listings', href: '/listings' },
    { name: 'Cities', href: '#', dropdown: true, onClick: () => setShowCityDropdown(!showCityDropdown) },
    { name: 'BBS', href: 'https://bbs.lust66.com', external: true },
  ];
  
  const authItems = isAuthenticated
    ? [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'My Listings', href: '/dashboard' },
        { name: 'Create Listing', href: '/dashboard/create' },
        { name: 'Logout', onClick: handleLogout }
      ]
    : [
        { name: 'Login', href: '/auth/login' },
        { name: 'Register', href: '/auth/register' }
      ];
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" onClick={(e) => handleNavigation('/', e)} className="text-2xl font-bold text-purple-600">
                Lust66
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-6">
              {navItems.map((item) => (
                item.external ? (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    {item.name}
                  </a>
                ) : item.dropdown ? (
                  <div key={item.name} className="relative" ref={cityDropdownRef}>
                    <button
                      onClick={item.onClick}
                      onMouseEnter={() => setShowCityDropdown(true)}
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                      aria-expanded={showCityDropdown}
                    >
                      {item.name}
                      <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {showCityDropdown && (
                      <div 
                        className="absolute z-10 mt-2 w-56 bg-white rounded-md shadow-lg"
                        onMouseEnter={() => setShowCityDropdown(true)}
                        onMouseLeave={() => setShowCityDropdown(false)}
                      >
                        <div className="py-1 max-h-80 overflow-y-auto">
                          {cities.length > 0 ? cities.map((city) => (
                            <button
                              key={city.id}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={(e) => {
                                e.preventDefault();
                                handleCitySelect(city.slug);
                              }}
                            >
                              {city.name}
                            </button>
                          )) : (
                            <div className="px-4 py-2 text-sm text-gray-500">Loading cities...</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavigation(item.href, e)}
                    className={`${
                      pathname === item.href || (item.href === '/listings' && pathname.startsWith('/listings'))
                        ? 'border-purple-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 flex items-center justify-center px-2 lg:px-6">
            <form onSubmit={handleSearch} className="w-full max-w-lg">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 rounded-full py-2 pl-4 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white"
                  placeholder="Search listings..."
                />
                <button 
                  type="submit"
                  className="absolute right-0 top-0 h-full px-3 flex items-center text-gray-400 hover:text-purple-500"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex space-x-4">
              {authItems.map((item) => (
                item.onClick ? (
                  <button
                    key={item.name}
                    onClick={item.onClick}
                    className="bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-500"
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavigation(item.href, e)}
                    className={`px-3 py-2 text-sm font-medium ${
                      pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                        ? 'text-purple-600'
                        : 'text-gray-700 hover:text-purple-500'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              ))}
              
              {isAuthenticated && (
                <Link 
                  href="/dashboard/create"
                  onClick={(e) => handleNavigation('/dashboard/create', e)}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  + Create Ad
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {/* Mobile Search */}
            <div className="px-4 pb-2">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-100 rounded-full py-2 pl-4 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white"
                    placeholder="Search listings..."
                  />
                  <button 
                    type="submit"
                    className="absolute right-0 top-0 h-full px-3 flex items-center text-gray-400 hover:text-purple-500"
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
            
            {navItems.map((item) => (
              item.external ? (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ) : item.dropdown ? (
                <div key={item.name}>
                  <button
                    onClick={() => setShowCityDropdown(!showCityDropdown)}
                    className="flex items-center justify-between w-full pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 text-base font-medium"
                  >
                    {item.name}
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {showCityDropdown && (
                    <div className="pl-6 pr-3 py-1 max-h-60 overflow-y-auto">
                      {cities.length > 0 ? cities.map((city) => (
                        <button
                          key={city.id}
                          className="block w-full text-left py-2 text-sm text-gray-700 hover:text-purple-600"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCitySelect(city.slug);
                            setMobileMenuOpen(false);
                          }}
                        >
                          {city.name}
                        </button>
                      )) : (
                        <div className="py-2 text-sm text-gray-500">Loading cities...</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(item.href, e);
                    setMobileMenuOpen(false);
                  }}
                  className={`${
                    pathname === item.href || (item.href === '/listings' && pathname.startsWith('/listings'))
                      ? 'bg-purple-50 border-purple-500 text-purple-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated && (
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 font-medium">{user?.username?.charAt(0) || 'U'}</span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user?.username}</div>
                  <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                </div>
              </div>
            )}
            <div className="mt-3 space-y-1">
              {authItems.map((item) => (
                item.onClick ? (
                  <button
                    key={item.name}
                    onClick={() => {
                      item.onClick();
                      setMobileMenuOpen(false);
                    }}
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 w-full text-left"
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(item.href, e);
                      setMobileMenuOpen(false);
                    }}
                    className={`block px-4 py-2 text-base font-medium ${
                      pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                        ? 'text-purple-600 bg-gray-50'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              ))}
              
              {isAuthenticated && (
                <Link
                  href="/dashboard/create"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation('/dashboard/create', e);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-white bg-purple-600 hover:bg-purple-700"
                >
                  + Create Ad
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 