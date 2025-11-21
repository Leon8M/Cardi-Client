# Backend TODOs for Cardi!

This document lists suggested improvements and necessary changes for the backend to fully support the new frontend and enhance the game's features.

## 1. Implement User Authentication

The current system uses a simple username to identify players, which is great for a prototype but not secure for a public application.

**Suggestion:** Implement a proper authentication system with JWT.

### Required Endpoints:

-   **`POST /auth/register`**
    -   Request Body: `{ "username": "string", "password": "string" }`
    -   Response: `{ "token": "jwt_token_string" }` or an error message.

-   **`POST /auth/login`**
    -   Request Body: `{ "username": "string", "password": "string" }`
    -   Response: `{ "token": "jwt_token_string" }` or an error message.

### WebSocket Security:

-   The WebSocket connection should be authenticated using the JWT token. The token can be passed in the STOMP headers during connection.
-   The backend's `SecurityConfig` and `WebSocketConfig` will need to be updated to handle JWT validation.

## 2. Enhance GameState Object

The `GameState` object is the primary source of truth for the frontend. Adding a few fields would improve the user experience and simplify the client-side logic.

**Suggestion:** Add the following fields to `GameState.java`:

-   `String roomOwnerId`: The ID of the player who created the room. This will allow the frontend to reliably show the "Start Game" button only to the owner, instead of guessing based on player order.
-   `String winnerUsername`: When a game ends, this field can be explicitly set to the winner's name for a clear win-state message.

## 3. Graceful Disconnects and Reconnecting

Currently, if a player disconnects, they are removed from the room. For a better user experience, the backend could handle temporary disconnects more gracefully.

**Suggestion:**

-   When a player's WebSocket session is disconnected, mark the player as "disconnected" but do not remove them from the room immediately.
-   Allow a short period (e.g., 30 seconds) for the player to reconnect with the same session or user ID.
-   If the player does not reconnect within the time limit, then remove them from the room and advance the turn.
-   Broadcast the player's disconnected status to other players in the `GameState`.
