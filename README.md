# Knuckle Travel App

Knuckle Travel is a travel planning web app built with Node.js, Express, Pug, and Socket.IO. Users can create an account, log in, suggest trips, browse active trip ideas, view destinations on a map, and join real-time chat rooms.

## Features

- User registration and login
- Password hashing with bcrypt
- JWT-based authentication with cookies
- Local JSON file storage
- Country, region, and city selection
- Trip suggestion with date selection
- Active trips list
- Join and leave trip suggestions
- Destination map view
- Weather forecast route
- Real-time chat rooms with Socket.IO

## Tech Stack

- Node.js
- Express
- Pug
- Socket.IO
- bcrypt
- jsonwebtoken
- Local JSON storage

## Getting Started

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm start
```

For development:

```bash
npm run dev
```

Open the app:

```text
http://localhost:5050
```

## Data Files

The app stores local data in JSON files:

- `data/users.json`
- `data/travels.json`
- `public/data/locations.json`

User passwords are stored as bcrypt hashes.

## Author

Burak Baris
