# LastMile - Ridesharing App

## Overview
A dual-role ridesharing mobile application built with React Native Expo, featuring real-time ride matching, live driver tracking, and comprehensive driver management.

## Architecture

### Navigation
- **Root Navigator**: Handles authentication and role-based routing
- **Rider Stack**: Dashboard → Waiting → Tracking
- **Driver Stack**: Route Setup → Driver Console
- **Auth Stack**: Login and Registration

### State Management
- **Zustand**: Used for authentication and trip state management
  - `useAuthStore`: Manages user session and persistence
  - `useTripStore`: Tracks active trip state

### API Integration
- **Axios**: Configured API client with token-based authentication
- **Base URL**: Configurable via `config.ts` (default: http://localhost:8000)
- **Service Layer**: Centralized API calls in `services/api.ts`

### Key Features Implemented

#### Authentication
- Email/password login and registration
- Role selection (Rider/Driver) during signup
- AsyncStorage persistence with auto-login
- Logout functionality with confirmation

#### Rider Flow
- **Dashboard**: 
  - Interactive map (Google Maps on Android native, placeholder on web)
  - Station dropdown selection
  - Destination text input
  - Vehicle type selection (6 types)
  - Arrival time picker
  - Real-time ride request submission
  
- **Waiting Screen**:
  - Real-time match polling (3s intervals)
  - Toast notifications for match found
  - Push notifications (expo-notifications)
  - Cancelable ride requests
  
- **Tracking Screen**:
  - Live driver location display
  - Map with driver marker (native), map placeholder (web)
  - Driver info display
  - Status updates
  - Trip completion with auto-redirect

#### Driver Flow
- **Route Setup**:
  - Target station selection
  - Stops configuration
  - Passenger capacity (1-8)
  - Vehicle type selection
  - Shift initialization
  
- **Driver Console**:
  - Real-time status management (ONLINE/BUSY/OFFLINE)
  - Passenger manifest with live updates (3s polling)
  - Passenger names and destinations
  - Movement simulation toggle for testing
  - Drop-off per passenger
  - End shift management
  - Floating action button for starting rides

### Design System
- **Theme-based colors** with light/dark mode support
- **Rider theme**: Emerald green (#10B981)
- **Driver theme**: Blue (#3B82F6)
- **Consistent spacing, typography, and shadows**
- **Custom components**: StatusChip, VehicleTypeSelector, StatusChip

### Platform Support
- **Native Maps**: Google Maps API integration for Android via react-native-maps
- **Web Fallback**: Shows map placeholder on web, full functionality in Expo Go
- **Cross-platform**: Graceful degradation for web while maintaining full features on mobile

### Notifications
- **Push Notifications**: expo-notifications for native alerts
- **Toast Messages**: In-app notifications for immediate feedback
- **Real-time Listeners**: Notification response handling

### Components Structure
```
components/
├── StatusChip.tsx          # Status badge component
├── VehicleTypeSelector.tsx # Vehicle type selection UI
├── RiderMap.tsx            # Rider dashboard map (native/web)
├── DriverLocationMap.tsx   # Driver tracking map
├── PlatformMap.tsx         # Fallback map for web
└── [Helper components]     # Text, View, Scroll utilities

screens/
├── auth/
│   ├── LoginScreen.tsx
│   └── RegisterScreen.tsx
├── rider/
│   ├── RiderDashboardScreen.tsx
│   ├── WaitingScreen.tsx
│   └── TrackingScreen.tsx
└── driver/
    ├── RouteSetupScreen.tsx
    └── DriverConsoleScreen.tsx

services/
├── api.ts              # Axios API client
└── notifications.ts    # Notification setup
```

## Package Dependencies

### Core
- react-native, react
- @react-navigation/*
- expo-*

### State & Storage
- zustand (state management)
- @react-native-async-storage/async-storage

### Maps & Location
- react-native-maps (Google Maps integration)
- expo-notifications (push notifications)

### UI Components
- react-native-toast-message
- @react-native-picker/picker
- @react-native-community/datetimepicker
- @expo/vector-icons

### API
- axios

## API Integration Points

### Authentication
- POST /auth/login
- POST /auth/register
- GET /user/{user_id}

### Rides (Rider)
- POST /ride/request
- GET /ride/{trip_id}/status
- POST /ride/{trip_id}/cancel
- GET /driver/{driver_id}/location

### Driver Operations
- POST /driver/route
- POST /driver/location
- POST /driver/status
- GET /driver/{driver_id}/trips
- POST /trip/{trip_id}/complete

### Static Data
- GET /stations

## Recent Changes

### Google Maps & Notifications Implementation
- **Maps Integration**: Added platform-specific map components (`RiderMap.tsx`, `DriverLocationMap.tsx`) that use native Google Maps on Android and show fallback on web
- **Notifications Setup**: Implemented `expo-notifications` service with push notification support and listener setup
- **Notification Triggers**: Match found notifications in waiting screen with both toast and push notification options
- **Android Configuration**: Added react-native-maps plugin to app.json with Google Maps v2 provider

## User Preferences
- Rider theme: Emerald green preferred
- Driver theme: Blue preferred
- Cross-platform support: Full native features in Expo Go, graceful web fallback

## Next Steps
- Configure actual Google Maps API key for Android builds
- Deploy backend API server
- Add rating system for completed trips
- Implement trip history and earnings dashboard
- Add payment integration
