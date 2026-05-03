# VoteGuide AI 🗳️

**Your interactive, step-by-step civic companion for Indian elections.**

VoteGuide AI is a production-grade web application designed to help first-time voters, returning voters, and anyone confused by the election process navigate every step — from registration to casting a vote — with clarity, accessibility, and confidence.

---

## 🌟 Live Demo
🚀 **[View the Live Site on Google Cloud Run](https://voteguide-ai-919590654290.asia-south1.run.app)**

---

## 🚀 How it Works in 3 Steps

1.  **Tell us your situation**: Answer 3 simple questions about where you live and your voting history.
2.  **Get your Roadmap**: We generate a personalized timeline showing your specific deadlines and polling dates.
3.  **Ask anything**: Heard a rumor? Confused about an ID? Our **AI Civic Assistant** is available 24/7 to provide verified answers.

---

## ✨ Key Features for Citizens

*   🗺️ **Personalized Timeline**: A roadmap that stays with you. No more guessing when your registration or polling day is.
*   🤖 **AI Civic Assistant**: Powered by Google Gemini, it's like having an election expert in your pocket.
*   🛡️ **Myth Buster**: Protect your vote from misinformation. We verify common election rumors with cold, hard facts.
*   🔊 **Accessibility for All**: Includes "Read Aloud" features for low-vision users and simplified guides for everyone.
*   🛤️ **"What Happens Next?"**: Four specific paths (First-time, Returning, Missed Deadline, and Confused) that provide actionable advice for different user situations.

---

## 🛡️ Privacy & Security

We believe your vote is private, and so is your data. 
*   **Anonymous First**: You can use almost every feature without creating an account.
*   **Secure Sync**: Your journey is saved locally and synced to the cloud (Firebase) automatically using encrypted channels.
*   **Verified Data**: All election dates and rules are sourced from verified civic data and official guidelines.
*   **Enterprise-Grade Identity**: The AI Assistant uses Vertex AI identity-based access, ensuring no API keys are exposed to the browser.

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | [Next.js 15+](https://nextjs.org/) | App Router for optimal routing and Server Components for performance. |
| **Styling** | [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) | High-performance, zero-runtime overhead, and maximum design flexibility. |
| **AI** | [Google Gemini 1.5](https://deepmind.google/technologies/gemini/) | State-of-the-art LLM for providing accurate, identity-aware civic assistance. |
| **Database** | [Cloud Firestore](https://firebase.google.com/docs/firestore) | Real-time cloud sync for user profiles and regional election configurations. |
| **Auth** | [Firebase Auth](https://firebase.google.com/docs/auth) | Anonymous authentication for a frictionless user experience. |
| **Testing** | [Jest](https://jestjs.io/) + [RTL](https://testing-library.com/docs/react-testing-library/intro/) | Comprehensive test suite (~80% coverage) for business logic and UI. |

---

## 🏗️ Architecture & Data Flow

### User State Management
The application uses a unified `UserContext` that manages a dual-layered storage strategy:
1. **Local Storage**: For instant, offline-first access and zero-friction anonymous sessions.
2. **Cloud Sync**: Automatic background synchronization with Firestore, ensuring cross-device persistence.

### Navigation Logic ("Smart Routing")
- The app dynamically redirects users based on their progress:
  - **"My Journey"** leads to `/journey` (results) if a profile exists, or `/onboarding` (setup) if they are new.
  - **"Retake Questionnaire"** allows users to reset their preferences at any time.

---

## 🚀 Getting Started

### 1. Clone and Install
```bash
git clone https://github.com/your-repo/voteguide-ai.git
cd voteguide-ai
npm install
```

### 2. Environment Configuration
Create a `.env.local` file:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# AI Assistant (Gemini / Vertex AI)
# Local development uses GOOGLE_GENAI_API_KEY
GOOGLE_GENAI_API_KEY=your_gemini_key
```

### 3. Run Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing & Quality Assurance

The project maintains high standards of quality with **~80% line coverage**:
*   **Header & Navigation**: Fully tested dynamic routing logic.
*   **UserContext**: Fully tested LocalStorage and Firestore sync lifecycle.
*   **AI Actions**: Verified error handling and model responses.

Run tests using:
```bash
npm test          # Single run
npm run coverage  # View coverage report
```

---

## ♿ Accessibility & Design

VoteGuide AI is built with the **A11Y-First** philosophy:
- **WCAG 2.1 Compliance**: High-contrast color palettes and readable typography (Outfit & Inter).
*   **Semantic HTML**: Proper use of landmarks and ARIA attributes for screen readers.
*   **Motion Control**: Respects `prefers-reduced-motion` system settings.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
