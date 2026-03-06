# BRIX Web — Project Overview

## Mission

BRIX is a photo platform for immutable, GPS/temporally-verified image publishing — **"Build Your Truth"**.

## Core Features

- Camera capture with verification (GPS + temporal)
- 3D GLB model uploads
- Real-time challenge-based photo sessions
- Social interactions (votes, comments, follows)
- 1-on-1 messaging with file/image/voice attachments
- Map-based discovery feed

## Tech Stack

| Purpose       | Package                                              |
| ------------- | ---------------------------------------------------- |
| Framework     | Next.js 15, React 19                                 |
| Auth          | next-auth v5 beta, Firebase                          |
| Data fetching | @tanstack/react-query v5, axios                      |
| Global state  | zustand v5                                           |
| Forms         | react-hook-form + zod v4                             |
| UI components | shadcn/ui (new-york), lucide-react                   |
| Notifications | react-toastify (`useToast`), sweetalert2 (`useSwal`) |
| Styling       | Tailwind CSS v4, tw-animate-css                      |
| 3D graphics   | three.js, @react-three/fiber, @react-three/drei      |
| Maps          | maplibre-gl                                          |
| Animations    | gsap, motion (Framer Motion)                         |
| Realtime      | socket.io-client                                     |

## Environment Variables

```
NEXT_PUBLIC_BACKEND_URL     # Backend REST API base URL
NEXTAUTH_SECRET             # NextAuth secret
NEXTAUTH_URL                # App base URL
NEXT_PUBLIC_FIREBASE_*      # Firebase public config
```
