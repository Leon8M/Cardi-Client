# Cardi! - Next.js Frontend

This is the Next.js frontend for the Cardi! multiplayer card game. It is built with Next.js, Tailwind CSS, and shadcn/ui.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm, yarn, or pnpm
- A running instance of the [Cardi! backend server](https://github.com/your-repo/cardi-backend).

### Installation

1.  Clone the repository.
2.  Navigate to the `cardi-client` directory.
3.  Install the dependencies:

```bash
npm install
```

### Running the Development Server

First, ensure the backend Java Spring Boot application is running (typically on `http://localhost:8080`).

Then, run the frontend development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Play

1.  Open the application in your browser.
2.  Enter a username in the lobby.
3.  **Create a Room**: Click "Create New Room". You will be automatically taken to the game room.
4.  **Join a Room**: Enter the Room Code provided by another player and click "Join Room".
5.  Once all players have joined, the room creator can click "Start Game".
6.  Play cards from your hand that match the suit or value of the top card on the discard pile.
7.  If you cannot play a card, you must draw one from the deck.
8.  Use special cards (like Ace, King, Queen, Jack, etc.) to change the game flow.
9.  The first player to get rid of all their cards wins!

## Backend Connection

The frontend connects to the backend WebSocket server at `http://localhost:8080/ws`. If your backend is running on a different address, you can change the `WS_URL` constant in `cardi-client/lib/ws-client.ts`.
