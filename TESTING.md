# ToolHub Testing Guide

Since the project uses no test runner, this guide provides **manual testing procedures** for all features and a Vitest configuration for future test automation.

## Quick Start

```bash
# Build & verify no TypeScript errors
pnpm typecheck

# Production build
pnpm build

# Start dev server for manual testing
pnpm dev

# Preview production build
pnpm preview
```

---

## 📋 Manual Testing Checklist

### 1. **Core Navigation & Layouts**

- [ ] Home page loads without errors
- [ ] Navbar displays correctly (desktop + mobile)
- [ ] Footer displays correctly
- [ ] Dark mode toggle works
- [ ] Language switcher (EN/VI) works and persists
- [ ] All main routes accessible: IT, Lifestyle, Games, Calendar, About
- [ ] Mobile responsiveness (test at 375px, 768px, 1024px)

**Test Steps:**
```
1. Navigate to http://localhost:5173
2. Click navbar items: verify routing works
3. Toggle theme icon → verify dark mode applies globally
4. Click language selector → verify UI updates
5. Open DevTools → resize to mobile → verify layout responsive
```

---

### 2. **IT Tools - JSON Tools**

**Paths:** `/json-tools`

#### JSON Parsing & Validation
- [ ] Valid JSON parses correctly
- [ ] Invalid JSON shows error message
- [ ] Auto-fix feature fixes common issues (trailing commas, unquoted keys)
- [ ] Format button indents JSON properly
- [ ] Minify removes whitespace/newlines
- [ ] History saves last 10 entries
- [ ] Copy to clipboard works
- [ ] File upload reads JSON correctly

**Test Data:**
```json
// Valid
{"name": "test", "age": 25}

// Invalid (test auto-fix)
{name: 'test', age: 25,}

// Large JSON (test performance)
{"items": [{"id": 1}, {"id": 2},...]}
```

**Test Steps:**
```
1. Paste valid JSON → verify parsed & formatted
2. Paste invalid JSON → click auto-fix → verify corrected
3. Toggle minify → verify output compressed
4. Open history → verify last entries shown
5. Copy button → paste elsewhere → verify content
```

---

### 3. **IT Tools - Text Diff**

**Path:** `/text-diff`

- [ ] Loads two text areas
- [ ] Correctly identifies added/removed lines
- [ ] Highlight colors clear (green for add, red for remove)
- [ ] Works with large texts (1000+ lines)
- [ ] Copy diff output works
- [ ] Special characters handled correctly

**Test Data:**
```
Text A:
Hello
World
Foo

Text B:
Hello
World
Bar
```

Expected: "Foo" marked as removed, "Bar" marked as added.

---

### 4. **IT Tools - Markdown Preview**

**Path:** `/markdown`

- [ ] Live preview updates as you type
- [ ] Headers render correctly
- [ ] Links are clickable
- [ ] Code blocks syntax highlight
- [ ] Tables render correctly
- [ ] Images display
- [ ] Export to HTML works

**Test Markdown:**
```markdown
# Heading 1
## Heading 2

[Link](https://example.com)

```javascript
const x = 5;
```

| Column 1 | Column 2 |
|----------|----------|
| A        | B        |
```

---

### 5. **IT Tools - Image Tools**

**Path:** `/image-tools`

- [ ] File upload accepts images (JPG, PNG, WebP, GIF)
- [ ] Resize (width/height) works
- [ ] Compression reduces file size
- [ ] Format conversion (JPG ↔ PNG ↔ WebP) works
- [ ] Download button saves file
- [ ] Mobile: image preview responsive

**Test Files:**
- Small PNG (< 100KB)
- Large JPG (> 2MB)
- Animated GIF

---

### 6. **IT Tools - API Tester**

**Path:** `/api-tester`

- [ ] GET/POST/PUT/DELETE/PATCH methods work
- [ ] Headers input works
- [ ] JSON body input works
- [ ] Request/response timing displays
- [ ] Response body displays correctly
- [ ] CORS errors handled gracefully
- [ ] Pagination/params work

**Test Requests:**
```
GET https://jsonplaceholder.typicode.com/posts/1
POST https://jsonplaceholder.typicode.com/posts with JSON body
```

---

### 7. **IT Tools - Number Reading**

**Path:** `/number-reading`

- [ ] Single digits convert (1 → "One")
- [ ] Multi-digit numbers convert (123 → "One Hundred Twenty Three")
- [ ] Decimals handled (3.14 → "Three point one four")
- [ ] Large numbers work (1000000+)
- [ ] Both EN & VI languages work

**Test Cases:**
- 0, 1, 10, 100, 1000, 1000000
- 3.14, 99.99
- Negative numbers: -5, -100

---

### 8. **IT Tools - Odoo Inspector**

**Path:** `/odoo-inspector`

- [ ] URL input validates Odoo server
- [ ] Extracts model data correctly
- [ ] Displays field types
- [ ] Error handling for invalid URLs

---

### 9. **IT Tools - Notes**

**Path:** `/notes`

- [ ] Create note works
- [ ] Note saves to localStorage
- [ ] Update note works
- [ ] Delete note works (with confirmation)
- [ ] List displays all notes
- [ ] Search/filter notes works
- [ ] Persists after page reload
- [ ] Rich text editor functions (bold, italic, link, etc.)

**Test Steps:**
```
1. Create: Title "Test" + Content "Hello" → Click Save
2. Verify in list
3. Click edit → modify content → save
4. Reload page → verify note still exists
5. Search for "Test" → verify appears
6. Delete → confirm → verify removed
```

---

### 10. **Lifestyle - Pomodoro Timer**

**Path:** `/pomodoro`

- [ ] Work session defaults to 25 mins
- [ ] Break sessions work (5 min short, 15 min long)
- [ ] Start/Pause/Reset buttons work
- [ ] Timer counts down correctly
- [ ] Audio notification plays when done
- [ ] Cycle counter increments
- [ ] Settings (customize work/break duration) work
- [ ] Mobile: layout responsive

**Test Steps:**
```
1. Start with 1 min work → verify countdown
2. Pause at 30s → verify paused
3. Resume → verify continues
4. Complete session → verify sound plays
5. Settings: change to 2 min work → verify
```

---

### 11. **Lifestyle - Random Quotes**

**Path:** `/quotes`

- [ ] Quote loads on page open
- [ ] Next button fetches new quote
- [ ] Copy quote works
- [ ] Share quote works (social links)
- [ ] Author displayed

---

### 12. **Games - 2048**

**Path:** `/games/2048`

- [ ] Grid renders (4x4 cells)
- [ ] Tiles spawn (2 or 4)
- [ ] Arrow keys move tiles correctly
- [ ] Merging works (2+2=4)
- [ ] Score calculates correctly
- [ ] Win at 2048 detected
- [ ] Game over when no moves detected
- [ ] Swipe controls work on mobile

**Test Moves:**
```
Start: 2 left, 2 left, 2 up, 2 up
Verify tiles merge and score increases
```

---

### 13. **Games - Snake**

**Path:** `/games/snake`

- [ ] Snake spawns at center
- [ ] Arrow keys control direction
- [ ] Food spawns randomly
- [ ] Eating food grows snake
- [ ] Collision with walls ends game
- [ ] Collision with self ends game
- [ ] Score increments per food
- [ ] Speed increases with score
- [ ] Restart works

**Test Gameplay:**
```
1. Start game → move with arrow keys
2. Eat food 5 times → verify size increases
3. Hit wall → verify game over
4. Restart → verify reset
```

---

### 14. **Games - Minesweeper**

**Path:** `/games/minesweeper`

- [ ] Grid renders (8x8 or customizable)
- [ ] Left-click reveals cells
- [ ] Right-click flags cells
- [ ] Numbers show adjacent mines
- [ ] Clicking mine ends game
- [ ] Win when all non-mines revealed
- [ ] Restart works
- [ ] Difficulty settings change mine count

**Test Gameplay:**
```
1. Click safe cell → verify it opens
2. Open cells → numbers appear → click adjacent cells
3. Right-click → place flag
4. Click mine → game over screen
```

---

### 15. **Games - Tetris**

**Path:** `/games/tetris`

- [ ] Tetrominoes spawn correctly
- [ ] Rotation works (arrow up)
- [ ] Horizontal movement works (arrow left/right)
- [ ] Auto-fall works
- [ ] Line clearing works (4 cells filled = 1 clear)
- [ ] Score increments
- [ ] Level increases with score
- [ ] Game over when stack reaches top

**Test Gameplay:**
```
1. Start → pieces fall
2. Arrange pieces to fill row → row clears
3. Rotate piece → verify rotation
4. Play until game over → verify end screen
```

---

### 16. **Games - Sudoku**

**Path:** `/games/sudoku`

- [ ] Puzzle generates (valid 9x9 grid)
- [ ] Can't edit filled cells
- [ ] Validation prevents duplicate numbers (same row/col/box)
- [ ] Hint button shows one valid number
- [ ] Check solution verifies completion
- [ ] Clear button resets entered numbers
- [ ] Difficulty affects clue count
- [ ] Timer (optional)

**Test Gameplay:**
```
1. Fill a valid row → verify
2. Try to enter duplicate in row → blocked
3. Click hint → cell fills with valid number
4. Complete puzzle → check solution → verify win
```

---

### 17. **Games - Loto (Multiplayer)**

**Path:** `/games/loto`

Requires WebSocket connection via Cloudflare Worker.

- [ ] Create room generates unique room ID
- [ ] Join room with room ID works
- [ ] WebSocket connects successfully
- [ ] Random number called updates all players
- [ ] Mark card works (click cells)
- [ ] Bingo detected when pattern complete
- [ ] Broadcast updates other players
- [ ] Disconnect handled gracefully

**Test with 2 Browsers:**
```
Browser 1: Create room → shows ID
Browser 2: Join with ID → both connected
Browser 1: Call number → appears in both
Browser 2: Mark card → marks appear
Either: Complete pattern → Bingo! shows
```

---

### 18. **Calendar**

**Path:** `/calendar`

- [ ] Current month displays
- [ ] Previous/Next month navigation works
- [ ] Solar dates correct
- [ ] Lunar dates correct (Vietnamese calendar)
- [ ] Holidays marked
- [ ] Click date shows details
- [ ] Week/month view toggle works (if available)
- [ ] Mobile: calendar responsive

**Verify Dates:**
- Current month matches system
- Lunar equivalent correct
- Holidays accurate (Tet, Christmas, etc.)

---

### 19. **About Page**

**Path:** `/about`

- [ ] Page loads
- [ ] Content displays correctly
- [ ] Links work
- [ ] Responsive design

---

### 20. **Internationalization (i18n)**

**All Pages:**

- [ ] Toggle EN/VI switches all text
- [ ] Setting persists across page reloads
- [ ] All UI elements translated
- [ ] No untranslated strings visible
- [ ] Numbers formatted per locale (if applicable)

**Verify Translations:**
- Button labels
- Menu items
- Error messages
- Toast notifications

---

### 21. **Dark Mode**

**All Pages:**

- [ ] Theme toggle switches light ↔ dark
- [ ] Colors meet contrast requirements
- [ ] Images visible in both themes
- [ ] Setting persists
- [ ] No hardcoded colors (only Tailwind classes)

**Check Elements:**
- Backgrounds: `bg-white dark:bg-gray-950`
- Text: `text-gray-900 dark:text-gray-100`
- Borders: `border-gray-200 dark:border-gray-800`

---

### 22. **Performance & Browser**

- [ ] Production build < 500KB
- [ ] Page load < 3 seconds (fast 3G)
- [ ] FCP (First Contentful Paint) < 2s
- [ ] No console errors
- [ ] No memory leaks (DevTools Memory tab)
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Offline mode works (PWA)

**Test Steps:**
```
1. DevTools → Network → Slow 3G → reload
2. DevTools → Performance → record → take metrics
3. DevTools → Application → offline → verify still works
4. Test in multiple browsers
```

---

### 23. **API Endpoints (Backend)**

**Notes API:**
- [ ] `GET /api/notes` returns all notes
- [ ] `POST /api/notes` creates new note
- [ ] `PUT /api/notes/:id` updates note
- [ ] `DELETE /api/notes/:id` deletes note

**Test with cURL:**
```bash
# Create
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Hello"}'

# Read
curl http://localhost:3000/api/notes

# Update
curl -X PUT http://localhost:3000/api/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated"}'

# Delete
curl -X DELETE http://localhost:3000/api/notes/1
```

**Loto WebSocket:**
- [ ] `WS /api/loto/room/:id/ws` connects
- [ ] Messages broadcast to all clients
- [ ] Room persists in Cloudflare KV
- [ ] Reconnection works

---

### 24. **Local Storage**

- [ ] Notes saved persist
- [ ] JSON history persists
- [ ] Game scores persist
- [ ] Settings persist
- [ ] Clear storage clears all user data

**Test:**
```
1. Create note → Open DevTools → Application → LocalStorage
2. Verify 'notes' key exists
3. Modify/delete → reload → verify changes persist
```

---

### 25. **Error Handling**

- [ ] Network error shows toast notification
- [ ] Invalid input shows validation message
- [ ] File upload errors handled
- [ ] API errors with status codes shown
- [ ] 404 page for unknown routes
- [ ] Graceful fallback for failed features

---

## 🧪 Automated Testing Setup (Future)

A Vitest configuration is provided for future test automation. To get started:

```bash
# Install test dependencies
pnpm add -D vitest @testing-library/react @testing-library/jest-dom happy-dom

# Run tests
pnpm test
```

See `vitest.config.ts` and `__tests__/` directory for test examples.

---

## 📊 Test Coverage Matrix

| Feature | Manual | Automated | Notes |
|---------|--------|-----------|-------|
| Navigation | ✅ | — | Routes tested manually |
| JSON Tools | ✅ | — | Core logic can be extracted for unit tests |
| Text Diff | ✅ | — | Diff algorithm testable |
| Markdown | ✅ | — | React Markdown library tested |
| Image Tools | ✅ | — | File handling tested manually |
| Games Logic | ✅ | — | Game loops tested via gameplay |
| API Endpoints | ✅ | — | cURL/Postman testing |
| Localization | ✅ | — | UI verification |
| Dark Mode | ✅ | — | CSS class verification |
| Storage | ✅ | — | DevTools inspection |

---

## 🔍 Debugging Tips

### DevTools
```
- Console: Watch for errors
- Network: Verify API calls
- Storage: Check localStorage/sessionStorage
- Performance: Profile slow operations
- Lighthouse: Audit performance & accessibility
```

### Common Issues
- **Blank page:** Check console for errors
- **Styles not applying:** Verify Tailwind classes in element
- **API failures:** Check CORS, headers, request payload
- **Game lag:** Profile with DevTools Performance tab
- **WebSocket issues:** Check browser DevTools Network tab → WS

---

## 📝 Test Reports

After manual testing, document findings:

```markdown
## Test Report - [Date]

### Environment
- OS: macOS/Windows/Linux
- Browser: Chrome v120
- Network: Wi-Fi, 4G, Offline

### Results
- [✅] All navigation tests passed
- [✅] JSON tools functional
- [⚠️] Loto multiplayer: WebSocket timeout at 2min idle
- [❌] Safari: Dark mode toggle not persisting

### Action Items
- [ ] Fix WebSocket ping/pong
- [ ] Fix Safari localStorage access
```

---

## 🚀 Pre-Release Checklist

- [ ] All manual tests passed
- [ ] TypeScript: `pnpm typecheck` ✅
- [ ] Build: `pnpm build` ✅
- [ ] No console errors in production
- [ ] Lighthouse score > 90
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Mobile tested (375px, 768px widths)
- [ ] Accessibility: WCAG 2.1 AA
- [ ] Performance: FCP < 2s
- [ ] Security: No exposed secrets, CSP headers set

---

**Last Updated:** 2024
**Maintained by:** ToolHub Team
