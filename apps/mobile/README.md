# Meridian Mobile Application (Expo SDK 57)

This directory contains the cross-platform mobile client for the Meridian Geospatial Intelligence Platform.

## Network Host Resolution

When running the mobile client against the local Docker Compose development stack (`http://127.0.0.1:8080`), network addresses differ depending on your execution environment:

| Runtime Environment | Recommended `EXPO_PUBLIC_API_BASE_URL` | Explanation |
| :--- | :--- | :--- |
| **Android Emulator** | `http://10.0.2.2:8080` | Android emulators route `10.0.2.2` to the host machine's loopback interface. |
| **iOS Simulator** | `http://localhost:8080` / `http://127.0.0.1:8080` | iOS simulators share the host machine network stack directly. |
| **Physical Device (Expo Go / Dev Build)** | `http://<YOUR_LAN_IP>:8080` (e.g. `http://192.168.1.15:8080`) | Physical devices cannot reach `localhost`. Ensure port 8080 is accessible on your local network firewall. |

## Port Collision Avoidance Notice

- **Metro Bundler Port:** Port `8081` is reserved by React Native / Metro bundler.
- **Nominatim Geocoding Port:** To eliminate port conflicts during local development, Nominatim is mapped to port `8083` in Meridian's Compose architecture.

## Development Build Requirement

The final Meridian mobile navigation experience integrates `@maplibre/maplibre-react-native` (scheduled in Prompt 14). MapLibre contains custom native C++/Java/Obj-C code that is **incompatible with standard Expo Go**. A custom development build (`expo-dev-client`) is configured.
