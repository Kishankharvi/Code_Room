# CodeCollab - Real-Time Collaborative Coding Environment

## 1. Project Overview

CodeCollab is a real-time, web-based collaborative coding environment designed for technical interviews, teaching, and pair programming. It provides a shared workspace where multiple users can write code, chat, and see each other's cursors simultaneously. The application is built with a modern tech stack, featuring a React frontend and a Node.js/Express backend, with Socket.IO powering the real-time communication.

---

## 2. Features Implemented

- **User Authentication**: Secure user registration and login system.
- **Dashboard**: Central hub for users to create new coding rooms or join existing ones using a unique Room ID.
- **Collaborative Code Editor**: A feature-rich Monaco Editor where code updates in real-time for all participants.
- **Role-Based Permissions**: 
    - **Interview Mode**: All participants have equal editing rights.
    - **Teaching Mode**: Only the room creator (mentor) can edit the code, while others (participants) can only view.
- **Real-Time Chat**: A chat box for instant communication within the room.
- **Live Cursors**: See the cursors of other participants in the editor, showing what they are looking at or editing.
- **Live Participant List**: A presence bar displays a list of all users currently in the room, along with their assigned role (mentor or participant).
- **File Explorer**: A simple file tree for navigating project files within the room (currently static).
- **Integrated Terminal**: An instance of XTerm.js is available for command-line operations (currently a simple echo terminal).
- **Shareable Room ID**: Easily copy and share the unique Room ID to invite others.

---

## 3. Project Structure

The project is a monorepo containing two main packages: `frontend` and `backend`.

```
/
├── backend/
│   ├── node_modules/
│   ├── src/
│   │   ├── models/         # Mongoose schemas (User, Room)
│   │   ├── routes/         # Express API routes (auth, rooms)
│   │   ├── index.js        # Server entry point (Express + Socket.IO setup)
│   │   └── socketHandlers.js # Logic for all Socket.IO events
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/     # Reusable React components (ChatBox, Cursor, etc.)
    │   ├── context/        # React Context for state management (User, Room)
    │   ├── pages/          # Top-level page components (HomePage, RoomPage, etc.)
    │   ├── services/       # API and Socket.IO connection setup
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## 4. Data and Control Flow

The application follows a classic client-server architecture, enhanced with WebSockets for real-time functionality.

1.  **Initial Load**: The user loads the React application. An HTTP connection is made to the backend to handle authentication and fetch initial data (e.g., list of available rooms).
2.  **Joining a Room**: When a user creates or joins a room, the client establishes a persistent WebSocket connection to the backend server using Socket.IO.
3.  **Real-Time Events**: Once connected, the client and server communicate primarily through Socket.IO events. For example:
    - When a user types in the editor, the frontend emits a `code-change` event to the server.
    - The server receives this event and broadcasts a `code-update` event to all other clients in the same room.
    - The other clients receive the `code-update` event and update their local editor state, resulting in a seamless real-time experience.
4.  **State Management**: The frontend uses React Context to manage global state, such as the current user, room details, and the shared code.

---

## 5. Socket.IO Events

The following events are used for real-time communication.

### Room Management

-   **`join-room`**
    -   **Direction**: Client -> Server
    -   **Payload**: `{ roomId, user }`
    -   **Description**: Sent by the client to join a specific room. The server adds the socket to the room, determines the user's role (mentor or participant), and triggers a participant update.

-   **`update-participants`**
    -   **Direction**: Server -> Client (broadcast to room)
    -   **Payload**: `[ { _id, username, role }, ... ]`
    -   **Description**: Sent by the server whenever a user joins or leaves a room. It provides a complete, updated list of all participants currently in the room.

### Chat

-   **`send-chat`**
    -   **Direction**: Client -> Server
    -   **Payload**: `{ roomId, username, text }`
    -   **Description**: Sent when a user sends a message in the chat box.

-   **`receive-chat`**
    -   **Direction**: Server -> Client (broadcast to room)
    -   **Payload**: `{ roomId, username, text }`
    -   **Description**: Sent by the server to deliver a chat message to all clients in the room.

### Code Collaboration

-   **`code-change`**
    -   **Direction**: Client -> Server
    -   **Payload**: `{ roomId, code }`
    -   **Description**: Sent whenever a client changes the content of the code editor. The server validates if the user has permission to edit based on the room's mode.

-   **`code-update`**
    -   **Direction**: Server -> Client (broadcast to room, excluding sender)
    -   **Payload**: `{ code }`
    -   **Description**: Sent by the server to update the code for all other clients in the room.

### Cursor Tracking

-   **`cursor:move`** (Client to Server)
    -   **Direction**: Client -> Server
    -   **Payload**: `{ roomId, position }`
    -   **Description**: Sent when a client's cursor moves within the editor.

-   **`cursor:move`** (Server to Client)
    -   **Direction**: Server -> Client (broadcast to room, excluding sender)
    -   **Payload**: `{ userId, username, position }`
    -   **Description**: Broadcast by the server to show other users the position of a participant's cursor.
