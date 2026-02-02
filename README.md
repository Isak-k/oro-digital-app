# ORO DIGITAL Management System

A comprehensive management system for ORO DIGITAL, a computer training institution.
This project is a Progressive Web App (PWA) built with React, TypeScript, and Firebase.

## Technologies

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn-ui
- **Backend/Database**: Firebase (Authentication, Firestore)
- **PWA**: vite-plugin-pwa, Workbox
- **State Management**: React Query, Context API

## Features

- **Public Landing Page**: Dynamic course listing, responsive design.
- **Online Registration**: Students can register for courses directly from the website.
- **Admin Dashboard**:
  - Student Management
  - Course Management
  - Registration Tracking
  - Payment Processing
  - Announcements & Notifications
- **PWA Capabilities**:
  - Installable on mobile and desktop.
  - Offline support (Firebase persistence enabled).
  - App-like experience with splash screen and icons.
- **Multi-language Support**: English, Afaan Oromoo, Amharic.

## Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the development server**:
    ```bash
    npm run dev
    ```
4.  **Build for production**:
    ```bash
    npm run build
    ```

## PWA Features
This app is configured as a PWA. It includes:
- `manifest.webmanifest` generated at build time.
- Service Worker for offline caching.
- Install prompt support.

## Project Structure
- `/src/pages`: Main pages (Index, Login, Dashboard).
- `/src/components`: Reusable UI components.
- `/src/hooks`: Custom React hooks for Firebase data.
- `/src/contexts`: Global state (Auth, Language).
- `/public`: Static assets (icons, manifest).
