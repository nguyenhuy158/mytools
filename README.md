# ToolHub

Your Hub for Essential Tools
Trung tâm công cụ thiết yếu của bạn

A collection of useful online tools built with React Router.

## 🏗️ Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[🌐 Browser]
        Root[📄 Root Layout]
        Navbar[🧭 Navbar]
        Footer[🦶 Footer]
    end

    subgraph "Routing Layer"
        Router[🚦 React Router v7]
        Home[🏠 Home Page]
        
        subgraph "IT Tools Section"
            IT[💻 IT Tools Hub]
            JSON[📋 JSON Tools]
            TextDiff[🔄 Text Diff]
            Markdown[📝 Markdown Preview]
            ImageTools[🖼️ Image Tools]
            APITester[🔌 API Tester]
            NumberReading[🔢 Number Reading]
            Odoo[🎯 Odoo Inspector]
            Notes[📝 Notes]
        end
        
        subgraph "Lifestyle Section"
            Lifestyle[🌸 Lifestyle Hub]
            Pomodoro[⏱️ Pomodoro Timer]
            Quotes[💭 Random Quotes]
        end
        
        subgraph "Games Section"
            Games[🎮 Games Hub]
            Game2048[2️⃣0️⃣4️⃣8️⃣ 2048]
            Snake[🐍 Snake]
            Minesweeper[💣 Minesweeper]
            Tetris[🧱 Tetris]
            Sudoku[🔢 Sudoku]
            Loto[🎲 Loto]
        end
        
        Calendar[📅 Calendar]
        About[ℹ️ About]
    end

    subgraph "API Layer"
        NotesAPI[📝 Notes API]
        LotoAPI[🎲 Loto API]
        WSLoto[🔌 WebSocket Loto]
    end

    subgraph "Data Layer"
        LocalStorage[💾 Local Storage]
        CloudflareKV[☁️ Cloudflare KV]
        SessionState[🔐 Session State]
    end

    subgraph "Infrastructure"
        CloudflareWorkers[⚡ Cloudflare Workers]
        Edge[🌍 Edge Computing]
    end

    subgraph "Features"
        I18N[🌍 i18next<br/>EN/VI]
        DarkMode[🌙 Dark Mode]
        Toast[🔔 Sonner Toasts]
        SSR[🚀 SSR Support]
    end

    Browser --> Root
    Root --> Navbar
    Root --> Router
    Root --> Footer
    
    Router --> Home
    Router --> IT
    Router --> Lifestyle
    Router --> Games
    Router --> Calendar
    Router --> About
    
    IT --> JSON
    IT --> TextDiff
    IT --> Markdown
    IT --> ImageTools
    IT --> APITester
    IT --> NumberReading
    IT --> Odoo
    IT --> Notes
    
    Lifestyle --> Pomodoro
    Lifestyle --> Quotes
    
    Games --> Game2048
    Games --> Snake
    Games --> Minesweeper
    Games --> Tetris
    Games --> Sudoku
    Games --> Loto
    
    Notes -.->|CRUD| NotesAPI
    NotesAPI -.->|Store| LocalStorage
    
    Loto -.->|Create Room| LotoAPI
    Loto -.->|Real-time| WSLoto
    WSLoto -.->|Persist| CloudflareKV
    
    JSON -.->|History| LocalStorage
    Pomodoro -.->|State| SessionState
    Calendar -.->|Data| LocalStorage
    
    CloudflareWorkers --> Edge
    Edge --> Router
    
    Root -.->|Uses| I18N
    Root -.->|Uses| DarkMode
    Root -.->|Uses| Toast
    CloudflareWorkers -.->|Provides| SSR

    style Browser fill:#e1f5ff
    style Root fill:#fff3e0
    style Router fill:#f3e5f5
    style CloudflareWorkers fill:#e8f5e9
    style I18N fill:#fff9c4
    style DarkMode fill:#263238,color:#fff
```

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📝 Text Case Converter
- 🛠️ JSON Tools (Format, Validate, Minify, Fix, History, Clipboard, File Operations, Tab Size)
- 🗓️ Solar & Lunar Calendar
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
pnpm install
```

### Development

Start the development server with HMR:

```bash
pnpm dev
```

Your application will be available at `http://localhost:5173`.

## Previewing the Production Build

Preview the production build locally:

```bash
pnpm preview
```

## Building for Production

Create a production build:

```bash
pnpm build
```

## Deployment

Deployment is done using the Wrangler CLI.

To build and deploy directly to production:

```sh
pnpm deploy
```

To deploy a preview URL:

```sh
npx wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
npx wrangler versions deploy
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
