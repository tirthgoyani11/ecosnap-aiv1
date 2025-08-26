# EcoSnap AI - Sustainable Shopping Assistant

A premium, glassmorphism-styled React application for scanning products and discovering their environmental impact with AI-powered sustainability insights.

## 🌟 Features

- **AI-Powered Scanner**: Instantly scan products to get eco scores and sustainability data
- **AR Preview**: Experience augmented reality shopping with floating eco scores
- **Bulk Scanning**: Analyze multiple products at once for comprehensive shopping insights
- **Dashboard**: Track your environmental impact with beautiful data visualizations
- **Leaderboard**: Compete with eco-warriors worldwide and earn achievements
- **Glassmorphism Design**: Premium UI with beautiful glass effects and smooth animations
- **Dark/Light Mode**: Automatic theme switching with smooth transitions
- **Responsive**: Perfect experience on mobile and desktop

## 🚀 Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling with custom design system
- **shadcn/ui** components with custom variants
- **Framer Motion** for smooth animations and page transitions
- **React Router** for navigation
- **Lucide React** for beautiful icons
- **Supabase** for backend and edge functions

## 🎨 Design System

### Colors
- **Primary**: Emerald 500/600 (#10B981 / #059669)
- **Secondary**: Teal 400/500 (#2DD4BF / #14B8A6)
- **Accent**: Teal 400 (#2DD4BF)

### Glass Effects
```css
.glass-card {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}
```

### Animations
- Page transitions: 220ms fade + translateY
- Staggered reveals: 60ms delay between items
- Hover effects: Scale and glow transformations
- Loading states: Shimmer and pulse animations

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── NavBar.tsx      # Navigation with mobile menu
│   ├── ThemeToggle.tsx # Dark/light mode switcher
│   ├── ScoreRing.tsx   # Animated circular progress
│   ├── EcoBadge.tsx    # Sustainability badges
│   ├── ProductCard.tsx # Product display cards
│   └── ...
├── pages/              # Page components
│   ├── Index.tsx       # Homepage with hero and features
│   ├── Scanner.tsx     # AI product scanner
│   ├── BulkScan.tsx    # Bulk product analysis
│   ├── Dashboard.tsx   # User stats and charts
│   ├── Leaderboard.tsx # Global rankings
│   └── ARPreview.tsx   # AR experience demo
├── hooks/              # Custom React hooks
│   ├── useScannerMock.ts
│   ├── useStatsMock.ts
│   └── ...
├── lib/                # Utilities and mock data
│   └── mock/           # Mock data for development
└── index.css           # Design system and custom styles
```

## 🛠️ Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## 🔧 Customization

### Changing Colors
Update the CSS variables in `src/index.css`:
```css
:root {
  --primary: 160 84% 39%;        /* Emerald */
  --secondary: 173 80% 40%;      /* Teal */
  --accent: 172 77% 56%;         /* Teal 400 */
}
```

### Adding New Components
1. Create component in `src/components/`
2. Follow the glassmorphism design patterns
3. Use semantic tokens from the design system
4. Add Framer Motion animations for interactivity

### Mock Data
All mock data is located in `src/lib/mock/`. To connect real APIs:
1. Replace mock hooks with real API calls
2. Update data interfaces if needed
3. Handle loading and error states

## 🎯 Key Components

### ScoreRing
Animated circular progress indicator for eco scores:
```tsx
<ScoreRing score={85} size="lg" animated />
```

### EcoBadge
Sustainability certification badges:
```tsx
<EcoBadge type="organic" size="md" />
```

### Glass Cards
Premium glassmorphism containers:
```tsx
<Card className="glass-card">
  <CardContent>Content here</CardContent>
</Card>
```

## 🌐 Pages Overview

- **/** - Hero landing page with features and testimonials
- **/scanner** - AI-powered product scanning interface
- **/bulk** - Bulk product analysis with drag & drop
- **/dashboard** - Personal eco stats and progress tracking
- **/leaderboard** - Global rankings and achievements
- **/ar-preview** - AR shopping experience demo

## 📱 Responsive Design

- Mobile-first approach with breakpoints at 768px and 1024px
- Touch-friendly buttons and navigation
- Optimized layouts for all screen sizes
- Progressive enhancement for larger screens

## ♿ Accessibility

- High contrast color ratios
- Keyboard navigation support
- Screen reader friendly markup
- Respects `prefers-reduced-motion`
- ARIA labels for interactive elements

## 🚀 Production Deployment

The app is optimized for deployment on any static hosting service:
- Vite provides optimized builds
- Assets are properly minified
- Modern browser features with fallbacks

---

Built with 💚 for a sustainable future