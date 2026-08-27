# 💬 QuickChat

A modern **real-time chat application** built with React, TypeScript, Node.js, Socket.IO, PostgreSQL, and Drizzle ORM.

QuickChat supports room-based conversations, live user presence, typing indicators, persistent message history, responsive layouts, automated testing, Docker-based development, and continuous integration.

### 🌐 Live Demo

**[Launch QuickChat](https://quickchat-hbjg.onrender.com)**

[![QuickChat CI](https://github.com/GojoIsHere/QuickChat/actions/workflows/ci.yml/badge.svg)](https://github.com/GojoIsHere/QuickChat/actions/workflows/ci.yml)

---

## ✨ Features

* 💬 Real-time messaging with Socket.IO
* 🚪 Create and join chat rooms
* 🔒 Room-isolated conversations
* 👥 Live online-user tracking
* ✍️ Real-time typing indicators
* 👋 Join and leave notifications
* 🚪 Clean leave-room flow
* 💾 Persistent PostgreSQL message history
* 🕒 Loads recent messages when joining a room
* 📱 Responsive desktop and mobile interface
* 📂 Mobile sidebar drawer
* ⬇️ Automatic scrolling to new messages
* ✅ Username, room, and message validation
* 🚫 Duplicate username protection within rooms
* 🐳 Multi-container Docker setup
* 🗄️ Drizzle ORM database migrations
* 🧪 Automated testing with Vitest and Supertest
* ⚙️ GitHub Actions CI pipeline
* ☁️ Production deployment with Render and Neon

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Socket.IO Client
* CSS

### Backend

* Node.js
* Express
* TypeScript
* Socket.IO

### Database

* PostgreSQL
* Drizzle ORM
* Drizzle Kit
* Neon

### Testing & DevOps

* Vitest
* Supertest
* Docker
* Docker Compose
* Nginx
* GitHub Actions
* Render

---

## 🏗️ Architecture

```text
                    QuickChat

┌───────────────────────────────┐
│         React Client          │
│      TypeScript + Vite        │
│                               │
│         Render Static         │
└──────────────┬────────────────┘
               │
               │ Socket.IO
               ▼
┌───────────────────────────────┐
│        Node.js Server         │
│    Express + Socket.IO        │
│                               │
│      Render Web Service       │
└──────────────┬────────────────┘
               │
               │ Drizzle ORM
               ▼
┌───────────────────────────────┐
│       Neon PostgreSQL         │
│                               │
│  rooms                        │
│  messages                     │
└───────────────────────────────┘
```

Socket.IO manages temporary real-time state such as:

* Connected users
* Socket IDs
* Typing status
* Room membership

PostgreSQL stores durable application data such as:

* Rooms
* Message history

---

## 🗄️ Database Design

### `rooms`

| Column       | Type        | Description             |
| ------------ | ----------- | ----------------------- |
| `id`         | UUID        | Primary key             |
| `slug`       | VARCHAR(50) | Unique room name        |
| `created_at` | TIMESTAMPTZ | Room creation timestamp |

### `messages`

| Column       | Type        | Description                    |
| ------------ | ----------- | ------------------------------ |
| `id`         | UUID        | Primary key                    |
| `room_id`    | UUID        | Foreign key referencing a room |
| `username`   | VARCHAR(32) | Message author                 |
| `content`    | TEXT        | Message content                |
| `created_at` | TIMESTAMPTZ | Message timestamp              |

Relationship:

```text
rooms 1 ─────────────────── * messages
```

Deleting a room also removes its associated messages through a cascading foreign-key relationship.

---

## 🔄 Message Flow

```text
User sends message
        ↓
Socket.IO Server
        ↓
Server validates input
        ↓
Drizzle ORM
        ↓
PostgreSQL INSERT
        ↓
Saved message returned
        ↓
Socket.IO broadcasts to room
        ↓
Connected clients update instantly
```

Messages are persisted **before being broadcast** to connected clients.

---

## 🚪 Room Join Flow

```text
User enters username + room
        ↓
Validate input
        ↓
Find or create database room
        ↓
Check duplicate username
        ↓
Join Socket.IO room
        ↓
Load recent message history
        ↓
Update online users
        ↓
Broadcast join notification
```

---

## 📁 Project Structure

```text
QuickChat/
│
├── client/
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts
│   │   │   ├── queries.ts
│   │   │   └── schema.ts
│   │   │
│   │   ├── app.ts
│   │   ├── index.ts
│   │   └── validation.ts
│   │
│   ├── drizzle/
│   ├── Dockerfile
│   ├── drizzle.config.ts
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
└── docker-compose.yml
```

---

## 🚀 Running Locally

### Requirements

* Node.js 22+
* npm
* Docker

Clone the repository:

```bash
git clone https://github.com/GojoIsHere/QuickChat.git
cd QuickChat
```

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Create a `.env` file inside `server/`:

```env
DATABASE_URL=postgresql://quickchat:quickchat@localhost:5432/quickchat
CLIENT_URL=http://localhost:5173
```

Apply the database migrations:

```bash
cd server
npx drizzle-kit migrate
```

Start the backend:

```bash
npm install
npm run dev
```

In another terminal, start the frontend:

```bash
cd client
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## 🐳 Running with Docker

The complete application can also be started with Docker Compose.

From the project root:

```bash
docker compose up --build
```

This starts:

```text
React + Nginx
Node + Express + Socket.IO
Drizzle migrations
PostgreSQL
```

Open:

```text
http://localhost:8080
```

Stop the stack with:

```bash
docker compose down
```

---

## 🧪 Testing

Run the server test suite:

```bash
cd server
npm test
```

The automated tests cover:

* Username and room validation
* Message validation
* HTTP health endpoint
* PostgreSQL integration
* Drizzle queries
* Room persistence
* Message persistence

---

## ⚙️ Continuous Integration

GitHub Actions automatically validates QuickChat whenever code is pushed to `main` or a pull request targets `main`.

The CI pipeline runs:

```text
PostgreSQL service startup
        ↓
Drizzle migrations
        ↓
Server tests
        ↓
Server TypeScript build
        ↓
Client production build
        ↓
Docker build
        ↓
✅ Ready to ship
```

---

## 🌐 Production Deployment

QuickChat is deployed using:

```text
Frontend  → Render Static Site
Backend   → Render Web Service
Database  → Neon PostgreSQL
```

### Production URLs

**Frontend**

https://quickchat-hbjg.onrender.com

**Backend**

https://quickchat-server-7sgd.onrender.com

### Production Environment Variables

Backend:

```env
DATABASE_URL=<NEON_POSTGRESQL_URL>
CLIENT_URL=https://quickchat-hbjg.onrender.com
```

Frontend:

```env
VITE_SERVER_URL=https://quickchat-server-7sgd.onrender.com
```

Secrets and database credentials are not committed to the repository.

---

## 🎯 What I Learned

Building QuickChat provided hands-on experience with:

* WebSocket-based real-time communication
* Event-driven client/server architecture
* Socket.IO rooms
* User presence tracking
* Typing indicators
* Persistent relational data modeling
* PostgreSQL
* Drizzle ORM and database migrations
* Server-side validation
* Responsive UI design
* Multi-stage Docker builds
* Docker Compose orchestration
* Automated testing
* GitHub Actions CI
* Production environment configuration
* Deploying a full-stack real-time application

---

## 👤 Author

**Sushil Kumar Thanet**

[LinkedIn](https://linkedin.com/in/sushilthanet) · [GitHub](https://github.com/GojoIsHere)

---

## 🔗 Links

* **Live Demo:** https://quickchat-hbjg.onrender.com
* **Source Code:** https://github.com/GojoIsHere/QuickChat
* **Backend Health:** https://quickchat-server-7sgd.onrender.com/health
