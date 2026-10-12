# G-Queue
https://rexatgithub.github.io/g-queueing/

G-Queue is a local-first pickup basketball queue manager. It helps an organizer manage a game session, see who is playing next, and keep the waiting line moving. Session data is stored in the browser; no account or backend is required.

## Features

- Configure a session, court, players per game, and game duration.
- Track current players, Up Next, and Waiting from one ordered player roster.
- Add, rename, remove, promote, or move players to the end of the queue.
- Start, pause, resume, and advance games, with undo for the most recent advance.
- Persist the active session in browser local storage.

Game duration is entered as hours, minutes, and seconds. The session model stores duration values in seconds.

## Requirements

- Node.js 18 or later
- npm

## Getting Started

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

Create and preview a production build:

```sh
npm run build
npm run preview
```

## Project Structure

```text
src/
  app/                 Session setup and active-session UI
  features/queue/      Queue types, rules, reducer, and selectors
  hooks/               Session persistence and active queue hooks
  storage/             Browser storage adapter and storage contract
```

The queue rules are kept separate from the React UI. Layout and responsive styles use Tailwind CSS utilities; `src/styles.css` loads Tailwind.
