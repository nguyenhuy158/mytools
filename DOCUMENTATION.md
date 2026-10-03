# ToolHub Documentation

**Your Hub for Essential Tools** / **Trung tâm công cụ thiết yếu của bạn**

A comprehensive collection of essential online tools built with modern web technologies, featuring full internationalization support and a privacy-first approach.

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [UI/UX Guidelines](#-uiux-guidelines)
- [Internationalization](#-internationalization)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)

## 🛠 Tech Stack

### Core Framework
- **React Router v7** - Full-stack React framework with SSR support
- **React 19.1.1** - Latest React with concurrent features
- **TypeScript 5.9.2** - Type-safe development
- **Vite 7.1.7** - Fast build tool and dev server

### Styling & UI
- **Tailwind CSS v4.1.13** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Inter Font** - Modern, readable typography
- **Dark Mode Support** - Built-in theme switching

### Deployment & Infrastructure
- **Cloudflare Workers** - Edge computing platform
- **Cloudflare KV** - Key-value storage for games data
- **Wrangler** - Cloudflare deployment CLI

### Internationalization
- **i18next** - Internationalization framework
- **react-i18next** - React integration for i18next
- **Language Detection** - Automatic browser language detection

### Additional Libraries
- **Sonner** - Toast notifications
- **date-fns** - Date manipulation utilities
- **diff** - Text comparison library
- **json5** - Enhanced JSON parsing
- **lunar-javascript** - Lunar calendar calculations
- **nuqs** - Type-safe search params state management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd toolhub
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Generate Cloudflare types**
   ```bash
   pnpm cf-typegen
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

   Your application will be available at `http://localhost:5173`

## 💻 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with HMR |
| `pnpm build` | Create production build |
| `pnpm preview` | Preview production build locally |
| `pnpm check` | Run TypeScript type checking |
| `pnpm run deploy` | Build and deploy to Cloudflare |

1. **Type Checking**: Always run `pnpm check` before committing
2. **Build Verification**: Run `pnpm build` to ensure production compatibility
3. **Code Style**: Follow the established patterns in `STYLE_GUIDE.md`
4. **Testing**: Manual testing via browser (no automated test suite currently)

### Environment Configuration

The project uses Cloudflare Workers environment variables:
- `VALUE_FROM_CLOUDFLARE` - Example environment variable
- KV namespace bindings for games data storage

## 🌐 Deployment

### Production Deployment

**Automatic Deployment:**
```bash
pnpm run deploy
```

**Manual Deployment Steps:**
1. Build the project: `pnpm build`
2. Deploy with Wrangler: `wrangler deploy --config build/server/wrangler.json`

### Preview Deployment

**Create Preview:**
```bash
npx wrangler versions upload
```

**Promote to Production:**
```bash
npx wrangler versions deploy
```

### Custom Domain
The project is configured to deploy to `huyab.click` (apex) and `case.huyab.click` via Cloudflare routes.

## 📁 Project Structure

```
toolhub/
├── app/                          # Main application code
│   ├── components/              # Reusable UI components
│   │   ├── ButtonGroup.tsx     # Button group component
│   │   ├── ErrorDisplay.tsx    # Error handling component
│   │   ├── Footer.tsx          # Site footer
│   │   ├── GameGrid.tsx        # Games grid layout
│   │   ├── Navbar.tsx          # Navigation bar
│   │   └── ...                 # Other components
│   ├── locales/                # Internationalization files
│   │   ├── en/translation.json # English translations
│   │   └── vi/translation.json # Vietnamese translations
│   ├── routes/                 # Route components
│   │   ├── home.tsx           # Homepage
│   │   ├── it.tsx             # IT tools section
│   │   ├── games.tsx          # Games section
│   │   └── ...                # Other routes
│   ├── utils/                  # Utility functions
│   │   ├── history.ts         # History management
│   │   ├── storage.ts         # Local storage utilities
│   │   └── ...                # Other utilities
│   ├── app.css               # Global styles and Tailwind config
│   ├── root.tsx              # Root component
│   └── routes.ts             # Route configuration
├── public/                    # Static assets
├── workers/                   # Cloudflare Workers code
├── openspec/                  # Project specifications
└── ...                       # Configuration files
```

## ✨ Features

### IT Tools Section (`/it`)
- **JSON Tools** (`/it/json-tools`)
  - Format/Beautify JSON
  - Minify/Compact JSON
  - Fix/Repair malformed JSON
  - Validate JSON syntax
  - History management
  - File upload/download
  - Clipboard operations
  - Configurable tab size

- **Text Diff** (`/it/text-diff`)
  - Side-by-side text comparison
  - Highlight differences
  - History management

- **Image Tools** (`/it/image-tools`)
  - Upload and paste images
  - Crop functionality
  - Color picker
  - Copy/download images

- **API Tester** (`/it/api-tester`)
  - HTTP request testing
  - Headers and body configuration
  - Response viewing
  - Request history

- **Number Reading** (`/it/number-reading`)
  - Convert numbers to words
    - English and Vietnamese support

- **AI Playground** (`/it/transformers`)
  - Run AI models locally in browser
  - Sentiment Analysis using Transformers.js
  - Privacy-first (no server processing)

### Lifestyle Section (`/lifestyle`)
- **Pomodoro Timer** (`/lifestyle/pomodoro`)
  - Focus timer with breaks
  - Ambient background sounds
  - Customizable durations
  - Auto-start options

### Games Section (`/games`)
- **2048** - Number puzzle game
- **Snake** - Classic Nokia game
- **Minesweeper** - Mine detection game
- **Tetris** - Block stacking game
- **Sudoku** - Number puzzle game

### Additional Features
- **Calendar** (`/calendar`) - Solar and Lunar calendar
- **Case Converter** (Homepage) - Text case transformation
- **About Page** (`/about`) - Project information

## 🎨 UI/UX Guidelines

### Design System

**Color Palette:**
- Light mode: `bg-white`, `text-gray-900`
- Dark mode: `dark:bg-gray-950`, `dark:text-gray-100`
- Accent colors from Tailwind's default palette

**Typography:**
- Primary font: Inter (with system fallbacks)
- Font sizes: Tailwind's type scale (`text-sm`, `text-base`, `text-lg`, etc.)
- Font weights: `font-normal`, `font-medium`, `font-semibold`, `font-bold`

**Spacing & Layout:**
- Mobile-first responsive design
- Consistent spacing using Tailwind's scale
- Grid layouts for tool collections
- Card-based component design

### Component Patterns

**Navigation:**
- Responsive navbar with mobile menu
- Language switcher (EN/VI)
- Dark/light mode toggle
- Breadcrumb navigation for nested routes

**Forms & Inputs:**
- Consistent input styling
- Proper focus states
- Error handling and validation
- Accessibility compliance

**Buttons:**
- Primary, secondary, and ghost variants
- Consistent hover and focus states
- Loading states where applicable
- Icon + text combinations

### Icons & Assets
- **Icon Library**: Lucide React
- **Favicon**: Available in `/public/favicon.ico` and `/public/favicon.png`
- **Font**: Inter loaded via CSS with system fallbacks

### Responsive Design
- **Mobile First**: Base styles for mobile, then scale up
- **Breakpoints**:
  - `sm:` 640px+
  - `md:` 768px+
  - `lg:` 1024px+
  - `xl:` 1280px+

## 🌍 Internationalization

### Supported Languages
- **English (en)** - Default language
- **Vietnamese (vi)** - Secondary language

### Translation Structure
```json
{
  "app_name": "ToolHub",
  "slogan": "Your Hub for Essential Tools",
  "nav": { /* Navigation translations */ },
  "it_tools": { /* IT tools translations */ },
  "games": { /* Games translations */ },
  // ... other sections
}
```

### Adding New Languages

1. **Create translation file:**
   ```bash
   mkdir app/locales/[language-code]
   cp app/locales/en/translation.json app/locales/[language-code]/translation.json
   ```

2. **Translate content:**
   - Update all text strings in the new translation file
   - Maintain the same JSON structure

3. **Update i18n configuration:**
   - Add language to supported languages list
   - Update language detection settings

### Usage in Components
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <h1>{t('nav.home')}</h1>
  );
}
```

## 🗺 Roadmap

### Current Status
- ✅ Core IT tools (JSON, Text Diff, Image Tools, API Tester)
- ✅ Games collection (2048, Snake, Minesweeper, Tetris, Sudoku)
- ✅ Lifestyle tools (Pomodoro Timer)
- ✅ Full internationalization (EN/VI)
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Cloudflare deployment

### Planned Features
- 🔄 Additional IT tools (URL encoder/decoder, Base64 converter, etc.)
- 🔄 More games and entertainment tools
- 🔄 Enhanced accessibility features
- 🔄 Performance optimizations
- 🔄 Additional language support
- 🔄 Offline functionality (PWA)
- 🔄 User preferences persistence
- 🔄 Analytics and usage tracking

### Technical Improvements
- 🔄 Automated testing suite
- 🔄 CI/CD pipeline
- 🔄 Performance monitoring
- 🔄 SEO optimizations
- 🔄 Bundle size optimization
- 🔄 Error tracking and reporting

## 🤝 Contributing

### Development Guidelines

1. **Code Style:**
   - Follow TypeScript best practices
   - Use Tailwind CSS for all styling
   - Maintain mobile-first responsive design
   - Ensure dark mode compatibility

2. **Component Development:**
   - Create reusable components in `/app/components/`
   - Use proper TypeScript types
   - Include proper accessibility attributes
   - Follow existing naming conventions

3. **Internationalization:**
   - Add translation keys for all user-facing text
   - Update both English and Vietnamese translations
   - Test language switching functionality

4. **Testing:**
   - Test in both light and dark modes
   - Verify responsive behavior on different screen sizes
   - Test internationalization features
   - Ensure proper error handling

### Submitting Changes

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test thoroughly**
   ```bash
   pnpm check
   pnpm build
   ```
5. **Commit with clear messages**
6. **Submit a pull request**

### OpenSpec Integration

This project uses OpenSpec for managing feature specifications:
- Review `/openspec/AGENTS.md` for AI assistant guidelines
- Check existing specs in `/openspec/specs/` before adding features
- Create proposals for significant changes in `/openspec/changes/`

---

## 📄 License

This project is open source. Please check the repository for specific license information.

## 🙏 Acknowledgments

- Built with React Router v7
- Styled with Tailwind CSS v4
- Deployed on Cloudflare Workers
- Icons by Lucide React
- Internationalization by i18next

---

**ToolHub** - Making essential tools accessible to everyone, everywhere. 🚀