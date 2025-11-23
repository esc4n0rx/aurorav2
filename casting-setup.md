# Google Cast Integration Guide

This document explains how the Google Cast integration works in the Aurora PWA and what is needed to ensure it functions correctly.

## Overview

The Google Cast integration allows users to cast video content from the Aurora PWA to Chromecast-enabled devices (Chromecast, Android TV, Google TV).

### Components

1.  **Cast SDK**: The Google Cast Sender Framework (`cast_sender.js`) is loaded in `app/layout.tsx`.
2.  **CastButton**: A component (`components/CastButton.tsx`) that displays the Cast icon when the API is available.
3.  **useCast Hook**: A custom hook (`hooks/useCast.ts`) that manages the Cast Context, session state, and media loading.
4.  **Content Page**: The `app/content/[slug]/page.tsx` integrates the button and handles the logic to select the correct video URL (movie or episode) to cast.

## How it Works

1.  **Initialization**: When the app loads, the `useCast` hook initializes the Cast Context with the Receiver Application ID (default: `CC1AD845` - Default Media Receiver).
2.  **Availability**: The `CastButton` only appears if the Cast API is successfully loaded and available (usually requires Chrome browser or a Cast-enabled environment).
3.  **Casting**:
    - When the user clicks the Cast button, the Cast dialog opens.
    - Upon connecting to a device, the `handleCast` function in the content page is triggered (or when the user clicks again if already connected).
    - The app sends a `loadMedia` request to the receiver with the video URL, title, subtitle, and image.
4.  **Proxy vs Direct**:
    - The implementation prefers the **Direct URL** of the video.
    - However, if the video URL is **HTTP** (not HTTPS), it automatically uses the internal Proxy (`/api/proxy/stream`) to ensure the URL passed to the Chromecast is HTTPS, which is a requirement for Google Cast.

## Requirements & Setup

### 1. HTTPS
**Crucial**: The PWA **MUST** be served over HTTPS. Google Cast Sender API requires a secure context.
- Localhost is treated as secure for testing.
- In production (Vercel, Netlify, etc.), ensure HTTPS is enabled.

### 2. CORS (Cross-Origin Resource Sharing)
The video streams (MP4, HLS/m3u8) **MUST** have CORS headers enabled on the source server.
- The Chromecast device requests the video directly from the source URL.
- If the source server does not send `Access-Control-Allow-Origin: *` (or specific origin), the Chromecast will fail to play the video.
- **If casting fails immediately after loading**, it is almost always a CORS issue on the video server.

### 3. Receiver App ID
Currently, the app uses the **Default Media Receiver** (`CC1AD845`).
- This receiver is generic and works for basic video playback.
- If you need custom branding or advanced DRM support, you will need to register a Custom Receiver application in the [Google Cast SDK Developer Console](https://cast.google.com/publish/) and update the `applicationId` in `hooks/useCast.ts`.

## Troubleshooting

-   **Icon not showing**: Ensure you are using Google Chrome or a Chromium-based browser. Ensure the device is on the same Wi-Fi as the Cast device.
-   **"Cast API not available"**: Check the console for errors loading the `cast_sender.js` script.
-   **Video loads but doesn't play**: Check the Chromecast debug logs (requires enabling developer mode on the device) or check the source video CORS headers.
