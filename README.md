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

### 💻 IT Tools Section Flow

```mermaid
graph LR
    subgraph "IT Tools Hub"
        ITHome[🏠 IT Tools Home]
    end

    subgraph "JSON Tools"
        JSONInput[📝 JSON Input]
        JSONParse[🔍 Parse/Validate]
        JSONFormat[✨ Format]
        JSONMinify[📦 Minify]
        JSONFix[🔧 Auto-fix]
        JSONHistory[📚 History]
        JSONClipboard[📋 Clipboard]
    end

    subgraph "Text Diff Tool"
        DiffInput[📝 Two Text Inputs]
        DiffEngine[⚙️ Diff Algorithm]
        DiffDisplay[🎨 Side-by-Side View]
        DiffHighlight[🖍️ Highlight Changes]
    end

    subgraph "Markdown Preview"
        MDInput[📝 Markdown Input]
        MDRender[🎨 Live Preview]
        MDExport[💾 Export HTML]
    end

    subgraph "Image Tools"
        ImgUpload[📤 Upload Image]
        ImgResize[📏 Resize]
        ImgCompress[🗜️ Compress]
        ImgConvert[🔄 Format Convert]
        ImgDownload[💾 Download]
    end

    subgraph "API Tester"
        APIConfig[⚙️ Configure Request]
        APIMethod[🔧 Method Select]
        APIHeaders[📋 Headers]
        APIBody[📝 Body]
        APISend[🚀 Send Request]
        APIResponse[📊 View Response]
    end

    subgraph "Other Tools"
        NumberRead[🔢 Number to Words]
        Odoo[🎯 Odoo Inspector]
        NotesApp[📝 Notes CRUD]
    end

    ITHome --> JSONInput
    ITHome --> DiffInput
    ITHome --> MDInput
    ITHome --> ImgUpload
    ITHome --> APIConfig
    ITHome --> NumberRead
    ITHome --> Odoo
    ITHome --> NotesApp

    JSONInput --> JSONParse
    JSONParse -->|Valid| JSONFormat
    JSONParse -->|Invalid| JSONFix
    JSONFormat --> JSONHistory
    JSONFormat --> JSONClipboard
    JSONMinify --> JSONHistory

    DiffInput --> DiffEngine
    DiffEngine --> DiffDisplay
    DiffDisplay --> DiffHighlight

    MDInput --> MDRender
    MDRender --> MDExport

    ImgUpload --> ImgResize
    ImgUpload --> ImgCompress
    ImgUpload --> ImgConvert
    ImgResize --> ImgDownload
    ImgCompress --> ImgDownload
    ImgConvert --> ImgDownload

    APIConfig --> APIMethod
    APIMethod --> APIHeaders
    APIHeaders --> APIBody
    APIBody --> APISend
    APISend --> APIResponse

    NotesApp -.->|localStorage| LocalDB[(💾 Local Storage)]

    style JSONParse fill:#e1f5ff
    style DiffEngine fill:#fff3e0
    style MDRender fill:#f3e5f5
    style APISend fill:#e8f5e9
```

### 🌸 Lifestyle Section Flow

```mermaid
graph TB
    subgraph "Lifestyle Hub"
        LSHome[🏠 Lifestyle Home]
    end

    subgraph "Pomodoro Timer"
        PomodoroSetup[⚙️ Configure Timer]
        PomodoroWork[⏱️ Work Session<br/>25 min]
        PomodoroShortBreak[☕ Short Break<br/>5 min]
        PomodoroLongBreak[🌴 Long Break<br/>15 min]
        PomodoroCycles[🔄 Track Cycles]
        PomodoroNotif[🔔 Notifications]
        PomodoroSound[🔊 Sound Alerts]
    end

    subgraph "Random Quotes"
        QuotesFetch[📚 Load Quotes]
        QuotesDisplay[💭 Display Quote]
        QuotesRandom[🎲 Random Selection]
        QuotesFavorite[⭐ Save Favorite]
        QuotesShare[📤 Share]
    end

    subgraph "Calendar"
        CalendarView[📅 Calendar Grid]
        SolarDate[☀️ Solar Date]
        LunarDate[🌙 Lunar Date]
        TetCalc[🎊 Tet Calculator]
        EventsList[📋 Events/Holidays]
    end

    LSHome --> PomodoroSetup
    LSHome --> QuotesFetch
    LSHome -.-> CalendarView

    PomodoroSetup --> PomodoroWork
    PomodoroWork -->|Complete| PomodoroShortBreak
    PomodoroShortBreak --> PomodoroWork
    PomodoroWork -->|4 Cycles| PomodoroLongBreak
    PomodoroLongBreak --> PomodoroWork
    PomodoroWork --> PomodoroCycles
    PomodoroWork --> PomodoroNotif
    PomodoroNotif --> PomodoroSound

    QuotesFetch --> QuotesRandom
    QuotesRandom --> QuotesDisplay
    QuotesDisplay --> QuotesFavorite
    QuotesDisplay --> QuotesShare

    CalendarView --> SolarDate
    CalendarView --> LunarDate
    SolarDate --> TetCalc
    LunarDate --> TetCalc
    CalendarView --> EventsList

    PomodoroCycles -.->|State| SessionStorage[(🔐 Session)]
    QuotesFavorite -.->|Save| LocalStorage[(💾 Local Storage)]
    CalendarView -.->|Cache| LocalStorage

    style PomodoroWork fill:#ffcdd2
    style PomodoroShortBreak fill:#c8e6c9
    style PomodoroLongBreak fill:#b3e5fc
    style QuotesDisplay fill:#fff9c4
```

### 🎮 Games Section Flow

```mermaid
graph TB
    subgraph "Games Hub"
        GamesHome[🏠 Games Home]
    end

    subgraph "2048 Game"
        G2048Init[🎬 Initialize Grid]
        G2048Input[⌨️ Keyboard/Swipe]
        G2048Move[➡️ Move Tiles]
        G2048Merge[🔗 Merge Tiles]
        G2048Score[🏆 Update Score]
        G2048Check[❓ Check Win/Lose]
    end

    subgraph "Snake Game"
        SnakeInit[🐍 Initialize Snake]
        SnakeMove[➡️ Auto Movement]
        SnakeInput[⌨️ Direction Control]
        SnakeFood[🍎 Generate Food]
        SnakeCollision[💥 Collision Check]
        SnakeGrow[📈 Grow Snake]
        SnakeScore[🏆 Update Score]
    end

    subgraph "Minesweeper"
        MineInit[💣 Generate Mines]
        MineGrid[📊 Create Grid]
        MineClick[🖱️ Cell Click]
        MineReveal[👁️ Reveal Cell]
        MineFlag[🚩 Flag Cell]
        MineCheck[✅ Check Win]
    end

    subgraph "Tetris"
        TetrisInit[🧱 Initialize Board]
        TetrisSpawn[📦 Spawn Tetromino]
        TetrisMove[⬇️ Auto Fall]
        TetrisRotate[🔄 Rotate]
        TetrisPlace[📍 Place Piece]
        TetrisClear[💥 Clear Lines]
        TetrisScore[🏆 Update Score]
        TetrisLevel[⬆️ Increase Level]
    end

    subgraph "Sudoku"
        SudokuInit[🔢 Generate Puzzle]
        SudokuInput[✏️ Number Input]
        SudokuValidate[✅ Validate Move]
        SudokuHint[💡 Show Hint]
        SudokuCheck[🎯 Check Solution]
    end

    subgraph "Loto (Multiplayer)"
        LotoCreate[🎲 Create Room]
        LotoJoin[👥 Join Room]
        LotoWS[🔌 WebSocket Connect]
        LotoCall[📢 Call Number]
        LotoMark[✓ Mark Card]
        LotoWin[🏆 Check Bingo]
        LotoBroadcast[📡 Broadcast State]
    end

    GamesHome --> G2048Init
    GamesHome --> SnakeInit
    GamesHome --> MineInit
    GamesHome --> TetrisInit
    GamesHome --> SudokuInit
    GamesHome --> LotoCreate

    G2048Init --> G2048Input
    G2048Input --> G2048Move
    G2048Move --> G2048Merge
    G2048Merge --> G2048Score
    G2048Score --> G2048Check

    SnakeInit --> SnakeMove
    SnakeMove --> SnakeInput
    SnakeInput --> SnakeCollision
    SnakeCollision -->|No| SnakeFood
    SnakeFood --> SnakeGrow
    SnakeGrow --> SnakeScore

    MineInit --> MineGrid
    MineGrid --> MineClick
    MineClick --> MineReveal
    MineClick --> MineFlag
    MineReveal --> MineCheck

    TetrisInit --> TetrisSpawn
    TetrisSpawn --> TetrisMove
    TetrisMove --> TetrisRotate
    TetrisRotate --> TetrisPlace
    TetrisPlace --> TetrisClear
    TetrisClear --> TetrisScore
    TetrisScore --> TetrisLevel
    TetrisLevel --> TetrisSpawn

    SudokuInit --> SudokuInput
    SudokuInput --> SudokuValidate
    SudokuValidate --> SudokuCheck
    SudokuInput --> SudokuHint

    LotoCreate --> LotoWS
    LotoJoin --> LotoWS
    LotoWS --> LotoCall
    LotoCall --> LotoBroadcast
    LotoBroadcast --> LotoMark
    LotoMark --> LotoWin

    LotoWS -.->|Persist| CloudflareKV[(☁️ Cloudflare KV)]
    G2048Score -.->|Save| LocalStorage[(💾 Local Storage)]
    SnakeScore -.->|Save| LocalStorage
    TetrisScore -.->|Save| LocalStorage

    style G2048Check fill:#ffeb3b
    style SnakeCollision fill:#ff5252
    style MineReveal fill:#4caf50
    style TetrisClear fill:#2196f3
    style LotoBroadcast fill:#9c27b0
```

### 🔌 API & Infrastructure

```mermaid
graph TB
    subgraph "Client Side"
        Components[⚛️ React Components]
        Routes[🚦 Routes]
    end

    subgraph "API Endpoints"
        NotesGET[GET /api/notes]
        NotesPOST[POST /api/notes]
        NotesPUT[PUT /api/notes/:id]
        NotesDELETE[DELETE /api/notes/:id]
        LotoCreate[POST /api/loto/create-room]
        LotoWS[WS /api/loto/room/:id/ws]
    end

    subgraph "Data Storage"
        LocalStorage[💾 Local Storage<br/>- Notes<br/>- JSON History<br/>- Game Scores<br/>- Calendar Data]
        SessionStorage[🔐 Session Storage<br/>- Pomodoro State<br/>- Temp Data]
        CloudflareKV[☁️ Cloudflare KV<br/>- Loto Rooms<br/>- Game State]
    end

    subgraph "Cloudflare Workers"
        Worker[⚡ Main Worker]
        DurableObjects[🎲 Durable Objects<br/>Loto Rooms]
        Edge[🌍 Edge Network]
    end

    subgraph "Features Layer"
        I18N[🌍 i18next<br/>EN/VI Translation]
        Theme[🌙 Theme System<br/>Light/Dark]
        Toast[🔔 Toast Notifications]
        SSR[🚀 Server-Side Rendering]
    end

    Routes --> NotesGET
    Routes --> NotesPOST
    Routes --> NotesPUT
    Routes --> NotesDELETE
    Routes --> LotoCreate
    Routes --> LotoWS

    NotesGET -.->|Read| LocalStorage
    NotesPOST -.->|Write| LocalStorage
    NotesPUT -.->|Update| LocalStorage
    NotesDELETE -.->|Delete| LocalStorage

    LotoCreate --> Worker
    LotoWS --> DurableObjects
    DurableObjects -.->|Persist| CloudflareKV

    Components -.->|Use| SessionStorage

    Worker --> Edge
    Edge --> SSR

    Components --> I18N
    Components --> Theme
    Components --> Toast

    style Worker fill:#f4511e,color:#fff
    style DurableObjects fill:#7b1fa2,color:#fff
    style CloudflareKV fill:#0288d1,color:#fff
    style Edge fill:#388e3c,color:#fff
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
- 📱 PWA Support (Offline ready & Installable)
- 🖥️ CLI-friendly (`curl huyab.click/upper -d 'đường phố'`)
- 📖 [React Router docs](https://reactrouter.com/)

## CLI Usage

The case converter works from a terminal — no install, just `curl`. Requests
from curl/wget (or any client without a browser `User-Agent`) get plain text
instead of HTML.

```sh
curl huyab.click                          # banner + case list
curl huyab.click/-h                       # full help
curl huyab.click/upper -d 'đường phố'     # ĐƯỜNG PHỐ
curl 'huyab.click/title/tỉnh ninh thuận'  # Tỉnh Ninh Thuận
cat notes.txt | curl huyab.click/lower --data-binary @-
curl 'huyab.click/capitalized?text=ăn ở ưu đãi&json'
```

`wget` works the same way:

```sh
wget -qO- huyab.click/-h
wget -qO- --post-data='tỉnh ninh thuận' huyab.click/upper
wget -qO- 'huyab.click/title/tỉnh ninh thuận'
```

One wget limitation: it cannot take the body from a pipe (`--post-file` needs
a seekable file, so `-` and `/dev/stdin` both fail). Use a temp file, or curl.

Quote the whole URL when the text contains spaces — `curl huyab.click/t xin
chao` makes curl treat `xin` and `chao` as extra URLs and fail DNS. To skip
quoting entirely, install the `tc` shell function:

```sh
eval "$(curl -s huyab.click/sh)"   # add to ~/.zshrc to keep it
tc t tinh ninh thuan              # Tinh Ninh Thuan
tc upper đường phố                 # ĐƯỜNG PHỐ
cat notes.txt | tc title           # reads stdin when given no words
tc -h                              # help
```

The function is POSIX `sh` (works under sh/bash/zsh) and uses curl when
present, otherwise wget — buffering stdin into a temp file, since wget cannot
post from a pipe. With neither installed it prints `tc: needs curl or wget`.

Cases: `upper` `lower` `sentence` `capitalized` `title` `alternating`
`inverse` — each with short aliases (`u`, `l`, `s`, `cap`, `t`, `alt`, `inv`).
Add `?json` or `Accept: application/json` for a JSON reply.

Implemented in `workers/cli.ts`, which runs ahead of the React Router handler
in `workers/app.ts` and returns `null` for anything it does not own, so the
site, the `/api` routes and the WebSocket upgrades are unaffected.

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
