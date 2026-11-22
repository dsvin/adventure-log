# Adventure Log

A Breath of the Wild-inspired life quest tracker for the desktop. Turn your real-life goals into quests, track your daily streak, and log your progress — all in a dark, atmospheric UI.

![Adventure Log](public/icon.png)

## Features

- **Three quest types** — Main (grand life objectives), Shrine (self-mastery habits), Side (optional pursuits)
- **Daily streak tracking** — keep your fire burning with a streak counter and habit ring
- **Objectives & sub-tasks** — break each quest into checkable steps
- **Three themes** — Amber, Cyan, and Ember that animate on switch
- **Persistent data** — everything saves locally, survives restarts
- **Cinematic splash screen** — harp sound and sword animation on launch
- **Desktop app** — runs natively on Windows and macOS via Tauri

## Download

Go to the [**Releases**](https://github.com/dsvin/adventure-log/releases) page and grab the latest installer for your platform:

| Platform | File |
|----------|------|
| Windows | `adventure-log_x.x.x_x64-setup.exe` |
| macOS (Intel) | `adventure-log_x.x.x_x64.dmg` |

## Building from source

**Prerequisites:** [Node.js 20+](https://nodejs.org), [Rust](https://rustup.rs)

```bash
git clone https://github.com/dsvin/adventure-log.git
cd adventure-log
npm install
npm run tauri dev     # development
npm run tauri build   # production installer
```

## Tech stack

- [Tauri 2](https://tauri.app) — native desktop shell (Rust + WebView2)
- [React 18](https://react.dev) + [TypeScript](https://typescriptlang.org)
- [Vite 7](https://vitejs.dev)
- localStorage persistence
- Web Audio API for sound effects

## License

MIT
