# 🌱 EcoCloudApp - AI-Powered Carbon Footprint Tracker

A comprehensive, intelligent carbon footprint tracking application built with React, TypeScript, and Google Cloud services. Track your environmental impact, get AI-powered suggestions, and make a positive difference for our planet!

## 🌟 Features

### 🧮 **Smart Carbon Calculator**
- Track emissions across 4 categories: Transport, Energy, Food, Waste
- Real-time CO₂ calculations with accurate emission factors
- Quick entry buttons for common activities
- Historical tracking and data visualization

### 🤖 **AI-Powered Assistant**
- **Dialogflow ES Integration** - Conversational chatbot for carbon queries
- **Gemini AI Suggestions** - Personalized eco-friendly recommendations
- Natural language processing for environmental questions
- Smart guidance for app navigation and features

### 📊 **Advanced Analytics & Reports**
- Interactive charts and graphs (Recharts)
- Weekly, monthly, and yearly trend analysis
- Category-wise emission breakdowns
- Downloadable PDF reports
- Progress tracking against personal goals

### 🏆 **Gamification System**
- Green Points reward system
- Achievement badges and milestones
- Activity streaks and challenges
- Leaderboards and social features
- Level progression based on eco-actions

### 🌍 **Real-Time Environmental Data**
- Live air quality monitoring (AQI, PM2.5, PM10)
- Weather conditions and UV index
- Carbon intensity of electricity grid
- Location-based environmental insights

### 👤 **User Management**
- Firebase Authentication (Email/Password only)
- Personalized user profiles
- Goal setting and preferences
- Data synchronization across devices

## 🚀 Technology Stack

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Recharts** for data visualization
- **React Router** for navigation
- **React Query** for state management

### **Backend & Services**
- **Node.js/Express** server
- **Firebase** (Auth, Firestore, Storage)
- **Google Cloud Run** for deployment
- **Dialogflow ES** for conversational AI
- **Gemini AI** for intelligent suggestions

### **APIs & Integrations**
- **OpenWeatherMap** for weather data
- **Google Maps** for geocoding
- **Carbon Interface** for emission factors
- **Air Quality API** for environmental data

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Google Cloud account
- Firebase project
- API keys for external services

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/EcoCloudApp.git
cd EcoCloudApp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# AI Services
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GOOGLE_CLOUD_PROJECT_ID=your_gcp_project_id

# External APIs
VITE_WEATHER_API_KEY=your_openweather_api_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Dialogflow
VITE_DIALOGFLOW_WEBHOOK_URL=your_webhook_url
```

### 4. Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

## 🚀 Deployment

### Google Cloud Run Deployment
```bash
# Build container image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/eco-footprint-app:latest

# Deploy to Cloud Run
gcloud run deploy eco-footprint-app \
  --image gcr.io/YOUR_PROJECT_ID/eco-footprint-app:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

## 📁 Project Structure

```
EcoCloudApp/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Auth.tsx        # Authentication component
│   │   ├── ChatBot.tsx     # Dialogflow chatbot
│   │   └── ...
│   ├── services/           # API services
│   │   ├── authService.ts  # Firebase auth
│   │   ├── carbonService.ts # Carbon calculations
│   │   ├── dialogflowService.ts # AI chatbot
│   │   └── ...
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities and config
│   └── types/              # TypeScript types
├── server.js               # Express server
├── Dockerfile              # Container configuration
├── package.json            # Dependencies
└── README.md               # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Cloud** for AI and infrastructure services
- **Firebase** for backend services
- **OpenWeatherMap** for weather data
- **shadcn/ui** for beautiful UI components
- **Recharts** for data visualization

## 📞 Support

For support, email support@ecocloudapp.com or join our [Discord community](https://discord.gg/ecocloudapp).

---

**Made with 💚 for a sustainable future**
