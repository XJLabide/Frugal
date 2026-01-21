# Frugal 💰

Frugal is a modern, privacy-focused personal finance and budgeting application designed to help you track expenses, manage budgets, and achieve your financial goals. Built with **Next.js 16**, **TailwindCSS**, and **Firebase**.

![Frugal Dashboard Preview](https://placehold.co/600x400/1e293b/ffffff?text=Frugal+Dashboard)

## ✨ Features

- **📊 Interactive Dashboard**: Visual overview of your spending, recent transactions, and upcoming bills.
- **💸 Transaction Tracking**: Log income and expenses with detailed categories, notes, and locations.
- **🗓️ Recurring Transactions**: Set up automatic recurring bills (daily, weekly, monthly, yearly) so you never miss a payment.
- **💰 Smart Budgeting**: Set monthly budgets for specific categories or an overall spending limit.
- **🎯 Financial Goals**: Create savings goals, track progress, and "fund" them directly from your available balance.
- **📍 Location Tracking**: Track where your transactions happen and where your goal funds are stored (Bank, Wallet, GCash, etc.).
- **📈 Analytics**: Visual charts to analyze spending habits over time.
- **🔐 Secure Authentication**: Powered by Firebase Auth for secure user management.
- **🌙 Dark Mode**: Fully supported dark mode for comfortable viewing at night.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/)
- **Backend & Auth**: [Firebase](https://firebase.google.com/) (Firestore, Auth)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/) & React Testing Library

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Firebase project created in the [Firebase Console](https://console.firebase.google.com/)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/XJLabide/Frugal.git
    cd Frugal
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the root directory and add your Firebase credentials:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🧪 Running Tests

This project uses **Vitest** for unit and integration testing.

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

## 📂 Project Structure

```
├── app/                  # Next.js App Router pages & layouts
│   ├── (auth)/           # Authentication routes (login, signup)
│   ├── (dashboard)/      # Protected dashboard routes
├── components/           # Reusable UI components
│   ├── forms/            # Form components (Transaction, Budget, Goal)
│   ├── charts/           # Visualization components
│   ├── ui/               # Base UI elements (Buttons, Inputs, Cards)
├── hooks/                # Custom React hooks (Firebase data fetching)
├── lib/                  # Utilities and Firebase config
├── store/                # Global state (Zustand)
├── types/                # TypeScript interfaces
└── __tests__/            # Test files
```

## 📄 License

This project is personal and proprietary.
Created by **Xander Labide**.
