# Deci - Daily Decision Deck App

A personal productivity app that helps you organize and prioritize your daily tasks using a card-based system.

## Features

- **Card Organization**: Organize tasks into four categories - Structure, Upkeep, Play, and Default
- **Daily Deck**: Drag and drop cards to build your daily task deck
- **Templates**: Save and load daily deck templates
- **File Storage**: Auto-save your data to your local computer drive (Chrome/Edge) or use localStorage fallback
- **Recurrence Types**: One-time, limited, or always-available tasks
- **Timer**: Built-in timer for focused work sessions

## Storage Options

The app supports multiple storage methods:

1. **File System Access API** (Chrome/Edge): Auto-saves to a file on your computer
   - Click "Set Save Location" to choose where to save your data
   - Data automatically syncs to the file as you work

2. **localStorage** (All browsers): Automatic fallback for browsers without File System API support

3. **Manual Export/Import**: Works in all browsers
   - Click "Export" to download your data as a JSON file
   - Click "Import" to load data from a previously exported file

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Deployment to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Initialize Git** (if not already a repository):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   - Follow the prompts to link or create a new project
   - Vercel will automatically detect the Vite configuration

4. **For production deployment**:
   ```bash
   vercel --prod
   ```

### Alternative Deployment Methods

#### Using Vercel Dashboard

1. Push your code to GitHub, GitLab, or Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Vercel will auto-detect Vite and deploy

#### Using GitHub Integration

1. Create a GitHub repository
2. Push your code:
   ```bash
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
3. Connect the repository to Vercel for automatic deployments on every push

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **@hello-pangea/dnd** - Drag and drop functionality
- **File System Access API** - Local file storage

## Browser Compatibility

- **Full features** (File System API): Chrome 86+, Edge 86+
- **Basic features** (localStorage): All modern browsers

## License

MIT
