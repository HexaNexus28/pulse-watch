# PulseWatch Frontend

A modern, responsive Progressive Web Application (PWA) for tech intelligence monitoring and trend analysis.

## 🚀 Features

- **Modern Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS
- **PWA Ready**: Offline support, installable, push notifications
- **Responsive Design**: Mobile-first approach with dark mode
- **Component Architecture**: Reusable components with TypeScript
- **API Integration**: RESTful API with error handling and retries
- **Authentication**: JWT-based auth with refresh tokens
- **State Management**: React Context and custom hooks
- **Development Tools**: Hot reload, ESLint, TypeScript strict mode

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:5000`

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/HexaNexus28/pulse-watch.git
cd pulse-watch/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout/         # Layout components
├── context/           # React Context providers
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── styles/            # CSS and styling
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── config/            # Configuration files
└── App.tsx            # Main App component
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_ENABLE_PWA=true
VITE_ENABLE_DEBUG=false
```

### API Configuration

API endpoints are configured in `src/config/api.ts`:

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    // ...
  },
  // ...
};
```

## 🎨 Styling

The project uses Tailwind CSS with custom components:

- **Global Styles**: `src/styles/globals.css`
- **Component Styles**: `src/styles/components.css`
- **Theme**: Dark/light mode with CSS variables

## 🔌 API Integration

### Using the API Hook

```typescript
import { useApi } from '@/hooks/useApi';

const { data, loading, error, execute } = useApi(
  (id) => api.get(`/users/${id}`),
  { immediate: true }
);
```

### Authentication

```typescript
import { useAuth } from '@/context/AuthContext';

const { login, logout, user, isAuthenticated } = useAuth();
```

## 📱 PWA Features

### Offline Support

The application includes:
- Service worker for caching
- Offline fallback pages
- Background sync for pending actions

### Installation

Users can install the PWA:
- On desktop: Click the install icon in the address bar
- On mobile: Add to home screen from browser menu

## 🚀 Build & Deploy

### Development

```bash
npm run dev          # Start development server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Production

```bash
npm run build        # Build for production
npm run preview      # Preview production build
npm run serve        # Serve with Express
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "serve"]
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run serve` - Serve with Express (production)
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

## 📊 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Android Chrome 90+)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **API Connection Error**
   - Ensure backend is running on `http://localhost:5000`
   - Check `VITE_API_URL` in `.env` file

2. **PWA Not Working**
   - Serve over HTTPS or localhost
   - Check service worker registration in browser dev tools

3. **TypeScript Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check `tsconfig.json` for strict mode settings

### Development Tips

- Use React DevTools for component debugging
- Check Network tab for API requests
- Use Application tab for PWA debugging
- Enable TypeScript strict mode for better type safety

## 📚 Documentation

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
