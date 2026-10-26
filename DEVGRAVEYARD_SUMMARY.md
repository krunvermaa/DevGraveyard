# DevGraveyard - Application Summary

## Overview
**DevGraveyard** is a dedicated social platform for developers to lay their abandoned, failed, or sunset projects to rest. It serves as a cathartic space where creators can log their dead projects, share the technical post-mortems or "lessons learned," and connect with other developers who have experienced similar technical roadblocks or scope creep.

## Core Features

### 🪦 Project Graves
* **Grave Creation:** Users can create a memorial for their dead projects by providing details such as Project Name, Cause of Death (e.g., Scope Creep, Loss of Interest, Technical Roadblocks), Lived For duration, Tech Stack, and Lessons Learned.
* **Anonymous Posting:** Option to bury a project anonymously if the developer prefers not to attach their identity to the failure.
* **Grave Interactions:**
  * **Pay Respects:** Users can press 'F' to pay respects to a fallen project.
  * **Leave Eulogies:** Visitors can write short eulogies/comments for the project.
  * **RIPs:** Quick acknowledgments from the community.

### 👥 Social & Community
* **User Profiles:** Customizable developer profiles featuring unique usernames, avatars, and social links (Instagram, WhatsApp).
* **Friend System:** Users can send, accept, or reject friend requests and manage their developer connections.
* **Following/Followers:** A one-way follow system to keep track of favorite developers and their graveyard additions.
* **Grave Sharing:** Users can share specific project graves directly with their friends within the platform.

### ⚙️ Account Management
* **Authentication:** Secure user authentication managed via Firebase Auth.
* **Settings:** Users can update their unique usernames, manage social links, and delete their accounts entirely if desired.

## Technical Architecture

* **Frontend Framework:** React 18+ (bootstrapped with Vite), utilizing functional components and hooks.
* **Language:** TypeScript for robust, type-safe development.
* **Styling:** Tailwind CSS for a highly responsive, modern, and dark-themed utility-first design.
* **Animations:** `motion/react` (Framer Motion) for fluid layout transitions, modal animations, and interactive feedback.
* **Icons:** `lucide-react` for clean, consistent SVG iconography.
* **Backend & Database:** Google Firebase
  * **Firestore:** NoSQL database structuring collections for `users`, `graves`, `usernames`, and `friend_requests`. Includes robust sub-collections for `friends`, `followers`, `following`, and `shared_graves`.
  * **Security Rules:** Comprehensive Firestore Security Rules ensuring authenticated access, valid data schema enforcement, and strict permission models for social features.
