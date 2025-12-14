# Socket Event Documentation

This document outlines the socket events used for real-time communication between the client and server.

## Connection

-   `connection` (server-side): A client has connected to the server.
-   `disconnect` (server-side): A client has disconnected.

---

## Room Management

### `join-room`
-   **Direction**: Client -> Server
-   **Payload**: `{ roomId, user }`
-   **Description**: Sent by the client when they want to join a specific room. The server then adds the client's socket to the requested room.

### `user-joined`
-   **Direction**: Server -> Client (broadcast to room)
-   **Payload**: `{ user, socketId }`
-   **Description**: Sent by the server to all clients in a room to notify them that a new user has joined.

#### Data Flow
```mermaid
sequenceDiagram
    participant ClientA as Client A
    participant Server
    participant ClientB as Client B

    ClientA->>Server: emit('join-room', { roomId, user })
    note right of Server: Server adds Client A to room
    Server->>ClientB: emit('user-joined', { user, socketId: clientA_socketId })
    Server->>ClientA: emit('user-joined', { user, socketId: clientA_socketId })
```

---

## Chat

### `send-chat`
-   **Direction**: Client -> Server
-   **Payload**: `{ roomId, username, text }`
-   **Description**: Sent by a client to send a chat message to a room.

### `receive-chat`
-   **Direction**: Server -> Client (broadcast to room)
-   **Payload**: `{ roomId, username, text }`
-   **Description**: Sent by the server to all clients in a room to deliver a chat message.

#### Data Flow
```mermaid
sequenceDiagram
    participant ClientA as Client A
    participant Server
    participant ClientB as Client B

    ClientA->>Server: emit('send-chat', { roomId, username, text })
    note right of Server: Server broadcasts to all in room
    Server->>ClientB: emit('receive-chat', { roomId, username, text })
    Server->>ClientA: emit('receive-chat', { roomId, username, text })
```

---

## Code Collaboration

### `code-change`
-   **Direction**: Client -> Server
-   **Payload**: `{ roomId, code }`
-   **Description**: Sent by a client whenever the content of the code editor changes.

### `code-update`
-   **Direction**: Server -> Client (broadcast to room, excluding sender)
-   **Payload**: `{ code, from }` where `from` is the `socket.id` of the sender.
-   **Description**: Sent by the server to update the code for all other clients in the room.

#### Data Flow
```mermaid
sequenceDiagram
    participant ClientA as Client A (Editor)
    participant Server
    participant ClientB as Client B (Viewer)

    ClientA->>Server: emit('code-change', { roomId, code })
    note right of Server: Server broadcasts to others in room
    Server->>ClientB: emit('code-update', { code, from: socketIdOfA })
```
