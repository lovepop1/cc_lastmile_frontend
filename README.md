# 📱 LastMile Mobile App

The **official mobile frontend** for the LastMile metro feeder ride-sharing platform.
Built with **React Native (Expo)**, the app supports both **Rider** and **Driver** roles using a unified codebase.

The UI dynamically transforms based on the logged-in user’s role.

---

## 🌟 Features

### **Shared**

* 🔐 **Authentication** — Secure Login/Signup with role selection
* 🔄 **Dual-Role UI** — Automatically switches between Rider and Driver experiences
* 📡 **Real-time Sync** — SSE-based updates for trip status and notifications

---

## 🚶 Rider Mode

* 🏙️ **Station Selector** — Dynamic list of available metro stations
* 🗺️ **Live Tracking** — Real-time map showing the approaching driver
* 🚨 **Instant Status Updates** — Immediate notifications via SSE when a match is found

---

## 🚗 Driver Mode

* 📍 **Shift Management** — Register route & seating capacity
* 👥 **Passenger Manifest** — Live view of assigned passengers
* 🧪 **Simulation Mode** — Debug tool to simulate GPS movement for testing

---

## 🛠️ Tech Stack

| Component            | Technology                              |
| -------------------- | --------------------------------------- |
| **Framework**        | React Native (Expo SDK 50+)             |
| **Language**         | TypeScript                              |
| **Styling**          | NativeWind (Tailwind CSS)               |
| **State Management** | Zustand                                 |
| **Maps**             | react-native-maps (Google Maps Android) |
| **Networking**       | Axios + EventSource (SSE)               |

---

## 🚀 Setup Guide

### **1. Install Dependencies**

```bash
npm install
```

---

### **2. Configuration**

Create a `config.ts` file (if not present):

```ts
export const config = {
  API_URL: "http://IP_ADDRESS:8000",
};
```

---

### **3. Google Maps API Key (Android Only)**

Add your key inside `app.json`:

```json
{
  "android": {
    "config": {
      "googleMaps": {
        "apiKey": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

---

### **4. Run the App**

Start Metro Bundler:

```bash
npx expo start
```

Run on Android (Emulator or Physical Device required):

```bash
npx expo run:android
```
