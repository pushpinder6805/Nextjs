# Homepage Implementation

This document outlines the implementation of the new homepage listing logic for Lust66.

## 🏠 Homepage Structure

### 1. Latest Listings Section
- **Location**: Top section after hero banner
- **Logic**: Displays 10 most recent ads site-wide
- **Ordering**: Newest on left, oldest on right
- **Responsive**: 1-5 columns depending on screen size
- **Fallback**: Shows "No listings yet" if empty

### 2. Category Sections  
- **Location**: Below Latest Listings section
- **Logic**: Each category gets its own section with up to 6 ads per row
- **Ordering**: Oldest on left, newest on right within each category
- **Layout**: Up to 6 columns (responsive)
- **Multiple Rows**: If more than 6 ads, they wrap to new rows below
- **Filtering**: Excludes "test" category from display

### 3. Cities Section
- **Location**: Bottom of homepage
- **Logic**: Shows all available cities as clickable tiles
- **Purpose**: Navigation to city-specific pages

## 🔧 Admin Control Features

### Manual Positioning (Strapi Admin)
The implementation supports manual ordering through position fields:

- **homepagePosition**: Controls order in "Latest Listings" section
- **categoryPosition**: Controls order within category sections

### Position Logic
1. If position fields are set, they take priority
2. Falls back to date-based sorting if no positions
3. Admins can reorder via Strapi admin panel

## 📁 File Structure

### Core Files Modified
```
app/page.tsx                    # Main homepage implementation
lib/api/listings.ts            # API functions with position support
types/index.ts                 # TypeScript interfaces
scripts/seed-categories.js     # Sample category creation
```

### Key Components
- `LatestListingsSection`: Handles the top 10 listings
- `CategorySection`: Handles category-specific listing display

## 🚀 Setup Instructions

### 1. Categories Setup
Run the seed script to create sample categories:
```bash
npm run seed-categories
```

This creates:
- SPA
- Massage  
- Beauty Services
- Wellness
- Fitness

### 2. Strapi Configuration
In your Strapi admin panel:

1. **Add Position Fields** (if not already added):
   - Add `homepagePosition` (Number) to Listings content type
   - Add `categoryPosition` (Number) to Listings content type

2. **API Permissions**:
   - Ensure public read access to listings, categories, cities
   - For seeding script: temporarily allow public write to categories

### 3. Content Management
Admins can control homepage order via Strapi:
- Set `homepagePosition` to manually order listings in "Latest Listings" 
- Set `categoryPosition` to manually order within category sections
- Leave positions empty for automatic date-based sorting

## 💡 Features Implemented

✅ **Latest Listings**: 10 most recent, newest on left  
✅ **Category Sections**: Grouped by category, oldest to newest  
✅ **Manual Positioning**: Admin control via position fields  
✅ **Responsive Design**: Works on all screen sizes  
✅ **Published Filter**: Only shows published listings  
✅ **Image Handling**: Displays listing images with fallback  
✅ **Featured Badges**: Highlights featured listings  
✅ **Price Display**: Shows pricing when available  

## 🎯 Admin Workflow

1. **Creating Categories**: Use Strapi admin or seed script
2. **Managing Order**: 
   - Set position numbers in Strapi admin
   - Lower numbers appear first
   - Leave empty for chronological order
3. **Content Control**: All done through Strapi admin panel

## 📱 Responsive Layout

- **Mobile**: 1-2 columns
- **Tablet**: 3-4 columns  
- **Desktop**: 4-6 columns
- **Large**: Up to 6 columns maximum

The layout automatically adapts while maintaining the ordering logic. 