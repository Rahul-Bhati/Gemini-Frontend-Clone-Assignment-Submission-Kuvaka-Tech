# Gemini Chat – Conversational AI Frontend

A responsive, feature-rich, Gemini-style conversational AI chat application frontend built with **React** and **Next.js**. This project simulates OTP-based authentication, chatroom management, AI messaging, image uploads, and modern UX features — showcasing real-world frontend engineering principles.

## 🚀 Objective

Build a fully functional frontend that mimics the UX of a modern conversational AI product. The app demonstrates:

- Component-based architecture
- Client-side state management
- Authentication flow (OTP simulation)
- Advanced chat interface
- UX performance optimizations
- Responsive + accessible UI

---

## 🧩 Core Features

### 1. 🔐 Authentication (OTP Simulation)

- Login/Signup via phone number and country code.
- Country codes fetched from [`restcountries.com`](https://restcountries.com/).
- OTP send/verify simulated with `setTimeout`.
- Form validation via **React Hook Form** + **Zod**.
- Phone number and OTP input handling.

---

### 2. 🧭 Dashboard

- View all user chatrooms.
- Create new chatroom or delete existing ones.
- Toast notifications for feedback on create/delete.
- Local state synced with `localStorage`.

---

### 3. 💬 Chatroom Interface

- Simulated real-time AI messaging:
  - Timestamps
  - "Gemini is typing..." indicator
  - Throttled/fake delay for AI replies
- Infinite reverse scroll to fetch older messages (mocked)
- Pagination (20 messages/page)
- Auto-scroll to latest message
- Upload images (Base64 or preview URL)
- Copy-to-clipboard on message hover
- Rich UX: animations, hover effects, mobile-optimized layout

---

### 4. 🌐 Global UX

- ✅ Mobile-first responsive layout
- 🌙 Dark mode toggle
- 🔍 Debounced search to filter chatrooms
- 💾 Persistent auth/chat data via `localStorage`
- 💀 Skeleton loaders for chat while messages load
- 🔔 Toast notifications: OTP sent, message sent, chatroom deleted, etc.
- ⌨️ Keyboard accessibility across UI

---

## 🛠 Tech Stack

- **Framework**: Next.js + React
- **State Management**: useState, useEffect
- **Validation**: React Hook Form + Zod
- **Styling**: Tailwind CSS (or your CSS framework)
- **Persistence**: localStorage
- **Toast**: react-hot-toast or equivalent
- **Icons/UI**: React Icons / Custom SVGs
- **Image Upload**: base64/preview simulation

---

## 🧪 How to Run Locally

```bash
# Clone the repo
git clone https://github.com/Rahul-Bhati/Gemini-Frontend-Clone-Assignment-Submission-Kuvaka-Tech
cd Gemini-Frontend-Clone-Assignment-Submission-Kuvaka-Tech

# Install dependencies
npm install

# Run the dev server
npm run dev
