# 🎮 Game Assets

This directory contains assets for the mini-games in HAGUMI-APP.

## 📁 Directory Structure

```
src/assets/games/
├── sakura/          # Sakura Catch assets
│   ├── petals/         # Petal images
│   ├── backgrounds/     # Background images
│   └── sounds/          # Sound effects
├── memory/           # Memory Match assets
│   ├── cards/           # Card images
│   ├── backgrounds/     # Background images
│   └── sounds/          # Sound effects
└── feeding/           # Feeding Frenzy assets
    ├── food/            # Food item images
    ├── backgrounds/     # Background images
    └── sounds/          # Sound effects
```

## 🎨 Asset Requirements

### Sakura Catch
- **Petals**: Various sakura petal images (pink, white, etc.)
- **Background**: Cherry blossom themed backgrounds
- **Sounds**: Catch sounds, combo sounds, game over sounds

### Memory Match
- **Cards**: Card back and face images for all 8 pairs
- **Background**: Memory themed backgrounds
- **Sounds**: Flip sounds, match sounds, victory sounds

### Feeding Frenzy
- **Food Items**: Fish, meat, vegetables, treats images
- **Background: Feeding themed backgrounds
- **Sounds**: Eating sounds, combo sounds, game over sounds

## 📋 Asset Guidelines

### Image Specifications
- **Format**: PNG with transparency
- **Size**: 512x512px for game elements
- **Backgrounds**: 1920x1080px for backgrounds
- **Icons**: 64x64px for UI elements

### Audio Specifications
- **Format**: MP3 or WAV
- **Quality**: 128kbps for music, 64kbps for SFX
- **Volume**: Normalized to -3dB

## 🎨 Current Implementation

Currently, all games use emoji-based graphics instead of image assets. This is intentional for the MVP phase. The emoji-based approach provides:
- ✅ Faster development
- ✅ Smaller bundle size
- ✅ No external asset dependencies
- ✅ Consistent visual style
- ✅ Easy to maintain

## 🚀 Future Enhancements

### Phase 1: Basic Assets (Optional)
- Replace emojis with custom SVG icons
- Add simple background gradients
- Add basic sound effects

### Phase 2: Full Assets (Optional)
- Create custom pixel art for all game elements
- Add animated sprites
- Add background music
- Add sound effects for all interactions

### Phase 3: Advanced Assets (Optional)
- Create 3D models for game elements
- Add particle effects
- Add dynamic backgrounds
- Add voice acting

## 📝 Asset Creation Tools

Recommended tools for creating game assets:
- **Images**: Figma, Adobe Illustrator, GIMP
- **Audio**: Audacity, Adobe Audition
- **Sprites**: Aseprite, Piskel
- **3D**: Blender, Maya

## 🎨 Style Guide

### Color Palette
- **Sakura**: Pink (#FFB7C5, #FF69B4, #FFC0CB)
- **Memory**: Purple (#9C27B0, #7B1FA2, #5E35E8)
- **Feeding**: Orange (#FF9800, #FF6D00, #FF4500)

### Visual Style
- **Style**: Cute, playful, anime-inspired
- **Line Weight**: 2px, rounded corners
- **Shadows**: Soft drop shadows
- **Animations**: Smooth, bouncy, 60fps

## 📦 Asset Optimization

### Images
- Use WebP format for better compression
- Implement lazy loading for large assets
- Use sprite sheets for animations
- Optimize for different screen sizes

### Audio
- Use OGG Vorbis for music
- Use OGG Opus for sound effects
- Implement audio streaming for background music
- Preload critical sounds

## 🔧 Asset Management

### Loading Strategy
- Load assets on-demand
- Implement loading screens
- Show progress indicators
- Handle loading errors gracefully

### Caching
- Cache assets in browser storage
- Implement service worker for offline support
- Cache invalidation strategy
- Version control for assets

## 📊 Asset Tracking

### Version Control
- Track asset versions
- Document asset changes
- Maintain asset changelog
- Use semantic versioning

### Analytics
- Track asset load times
- Monitor asset usage
- Track asset errors
- Optimize based on data

## 🎯 Success Metrics

- **Load Time**: <2s for all assets
- **Bundle Size**: <5MB total
- **Asset Quality**: Consistent visual style
- **Performance**: 60fps gameplay
- **User Experience: Smooth, engaging gameplay