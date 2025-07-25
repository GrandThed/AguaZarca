# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm start`
- **Build for production**: `npm run build`
- **Run tests**: `npm test`
- **Deploy to GitHub Pages**: `npm run deploy`

## Tech Stack

- **Framework**: React 17.0.1 with Create React App
- **Routing**: React Router DOM v5 (HashRouter)
- **Backend**: Firebase (Firestore, Storage, Auth)
- **UI Libraries**: React Icons, React Slick, React Toastify, React Dropzone
- **Maps**: Mapbox GL
- **External APIs**: MercadoLibre integration for property listings
- **Image Processing**: browser-image-compression for optimization
- **HTTP Client**: Axios

## Architecture Overview

This is a real estate website (AguaZarca) built with React that allows users to browse, publish, and manage property listings.

### Core Structure

- **routes.js**: Centralized route constants with configurable prefix
- **firebase.js**: Firebase configuration and service exports
- **src/components/routes/**: Page-level components organized by functionality

### Key Features

1. **Property Management**: Browse properties by type (sale, annual rental, temporary rental)
2. **MercadoLibre Integration**: Import property data from MercadoLibre listings
3. **User Authentication**: Firebase Auth with admin functionality
4. **Content Management**: Blog creation and management system
5. **Image Upload**: Firebase Storage with compression
6. **Search**: Global search functionality across property listings

### State Management

- Uses React's useReducer pattern for complex form state (see `src/components/routes/publicar/reducer.js`)
- Firebase Context for authentication state
- Local component state for simple interactions

### Data Models

**Property Structure** (defined in `src/components/routes/publicar/const_funct.js`):
- Basic info: title, description, type, commercial status, price
- Characteristics: bedrooms, bathrooms, covered area, etc.
- Attributes: amenities and features (boolean flags)
- Location: address, neighborhood, city, state, country
- Media: images, video_id
- Status flags: featured, rentalFeatured, slider

**Property Types**: 16 predefined types including apartments, houses, commercial spaces, etc.

### Key Components

- **Property Publishing**: Complex form with reducer pattern in `/publicar`
- **Property Display**: Card-based listing system
- **Authentication**: Login/register forms with Firebase Auth
- **Dashboard**: Admin interface for property management
- **Image Handling**: Drag-and-drop upload with compression

### Environment Variables Required

Firebase configuration requires these environment variables:
- `REACT_APP_API_KEY`
- `REACT_APP_AUTH_DOMAIN`
- `REACT_APP_DATABASE_URL`
- `REACT_APP_PROJECT_ID`
- `REACT_APP_STORAGE_BUCKET`
- `REACT_APP_MESSAGING_SENDER_ID`
- `REACT_APP_APPID`
- `REACT_APP_MEASUREMENTID`
- `REACT_APP_SUPERSECRETEREGISTERROUTE` (for registration page)

### External API Integration

- **MercadoLibre API**: Property import functionality
- **Custom Backend**: PHP API endpoints at aguazarca.com.ar/api/

### Development Notes

- Uses HashRouter for GitHub Pages compatibility
- Image optimization is handled client-side before Firebase upload
- Admin authentication is currently bypassed (returns true in `utils/auth.js`)
- Property data structure supports both manual entry and MercadoLibre import
- Responsive design with CSS modules for component-specific styling