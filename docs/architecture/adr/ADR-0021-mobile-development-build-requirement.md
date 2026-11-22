# ADR-0021: Mobile Development Build Requirement (Expo Dev Client for MapLibre RN)

## Context
Developers frequently expect React Native applications built with Expo to run directly inside the standard **Expo Go** mobile client. However, as verified in Prompt 00 (`docs/recon/compatibility-matrix.md`), `@maplibre/maplibre-react-native` v11.5.1 compiles custom native C++ rendering code, Metal/OpenGL/Vulkan shaders, and platform-specific view managers that are not bundled into the pre-compiled Expo Go binary.

## Decision
1. **Expo Go is Strictly Unsupported:**
   - The Meridian mobile application (`apps/mobile`) **will not work and must not be run inside Expo Go**.
   - Attempting to load MapLibre React Native in Expo Go results in an immediate native module missing exception.
2. **Mandatory Expo Development Builds:**
   - All mobile development, automated testing, and execution requires an **Expo Development Build** (`expo-dev-client`).
   - The native binary is compiled locally via continuous native generation (CNG) (`npx expo run:android` / `npx expo run:ios`) or via EAS Cloud Build (`eas build --profile development`).
   - The native configuration is managed exclusively through the `@maplibre/maplibre-react-native` Expo config plugin in `app.json`.
3. **New Architecture Enabled:**
   - MapLibre RN v11+ requires React Native's New Architecture (Fabric renderer and TurboModules), which is enabled in `app.json`.

## Alternatives considered
- **Using `react-native-maps` with Google Maps / Apple Maps in Expo Go:** Rejected because the platform requirements dictate sovereign, self-hosted vector map rendering using Meridian's self-generated PMTiles. `react-native-maps` cannot render custom offline PMTiles vector tile pipelines.
- **Pure Webview-based MapLibre inside Expo Go:** Rejected due to severe touch-gesture latency, 60fps rendering frame drops, and poor battery performance compared to native MapLibre GL.

## Consequences
- **Positive:** Uncompromised 60fps native vector map rendering, offline tile caching, full shader customizability, identical rendering engine to web.
- **Negative:** Mobile developers cannot simply scan a QR code with the stock Expo Go app; they must build and install an Android APK or iOS development build once.

## Evidence/links
- `docs/recon/compatibility-matrix.md` (`@maplibre/maplibre-react-native` peer dependencies)
- MapLibre React Native Documentation: Expo Integration Guide

## Status
Approved
