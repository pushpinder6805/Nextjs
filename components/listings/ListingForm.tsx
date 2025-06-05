'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Category, City, Listing, ListingFormData, Tag } from '@/types';
import { getCategories } from '@/lib/api/categories';
import { getCities } from '@/lib/api/cities';
import { createListing, updateListing, uploadFiles } from '@/lib/api/listings';
import { useAuthStore } from '@/lib/store/authStore';

interface ListingFormProps {
  initialData?: Listing;
  isEditing?: boolean;
}

export default function ListingForm({ initialData, isEditing = false }: ListingFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<ListingFormData>({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    description: initialData?.description || '',
    phone: initialData?.phone || '',
    email: initialData?.email || user?.email || '',
    address: initialData?.address || '',
    price: initialData?.price?.toString() || '',
    featured: initialData?.featured || false,
    approvalStatus: initialData?.approvalStatus || 'pending',
    category: initialData?.category?.id || 0,
    city: initialData?.city?.id || 0,
    tags: initialData?.tags?.map(tag => tag.id) || [],
    images: [],
    linkTargetType: initialData?.linkTargetType || 'internal',
    linkTargetValue: initialData?.linkTargetValue || '',
    websiteUrl: initialData?.websiteUrl || '',
    bbsThreadUrl: initialData?.bbsThreadUrl || '',
    advertiserId: user?.id
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>(
    initialData?.images || []
  );
  const [showApprovalInfo, setShowApprovalInfo] = useState(false);
  
  // Title validation regex - only allow alphanumeric, hyphens, underscores, periods, and tildes
  const titleValidationRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.~]*$/;

  // Validate title
  const validateTitle = (title: string): boolean => {
    if (!title) {
      setTitleError('Title is required.');
      return false;
    }
    if (!titleValidationRegex.test(title)) {
      setTitleError('Title must start with a letter or number and can only contain letters, numbers, hyphens, underscores, periods, and tildes.');
      return false;
    }
    setTitleError(null);
    return true;
  };
  
  useEffect(() => {
    // Fetch categories and cities
    const fetchData = async () => {
      try {
        const [categoriesResponse, citiesResponse] = await Promise.all([
          getCategories(),
          getCities()
        ]);
        
        setCategories(categoriesResponse.data);
        setCities(citiesResponse.data);
      } catch (err) {
        setError('Failed to load form data. Please try again.');
        console.error('Error fetching form data:', err);
      }
    };
    
    fetchData();
  }, []);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Validate title field when it changes
      if (name === 'title') {
        validateTitle(value);
      }
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      
      // Create preview URLs for the images
      const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviewUrls]);
      
      // Add to form data
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };
  
  const removeImage = (index: number) => {
    // Remove from preview
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    
    // Remove from form data
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  const removeExistingImage = (id: number) => {
    setExistingImages(prev => prev.filter(img => img.id !== id));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate title before submission
    if (!validateTitle(formData.title)) {
      return; // Stop form submission if title is invalid
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First upload any new images
      let uploadedImageIds: number[] = [];
      
      if (formData.images.length > 0) {
        const uploadedFiles = await uploadFiles(formData.images);
        uploadedImageIds = uploadedFiles.map(file => file.id);
      }
      
      // Get existing image IDs
      const existingImageIds = existingImages.map(img => img.id);
      
      // Combine new and existing image IDs
      const allImageIds = [...existingImageIds, ...uploadedImageIds];
      
      // Create data object for the API
      const listingPayload = {
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        price: formData.price ? parseFloat(formData.price) : undefined,
        featured: formData.featured,
        approvalStatus: isEditing && initialData?.approvalStatus === 'published' ? 'published' : 'pending',
        category: formData.category,
        city: formData.city,
        images: allImageIds,
        linkTargetType: formData.linkTargetType,
        linkTargetValue: formData.linkTargetValue,
        websiteUrl: formData.websiteUrl,
        bbsThreadUrl: formData.bbsThreadUrl,
        advertiserId: user?.id
      };
      
      // Create form data with the payload
      const data = new FormData();
      data.append('data', JSON.stringify(listingPayload));
      
      if (isEditing && initialData) {
        await updateListing(initialData.documentId, data);
        setShowApprovalInfo(listingPayload.approvalStatus === 'pending');
      } else {
        await createListing(data);
        setShowApprovalInfo(true);
      }
      
      if (!showApprovalInfo) {
        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save listing. Please try again.');
      console.error('Error saving listing:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (showApprovalInfo) {
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 max-w-2xl mx-auto">
          <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {isEditing ? 'Your changes require approval' : 'Your listing has been submitted!'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {isEditing 
              ? 'Your listing changes have been saved but require admin approval before they will be publicly visible.'
              : 'Your listing has been created but requires admin approval before it will be publicly visible.'}
          </p>
          
          <p className="text-gray-600 mb-6">
            You can view and edit this listing from your dashboard while waiting for approval.
          </p>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Admin Approval Notice */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Note:</strong> All new listings and major edits require admin approval before they will be publicly visible.
            </p>
          </div>
        </div>
      </div>
      
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          pattern="[a-zA-Z0-9][a-zA-Z0-9-_.~]*"
          title="Must start with a letter or number and can only contain letters, numbers, hyphens, underscores, periods, and tildes"
          className={`mt-1 block w-full px-3 py-2 border ${titleError ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
        />
        {titleError && (
          <p className="mt-1 text-sm text-red-600">{titleError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Must start with a letter or number. Only letters, numbers, hyphens, underscores, periods, and tildes are allowed.
        </p>
      </div>
      
      {/* Subtitle */}
      <div>
        <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">
          Subtitle
        </label>
        <input
          type="text"
          id="subtitle"
          name="subtitle"
          value={formData.subtitle || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          placeholder="Displayed on card under title"
        />
      </div>
      
      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={6}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
      
      {/* Contact Information */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              This will be masked for your privacy
            </p>
          </div>
          
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          {/* Address */}
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>
      
      {/* Price */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            placeholder="0.00"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">USD</span>
          </div>
        </div>
      </div>
      
      {/* Category and City */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City <span className="text-red-500">*</span>
          </label>
          <select
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Select a city</option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
        
        {/* Existing images */}
        {existingImages.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm text-gray-500 mb-2">Current Images</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {existingImages.map(image => (
                <div key={image.id} className="relative">
                  <div className="relative h-24 bg-gray-100 rounded overflow-hidden">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}${image.url}`}
                      alt="Listing image"
                      className="object-cover"
                      fill
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExistingImage(image.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* New image previews */}
        {previewImages.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm text-gray-500 mb-2">New Images</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {previewImages.map((url, index) => (
                <div key={index} className="relative">
                  <div className="relative h-24 bg-gray-100 rounded overflow-hidden">
                    <Image
                      src={url}
                      alt={`New image ${index + 1}`}
                      className="object-cover"
                      fill
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* File input */}
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="images"
                className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none"
              >
                <span>Upload images</span>
                <input
                  id="images"
                  name="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      </div>
      
      {/* Featured Checkbox */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="featured"
            name="featured"
            type="checkbox"
            checked={formData.featured}
            onChange={handleChange}
            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="featured" className="font-medium text-gray-700">
            Featured Listing
          </label>
          <p className="text-gray-500">
            Featured listings appear at the top of search results and on the homepage.
          </p>
        </div>
      </div>
      
      {/* Ad Card Click Link Options */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ad Card Click Options</h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="link-internal"
              name="linkTargetType"
              type="radio"
              value="internal"
              checked={formData.linkTargetType === 'internal'}
              onChange={handleChange}
              className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300"
            />
            <label htmlFor="link-internal" className="ml-3 block text-sm font-medium text-gray-700">
              Open ad detail page (default)
            </label>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="link-external"
                name="linkTargetType"
                type="radio"
                value="external"
                checked={formData.linkTargetType === 'external'}
                onChange={handleChange}
                className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300"
              />
            </div>
            <div className="ml-3 flex-grow">
              <label htmlFor="link-external" className="block text-sm font-medium text-gray-700">
                Link to external website
              </label>
              {formData.linkTargetType === 'external' && (
                <input
                  type="url"
                  name="linkTargetValue"
                  value={formData.linkTargetValue || ''}
                  onChange={handleChange}
                  placeholder="https://"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              )}
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="link-bbs"
                name="linkTargetType"
                type="radio"
                value="bbs"
                checked={formData.linkTargetType === 'bbs'}
                onChange={handleChange}
                className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300"
              />
            </div>
            <div className="ml-3 flex-grow">
              <label htmlFor="link-bbs" className="block text-sm font-medium text-gray-700">
                Link to official BBS post
              </label>
              {formData.linkTargetType === 'bbs' && (
                <input
                  type="url"
                  name="linkTargetValue"
                  value={formData.linkTargetValue || ''}
                  onChange={handleChange}
                  placeholder="https://"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Ad Detail Page Link Options */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ad Detail Page Links</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">
              Advertiser Website URL (optional)
            </label>
            <input
              type="url"
              id="websiteUrl"
              name="websiteUrl"
              value={formData.websiteUrl || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="https://"
            />
          </div>
          
          <div>
            <label htmlFor="bbsThreadUrl" className="block text-sm font-medium text-gray-700">
              BBS Thread URL (optional)
            </label>
            <input
              type="url"
              id="bbsThreadUrl"
              name="bbsThreadUrl"
              value={formData.bbsThreadUrl || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="https://"
            />
          </div>
        </div>
      </div>
      
      {/* Terms & Conditions */}
      <div className="relative flex items-start">
        <div className="flex items-center h-5">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="terms" className="font-medium text-gray-700">
            I agree to the terms and conditions
          </label>
          <p className="text-gray-500">
            By submitting this listing, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : isEditing ? 'Update Listing' : 'Create Listing'}
        </button>
      </div>
    </form>
  );
} 