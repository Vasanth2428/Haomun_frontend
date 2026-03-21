# 🏮 HaoMun: The Intelligence Pavilion

**"Where Ancient Wisdom Meets Modern Intelligence"**

HaoMun is a high-performance, full-stack intelligence analysis platform designed for competitive programmers. It aggregates performance data from multiple digital "realms" (LeetCode, Codeforces, CodeChef, and GeeksforGeeks) into a unified, AI-driven dashboard.

---

## 🏛️ Project Pillars

### 📊 **Intelligence Pavilion**
The core analysis hub that fetches real-time data from disparate platforms using a hybrid engine of **GraphQL**, **REST APIs**, and **Web Scraping**. 

### ⚔️ **Contrast Hall**
A side-by-side comparison engine that allows users to analyze their progress against peers or multi-platform benchmarks.

### 📜 **Scroll Forge**
An AI-powered content generation and editing suite integrated with **Google Gemini (1.5 Flash/Pro)** for deep skill analysis and report refinement.

### 🏺 **Archive Chamber**
A historical visualization layer that uses **Recharts** to map consistency through interactive heatmaps and performance trendlines.

---

## 🧠 The HaoMun Oracle (Scoring Methodology)

Unlike standard tracking apps, HaoMun uses a custom weighted algorithm to calculate your **HaoMun Score** and **Mastery Level (Apprentice → Sage → Master → Oracle)**:

*   **Platform Breadth**: Multipliers for users who diversify their efforts across multiple platforms.
*   **Difficulty Depth**: Weighted scores based on Easy, Medium, and Hard problem distributions.
*   **Consistency Bonus**: Points awarded for daily activity sequences captured from the platform heatmaps.
*   **Rating Weightage**: Direct integration of Elo-style ratings from Codeforces and CodeChef.

---

## 🛠️ Technical Architecture

### **The Stack**
*   **Frontend**: [Next.js 15+](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS 4](https://tailwindcss.com/).
*   **UI/UX**: [Radix UI](https://www.radix-ui.com/) for accessibility, [Lucide React](https://lucide.dev/) for iconography.
*   **Backend**: Next.js Route Handlers (Edge-compatible).
*   **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) for structured storage.
*   **Security**: Custom **JWT-based Authentication** with persistent sessions and route-protection via Next.js Middleware.
*   **Data Aggregation Engine**:
    *   **GraphQL**: Precise data fetching from LeetCode.
    *   **REST**: Structured access to Codeforces API.
    *   **Cheerio/Scraping**: High-fidelity scraping for CodeChef and GeeksforGeeks.
*   **Artificial Intelligence**: Direct integration with **Google Gemini SDK** for personalized skill analysis.
*   **Reporting**: Server-side **PDF generation** for performance reports.

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- MongoDB Instance (Atlas or Local)
- Google Gemini API Key (for AI features)

### **Installation**

1. **Clone & Install**
   ```bash
   git clone https://github.com/Vasanth2428/haomun-f.git
   cd haomun-f
   npm install
   ```

2. **Environment Configuration**
   Create a `.env.local` file:
   ```env
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

---

## 🗺️ Roadmap to SaaS

HaoMun is currently a highly functional full-stack platform. Future evolutions include:
- [ ] **Commercial Layer**: Integration with Stripe for premium "Oracle Insights".
- [ ] **Teams & Cohorts**: Collaborative workspaces for coding communities.
- [ ] **Mobile Mastery**: Progressive Web App (PWA) support for mobile-first tracking.
- [ ] **Public APIs**: Allowing third-party developers to build on top of the HaoMun score.

---

## 📄 License

This project is part of the HaoMun intelligence analysis suite. All rights reserved.