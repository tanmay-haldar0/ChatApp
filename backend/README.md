# ChatApp Backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
3. Start the server:
   ```bash
   node server.js
   ```

## REST API
- `POST /auth/register` — Register new user
- `POST /auth/login` — Login, returns JWT
- `GET /users` — List all users
- `GET /conversations/:id/messages` — Get messages for a conversation

## Socket.IO Events
- `message:send` — Send new message
- `message:new` — Receive new message
- `typing:start|stop` — Typing indicator
- `message:read` — Mark message as read
- `user:online` — Mark user online
- `user:status` — Online/offline status

## Sample Users
You can register users via the API. Example:
```json
{
  "username": "alice",
  "password": "password123"
}
```

## Demo
Record a short video (≤5 min) showing:
- Register/login
- User list
- Real-time chat
- Typing indicator
- Online/offline status
- Message delivery/read receipts
