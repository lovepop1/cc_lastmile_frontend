# LastMile Ridesharing App - Design Guidelines

## Architecture Decisions

### Authentication
**Required** - The app explicitly requires user accounts with role-based access (Rider/Driver).

**Implementation:**
- Email/password authentication (as specified in API endpoints)
- AsyncStorage for token persistence
- Role-based routing after login (Rider → emerald theme, Driver → blue theme)
- Login screen includes:
  - Email and password fields
  - "Login" and "Register" actions
  - Clear role selector (toggle or tabs for Rider vs Driver during registration)
- Registration screen captures: name, email, password, phone, role
- No logout flow specified - include Settings screen with logout (clear token, return to login)

### Navigation Structure
**Stack-Only Navigation** - This app uses role-specific stacks with no tab navigation.

**Rider Stack (Emerald Green):**
1. Dashboard (Home) - Request ride interface
2. Waiting - Match pending screen
3. Tracking - Live driver tracking

**Driver Stack (Blue):**
1. Route Setup - Configure shift
2. Console - Active passenger manifest and controls

**Authentication Stack:**
- Login
- Register

**Navigation Behavior:**
- Linear flows with explicit navigation triggers (request ride → waiting → tracking)
- No back navigation during active trips (prevent accidental exits)
- Modal confirmations for critical actions (cancel ride, end shift)

---

## Screen Specifications

### **Authentication Screens**

#### Login Screen
- **Header:** None (full-screen)
- **Layout:**
  - Top 40% of screen: App logo/branding with gradient background
  - Bottom 60%: White card with form
    - Email input field
    - Password input field (with visibility toggle)
    - "Login" button (primary, full-width)
    - "Don't have an account? Register" link
- **Safe Area Insets:** Top: insets.top + Spacing.xl, Bottom: insets.bottom + Spacing.xl
- **Components:** TextInput (email, password), Button, TouchableOpacity (link)

#### Register Screen
- **Header:** Default navigation header with back button
- **Layout:** Scrollable form
  - Role selector (Rider/Driver) - Segmented control or toggle pills at top
  - Name field
  - Email field
  - Phone field
  - Password field (with visibility toggle)
  - Confirm password field
  - "Create Account" button (below form)
- **Safe Area Insets:** Top: Spacing.xl, Bottom: insets.bottom + Spacing.xl
- **Form Submit:** Button positioned below form fields

---

### **Rider Screens (Emerald Green Theme)**

#### Dashboard (Request Ride)
- **Header:** Transparent with title "Request Ride" and Settings button (right)
- **Layout:**
  - Full-screen map (react-native-maps) as background
  - Bottom sheet overlay (60% height) containing form:
    - Pickup Station dropdown (fetched from /stations)
    - Drop Destination text input
    - Vehicle Type horizontal scroll chips (icons + labels for Hatchback, Sedan, SUV, Luxury, Van, Auto)
    - Arrival Time picker
    - "Request Ride" button (emerald green, prominent)
- **Safe Area Insets:**
  - Map: none (full bleed)
  - Bottom sheet: Bottom: insets.bottom + Spacing.xl
- **Components:** MapView, BottomSheet, Dropdown, TextInput, HorizontalScrollView with chips, DateTimePicker, Button
- **Interaction:** Form slides up from bottom with drag handle for adjustment

#### Waiting Screen
- **Header:** Default with "Cancel Request" button (red, right side)
- **Layout:**
  - Center: Animated loading indicator (pulsing circle)
  - Text: "Searching for nearby drivers..."
  - Subtext: "This may take a moment"
  - Cancel button (outlined red, bottom)
- **Safe Area Insets:** Top: Spacing.xl, Bottom: insets.bottom + Spacing.xl
- **Components:** ActivityIndicator, Text, Button (destructive variant)
- **Interaction:** 
  - Real-time updates via SSE or 3s polling
  - Toast notification on match found
  - Confirmation modal before cancel

#### Live Tracking
- **Header:** Transparent with "Ride Details" title and driver info chip (top right showing driver name)
- **Layout:**
  - Full-screen map showing:
    - Driver marker (car icon with bearing)
    - User marker (person icon)
    - Route polyline (if available)
  - Bottom card (30% height, slide-up drawer):
    - Driver name and rating
    - Vehicle type and number
    - Trip status chip ("Matched" → "Driver En Route" → "In Progress")
    - Estimated arrival time
    - Call driver button (phone icon)
- **Safe Area Insets:**
  - Map: none
  - Bottom card: Bottom: insets.bottom + Spacing.xl
- **Components:** MapView with Markers, BottomSheet, Avatar, Text, StatusChip, Button
- **Interaction:**
  - Map auto-centers on driver location every 3s update
  - Status transitions trigger subtle animations
  - "Ride Finished" modal on completion

---

### **Driver Screens (Blue Theme)**

#### Route Setup
- **Header:** Default with "LastMile Driver" title
- **Layout:** Scrollable form (centered card on larger screens)
  - Target Station dropdown
  - Stops text input (comma-separated or multi-line)
  - Passenger Capacity number input (1-8)
  - Vehicle Type dropdown (1-6 with labels)
  - "Start Shift" button (blue, full-width)
- **Safe Area Insets:** Top: Spacing.xl, Bottom: insets.bottom + Spacing.xl
- **Form Submit:** Button below form
- **Components:** Dropdown, TextInput, NumberInput, Button

#### Driver Console
- **Header:** Custom header with:
  - Left: Status chip (ONLINE/BUSY/OFFLINE)
  - Right: "End Shift" button (visible only when no passengers)
- **Layout:**
  - Top section (collapsible):
    - "Simulate Movement" toggle switch
    - Current location display (lat/lon)
  - Middle section: Passenger Manifest (ScrollView)
    - Cards for each active passenger:
      - Passenger name and avatar
      - Destination text
      - Status chip (MATCHED → IN_PROGRESS)
      - "Drop Off" button (visible during trip)
  - Bottom: "Start Ride" floating button (appears when ONLINE + passengers exist)
- **Safe Area Insets:** 
  - Header: Top: insets.top
  - ScrollView: Top: headerHeight + Spacing.xl, Bottom: insets.bottom + Spacing.xl + 60 (for floating button)
- **Floating Button:** 
  - Position: Bottom center, 16px from bottom (above safe area)
  - Shadow: shadowOffset {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2
- **Components:** Switch, Text, ScrollView, Card, Avatar, StatusChip, Button (floating action button)
- **Interaction:**
  - Manifest updates every 3s via polling
  - Status changes trigger UI transitions (ONLINE → BUSY changes header color)
  - Drop off shows confirmation modal

---

## Design System

### Color Palette

**Rider Theme (Emerald):**
- Primary: #10B981 (Emerald 500)
- Primary Dark: #059669 (Emerald 600)
- Surface: #F0FDF4 (Emerald 50)
- Border: #A7F3D0 (Emerald 200)

**Driver Theme (Blue):**
- Primary: #3B82F6 (Blue 500)
- Primary Dark: #2563EB (Blue 600)
- Surface: #EFF6FF (Blue 50)
- Border: #93C5FD (Blue 200)

**Shared:**
- Background: #FFFFFF
- Text Primary: #1F2937 (Gray 800)
- Text Secondary: #6B7280 (Gray 500)
- Error: #EF4444 (Red 500)
- Success: #10B981
- Warning: #F59E0B (Amber 500)
- Disabled: #D1D5DB (Gray 300)

### Typography
- Headings: System font, bold, 20-28px
- Body: System font, regular, 14-16px
- Small: System font, regular, 12px
- Button: System font, semibold, 16px

### Visual Design
- **Icons:** Use @expo/vector-icons (Feather) for all UI elements:
  - Navigation: arrow-left, settings, user
  - Vehicle types: Use simplified car, truck, van icons
  - Actions: phone, x, check, map-pin
- **Buttons:**
  - Primary: Solid fill with theme color, white text, 12px border radius
  - Secondary: Outlined with theme color, colored text
  - Destructive: Red background or red outlined
  - Floating: Large circular button (56x56) with shadow
  - All buttons have pressed state with 0.7 opacity
- **Cards:**
  - Background: white
  - Border radius: 12px
  - Border: 1px solid theme border color
  - Padding: 16px
  - Shadow: subtle (shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 2)
- **Bottom Sheets:**
  - Background: white
  - Top border radius: 24px
  - Drag handle: Gray pill (40x4) centered at top
  - Drop shadow: moderate (shadowOffset: {width: 0, height: -2}, shadowOpacity: 0.10, shadowRadius: 8)
- **Status Chips:**
  - Small pill-shaped labels (height: 24px)
  - Text: 12px, semibold
  - ONLINE: Green background (#10B981 at 20% opacity), green text
  - BUSY: Amber background, amber text
  - MATCHED: Blue background, blue text
  - IN_PROGRESS: Purple background, purple text
  - COMPLETED: Gray background, gray text

### Critical Assets
1. **App Logo:** Required for login/splash screens (emerald/blue gradient icon)
2. **Vehicle Type Icons:** 6 unique icons for Hatchback, Sedan, SUV, Luxury, Van, Auto (simple line art style)
3. **Map Markers:**
   - Driver car icon (directional, blue or emerald based on role)
   - User location pin (person silhouette)
4. **Empty States:**
   - No passengers illustration for driver console
   - No nearby drivers illustration for waiting screen

### Accessibility
- Minimum touch target: 44x44px
- Color contrast ratio: 4.5:1 for text, 3:1 for UI elements
- Form fields have clear labels and error states
- Loading states announce to screen readers
- Critical actions (cancel ride, complete trip) require confirmation
- Support dynamic type scaling (respect system font size settings)