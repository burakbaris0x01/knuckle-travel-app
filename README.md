# Knuckle Travel App

Knuckle Travel is a travel planning web app built with Node.js, Express, Pug, MongoDB, Mongoose, and Socket.IO. Users can register, log in, suggest trips, browse active trip ideas, view destinations on a map, and join real-time chat rooms.

## Features

- User registration and login
- Password hashing with bcrypt
- JWT access and refresh token authentication
- MongoDB storage with Mongoose models
- Country, region, and city selection
- Trip suggestion with date selection
- Active trips list
- Join and leave trip suggestions
- Query trip participants
- Query trips by interested user
- Destination map view
- Weather forecast route
- Real-time chat rooms with Socket.IO

## Tech Stack

- Node.js
- Express
- Pug
- MongoDB
- Mongoose
- Socket.IO
- bcrypt
- jsonwebtoken

## Getting Started

Install dependencies:

```bash
npm install
```

Start the app with nodemon:

```bash
nodemon server.js
```

Open the app:

```text
http://localhost:5050
```

## Project Structure

- `controllers/` handles request logic
- `routes/` defines Express routes
- `middleware/` contains authentication and API middleware
- `model/` contains Mongoose models
- `views/` contains Pug templates
- `public/` contains client-side JavaScript, CSS, and images
- `utils/` contains helper functions

## Database

The original app uses MongoDB for persistence.

Collections:

- `users`
- `travels`

The user model stores usernames, hashed passwords, and refresh tokens. The travel model stores suggested trip locations, dates, and interested users.

## Author

Burak Baris
