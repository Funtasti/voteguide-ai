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

## 🛠️ Project Philosophy & Design

### **Chosen Vertical: Civic Engagement**
In the world's largest democracy, information is often fragmented. VoteGuide AI centralizes civic data and uses AI to make it personalized and actionable for every citizen.

### **The Approach**
Our design logic is centered on **"Zero-Friction Access"**:
*   **Privacy-First Onboarding**: We use Firebase Anonymous Authentication to allow users to save their progress without requiring a phone number or email immediately.
*   **Dual-Layered Persistence**: Logic is split between **LocalStorage** (for instant, offline-first access) and **Cloud Firestore** (for secure, cross-device synchronization).
*   **Intelligent Routing**: The application remembers user state; returning users are automatically routed to their personalized journey, while new users are guided through discovery.

### **System Logic**
*   **Dynamic Roadmaps**: Deadlines are calculated based on a matrix of regional phases and user voter status.
*   **Verification Engine**: The Myth Buster integrates Google Gemini 1.5 to provide real-time explanations for complex election rumors.
*   **Accessibility First**: Built-in "Read Aloud" features ensure the solution works for users with varying literacy or vision levels.

---

## ✨ Key Features

*   🗺️ **Personalized Timeline**: A roadmap that stays with you. No more guessing when your registration or polling day is.
*   🤖 **AI Civic Assistant**: Powered by Google Gemini, it's like having an election expert in your pocket.
*   🛡️ **Myth Buster**: Protect your vote from misinformation. We verify common election rumors with cold, hard facts.
*   🛤️ **Actionable Scenarios**: Specific paths for First-time voters, Returning voters, and those who missed deadlines.

---

## 🛡️ Security & Privacy

*   **Secure Identity**: The AI Assistant uses Vertex AI identity-based access, ensuring no API keys are exposed to the browser.
*   **Data Integrity**: Firestore Security Rules ensure users can only access their own private profiles.
*   **Development Assumptions**:
    *   The roadmap uses demo data modeled on the 2026 Lok Sabha cycle.
    *   Procedures are based on the latest official guidelines for registration and polling.
    *   A live connection is used for AI features, but the core UI is resilient through local caching.

---

## 🏗️ Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | [Next.js 15+](https://nextjs.org/) | App Router and Server Components for production performance. |
| **Styling** | [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) | Clean, high-performance, and flexible. |
| **AI** | [Google Gemini 1.5](https://deepmind.google/technologies/gemini/) | State-of-the-art LLM via Vertex AI for secure assistance. |
| **Database** | [Cloud Firestore](https://firebase.google.com/docs/firestore) | Real-time cloud sync for user profiles. |
| **Testing** | [Jest](https://jestjs.io/) + [RTL](https://testing-library.com/docs/react-testing-library/intro/) | Comprehensive test suite (~80% coverage). |

---

## 🚀 Local Development

### 1. Clone and Install
```bash
git clone https://github.com/your-repo/voteguide-ai.git
cd voteguide-ai
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000).

---

## 📄 License
MIT License - see the [LICENSE](LICENSE) file for details.
