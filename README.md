# Deci - Daily Decision Deck App

A personal productivity app that helps you organize and prioritize your daily tasks using a card-based system.

## Features

- **Card Organization**: Organize tasks into four categories - Structure, Upkeep, Play, and Default
- **Daily Deck**: Drag and drop cards to build your daily task deck
- **Templates**: Save and load daily deck templates for recurring schedules
- **Cloud Sync**: Automatic cloud storage with Firebase
- **Recurrence Types**: One-time, limited, or always-available tasks
- **Anonymous Auth**: Your data is private and synced across devices
- **Analytics**: PostHog integration for usage insights

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **@hello-pangea/dnd** - Drag and drop functionality
- **Firebase** - Authentication and Firestore database
- **PostHog** - Product analytics

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project (for database)
- PostHog account (for analytics, optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd card-deck-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   # PostHog Analytics
   VITE_PUBLIC_POSTHOG_KEY=your-posthog-key
   VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

4. **Set up Firebase**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing
   - Enable **Anonymous Authentication**:
     - Go to Authentication > Sign-in method
     - Enable Anonymous provider
   - Create a **Firestore Database**:
     - Go to Firestore Database
     - Create database in production mode
   - Deploy security rules (see `firestore.rules`)

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Deploy to Firebase Hosting

1. **Login to Firebase**
   ```bash
   npx firebase login
   ```

2. **Deploy**
   ```bash
   # Deploy hosting only
   npm run deploy

   # Deploy everything (hosting + Firestore rules)
   npm run deploy:all
   ```

3. **Your app will be live at:**
   ```
   https://your-project-id.web.app
   ```

### Firestore Security Rules

The app uses the following security rules (in `firestore.rules`):

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

This ensures users can only access their own data.

## Project Structure

```
src/
├── components/          # React components
│   ├── Card.jsx        # Individual card component
│   ├── CardModal.jsx   # Card creation/edit modal
│   ├── CardStack.jsx   # Category stack container
│   └── DailyDeck.jsx   # Daily deck panel
├── utils/
│   ├── firebaseStorage.js  # Firebase data persistence
│   └── debounce.js         # Debounce utility
├── firebase.js         # Firebase configuration
├── App.jsx            # Main application
└── main.jsx           # Application entry point
```

## PostHog Events

The app tracks the following events for analytics:

- `app_loaded` - When the app initializes
- `card_created` - When a user creates a new card
- `data_exported` - When user exports data
- `data_imported` - When user imports data

## Browser Compatibility

- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT
