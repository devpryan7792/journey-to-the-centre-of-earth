# Journey to the Center of the Earth: Chronicles

An immersive, scroll-based 3D visual journey through eight narrative checkpoints, inspired by Jules Verne's classic novel "Journey to the Center of the Earth".

## Overview
This application is a 3D web experience built with React, Three.js (React Three Fiber), and GSAP. It guides users through an interactive narrative using scroll-based animations and dynamic 3D scenes. As you scroll, you progress through different "checkpoints" that unravel the story and transform the visual environment.

## Features
- **Scroll-driven 3D Narrative:** Seamlessly transition through a linear story linked to your scrolling position.
- **Dynamic 3D Environments:** Rich, post-processed scenes with custom lighting, materials, and Bloom effects, rendered via `@react-three/fiber`.
- **Smooth Scrolling:** Utilizes `lenis` for buttery-smooth scroll interactions.
- **GSAP Animations:** Complex element reveals, transitions, and camera movements controlled by GSAP.
- **Cinematic UI Overlays:** A Head-Up Display (HUD) and typography that fully immerse the user, complete with responsive adaptations for mobile and tablet reading.

## Tech Stack
- **Framework:** React 19 + Vite
- **3D Graphics:** Three.js, React Three Fiber (`@react-three/fiber`), React Three Drei (`@react-three/drei`), `@react-three/postprocessing`
- **Animation:** GSAP, Motion (`motion`)
- **Scrolling:** Lenis
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Icons:** Lucide React

## Project Structure
- `/src/components/scene/`: Contains all 3D canvas components, including environments, lighting, models, and post-processing.
- `/src/components/ui/`: Contains standard 2D UI components like the HUD and chapter cards.
- `/src/components/checkpoints/`: Custom components dealing with the textual narrative overlays and checkpoint transitions.
- `/src/data/`: Houses the narrative text content and checkpoint configurations (`Checkpoints_Narrative.md` and `checkpoints.js`).

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Scripts
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles the application for production.
- `npm run preview`: Locally preview the production build.
