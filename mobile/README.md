# Hagumi Mobile App

React Native mobile application for Hagumi - Digital Pet game.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator (macOS) or Android Emulator
- Expo Go app (for testing on physical device)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS (macOS only)
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

### Testing on Physical Device

1. Install [Expo Go](https://expo.dev/client) on your phone
2. Run `npm start`
3. Scan the QR code with Expo Go app

## 📁 Project Structure

```
mobile/
├── src/
│   ├── components/          # Shared UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── StatBar.tsx
│   ├── screens/            # Screen components
│   │   ├── GameScreen.tsx
│   │   ├── MarketScreen.tsx
│   │   ├── SocialScreen.tsx
│   │   ├── ShopScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── navigation/         # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── hooks/             # Custom hooks
│   │   └── useTouchFeedback.ts
│   ├── shared/            # Shared utilities
│   │   ├── types/
│   │   ├── utils/
│   │   └── components/
│   └── App.tsx            # Main app component
├── docs/                  # Documentation
│   └── APP_STORE_SUBMISSION.md
├── assets/               # Images, fonts, etc.
├── App.tsx               # Entry point
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## 🎨 Design System

### Colors

- **Primary**: `#FF6B9D` (Pink)
- **Secondary**: `#C084FC` (Purple)
- **Background**: `#0A0A1A` (Dark Blue)
- **Card**: `#1A1A2E` (Dark Purple)
- **Text**: `#FFFFFF` (White)
- **Text Muted**: `#9CA3AF` (Gray)

### Typography

- **Headings**: 700 weight, 24-28px
- **Body**: 600 weight, 14-16px
- **Small**: 400 weight, 12px

### Components

#### Button
```tsx
<Button
  title="Click me"
  onPress={() => {}}
  variant="primary" // primary | secondary | danger | ghost
  size="medium"     // small | medium | large
/>
```

#### Card
```tsx
<Card
  variant="glass"   // default | glass | elevated
  padding={16}
  onPress={() => {}} // Optional
>
  {/* Content */}
</Card>
```

#### StatBar
```tsx
<StatBar
  label="Hunger"
  value={75}
  maxValue={100}
  icon="🍖"
  showValue={true}
/>
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=your_api_url
```

### Expo Configuration

Edit `app.json` to customize:

```json
{
  "expo": {
    "name": "Hagumi",
    "slug": "hagumi",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0A0A1A"
    }
  }
}
```

## 📱 Building for Production

### iOS

```bash
# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### Android

```bash
# Build for Android
eas build --platform android

# Submit to Play Store
eas submit --platform android
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linter
npm run lint
```

## 📚 Documentation

- [App Store Submission Guide](./docs/APP_STORE_SUBMISSION.md)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- [ ] Add haptic feedback for better mobile experience
- [ ] Implement deep linking for social features
- [ ] Add push notifications support
- [ ] Optimize bundle size

## 🚧 Roadmap

### Phase 1 (Current)
- [x] Basic UI components
- [x] Navigation setup
- [x] Screen implementations
- [x] Touch feedback optimization
- [x] App Store submission docs

### Phase 2 (Next)
- [ ] Supabase integration
- [ ] WebSocket real-time updates
- [ ] Push notifications
- [ ] Deep linking
- [ ] Performance optimization

### Phase 3 (Future)
- [ ] AR pet integration
- [ ] Voice chat
- [ ] Advanced animations
- [ ] Offline mode improvements

## 📞 Support

For support, email support@hagumi.game or join our Discord server.

---

**Built with ❤️ using Expo and React Native**