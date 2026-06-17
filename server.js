const express = require('express');
const app = express()
const cors = require('cors')
const path = require('path')
const http = require('http')
const cookieParser = require('cookie-parser')
const port = process.env.PORT || 5050;
const socketio = require('socket.io')
const formatMessage = require('./utils/messageFormat')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

const botName = "KnuckleTravel Bot"

// app.use(cors(require('./config/cors'))) //cross origin resource sharing

// CREATE EXPRESS APP.
const server = http.createServer(app)
const io = socketio(server)

// CREATE SOCKET CONNECTIONS TO PROVIDE CHAT FUNCTIONALITY.
io.on('connection', socket => {

  // START AN EVENT LISTENER TO RECEIVE USERNAME-ROOM INFORMATION 
  // FROM A CLIENT SOCKET TO JOIN A SPECIFIC ROOM.
  socket.on('joinRoom', ({username, room})=>{

    // JOIN USER TO THE PREFERRED ROOM.
    const user = userJoin(socket.id, username, room)
    socket.join(user.room)

    // SEND WELCOME MESSAGE TO THE SOCKET.
    socket.emit('message',formatMessage(botName,'Welcome to the chat!'))

    // BROADCAST THAT A NEW USER IS JOINED TO THE CHAT.
    socket.broadcast
      .to(user.room)
      .emit('message', formatMessage(botName,`${username} has joined to the chat!`))

    // UPDATE THE USERNAME LIST FOR THAT ROOM.
    io.to(user.room).emit('roomUsers',{
      room: user.room,
      users:getRoomUsers(user.room)
    })
  })

    // BROADCAST THE NEW CHAT MESSAGE TO ALL THE USERS WITHIN THAT ROOM.
    socket.on('chatMessage',(msg)=>{
      const user = getCurrentUser(socket.id)
      if (user) {
        io.to(user.room).emit('message', formatMessage(user.username, msg))
      }
    })

    // DISCONNECT.
    socket.on('disconnect',()=>{
      const user = userLeave(socket.id)
      if(user){
        // BROADCAST THAT A NEW USER IS LEFT THE CHAT.
        io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat.`))
      }
    // UPDATE THE USERNAME LIST FOR THAT ROOM.
    if(user){
      io.to(user.room).emit('roomUsers',{
        room: user.room,
        users:getRoomUsers(user.room)
      })
    }
    })
})

// SET THE MIDDLEWARE AND THE OTHER OPTIONS FOR THE EXPRESS WEB APPLICATION.
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '/public')))
app.set('view engine', 'pug')

// DECLARE THE ENDPOINT ROUTES FOR THE EXPRESS WEB APPLICATION.
app.use('/', require('./routes/root'))
app.use('/login', require('./routes/api/login'))
app.use('/register', require('./routes/api/register'))
app.use('/logout', require('./routes/api/logout'))
app.use('/active-trips', require('./routes/api/active-trips'))
app.use('/tripsData', require('./routes/api/tripsData'))
app.use('/services/join-trip', require('./routes/api/joinTrip'))
app.use('/services/leave-trip', require('./routes/api/leaveTrip'))
app.use('/suggest-trip', require('./routes/api/suggestTrip'))
app.use('/weatherForecast', require('./routes/api/weatherForecast'))
app.use('/chat', require('./routes/api/chat'))
app.use('/lobby', require('./routes/api/lobby'))
app.use('/contacts', require('./routes/api/contacts'))

app.use((err, req, resp, next) => {
    console.error(err)
    resp.status(500).render(path.join(__dirname,'views','error'),{
        title:"Something went wrong"
    })
})

// DEFAULT 404 ROUTE FOR UNKNOWN ENDPOINTS.
app.all('*',(req,resp)=>{
    resp.status(404).render(path.join(__dirname,'views','error'),{
        title:"404 Not Found"
    })
})

// START LISTENING ON PORT.
server.listen(port, ()=>{console.log(`Listening on port: ${port}`)});

