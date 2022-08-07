const express = require("express")
const app = express()
const http = require('http')
const {Server} = require('socket.io')
const cors = require('cors')
const { Socket } = require("dgram")
const { join } = require("path")

app.use(cors())

// let guessList = []
let rooms = [
  {
    RoomId: 'testRoomId',
    playerList: [{
      room: 'testRoomId',
      playerName: 'TestPlayer',
      playerIcon: ['- -', ' O ', 'red'],
      playerPoints: 0,
      isHost: false
    }]
  }
  ]
// },
// {
//   RoomId: 'testRoomIdTwo',
//   playerList: [{
//     room: 'testRoomIdTwo',
//     playerName: 'TestPlayerTwo',
//     playerIcon: ['- -', ' O ', 'red'],
//     playerPoints: 0,
//     isHost: false
//   }]
// },
// {
//   RoomId: 'testRoomIdThree',
//   playerList: [{
//     room: 'testRoomIdThree',
//     playerName: 'TestPlayerThree',
//     playerIcon: ['- -', ' O ', 'red'],
//     playerPoints: 0,
//     isHost: false
//   }]
// }
const getCurrentRoom = (playerInfo, allRooms) => {
  let roomId = playerInfo.room
  let playersRoom = allRooms.find(x=>x.RoomId == roomId) || false
  return playersRoom
}
const checkIfRoomIsAvailable = (roomId, allRooms) => {
  let playersRoom = allRooms.find(x=>x.RoomId == roomId) == undefined ? true : false
  return playersRoom
}
const createRoom = (roomId, playerInfo, allRooms) =>{
  let newRoom = {
    RoomId: roomId,
    playerList: [playerInfo]
  }
  return allRooms.push(newRoom)
}
const deleteRoom = (playerInfo, allRooms) => {
  let roomId = playerInfo.room
  let room = getCurrentRoom(playerInfo, allRooms)
  if(!room) return console.log(`Cannot delete room does not exist - Roomid: ${roomId}`)
  let upDatedRooms = allRooms.filter(room=>room.RoomId !== roomId)
  return rooms = upDatedRooms
}
const addPlayerToARoom = (playerInfo, allRooms) => {
  let roomId = playerInfo.room
  let room = getCurrentRoom(playerInfo, allRooms)
  if(!room) return console.log(`Cannot addPlayer room does not exist - Roomid: ${roomId}`)
  return room['playerList'].push(playerInfo)
  // console.log(rooms)
}
const removePlayerFromRoom = (playerInfo, allRooms) => {
  // console.log(rooms, 'removedPlayer')
  let roomId = playerInfo.room
  let room = getCurrentRoom(playerInfo, allRooms)
  if(!room) return console.log(`Cannot removePlayer room does not exist - Roomid: ${roomId}`)
  room['playerList'] = room['playerList'].filter(room=>room.playerName !== playerInfo.playerName)
  if(!room['playerList'].length) return deleteRoom(playerInfo, rooms)
}
// addPlayerToARoom({
//   room: 'testRoomIdTwo',
//   playerName: "jambo",
//   playerIcon: ['- -', ' O ', 'red'],
//   playerPoints: 0,
//   isHost: true
// }, rooms)
// removePlayerFromRoom({
//   room: 'testRoomIdTwo',
//   playerName: "TestPlayerTwo",
//   playerIcon: ['- -', ' O ', 'red'],
//   playerPoints: 0,
//   isHost: false
// }, rooms)


const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ["GET", "POST"]
  }
})

io.on('connection', (socket)=>{

  socket.on('checkIfRoomIsAvailable', (roomId, isAvailable)=>{
    let isRoomAvailable = checkIfRoomIsAvailable(roomId, rooms)
    isAvailable(isRoomAvailable)
  })

  socket.on('joinRoom', (playerInfo)=>{
    console.log(playerInfo)
    let room = playerInfo.room
    if(playerInfo.isHost){
      socket.join(room)
      createRoom(room, playerInfo, rooms)
    }else{
      socket.join(room)
      let roomInfo = getCurrentRoom(playerInfo, rooms)
      addPlayerToARoom(playerInfo, rooms)
      io.to(room).emit('upDatePlayerList', playerInfo, roomInfo)
    }
  })

  socket.on('leaveRoom', (playerInfo)=>{
    let room = playerInfo.room
    if(playerInfo.isHost){
      removePlayerFromRoom(playerInfo, rooms)
      io.to(room).emit('gotBackHome')
      socket.leave(room)
    }else{
      removePlayerFromRoom(playerInfo, rooms)
      let roomInfo = getCurrentRoom(playerInfo, rooms)
      io.to(room).emit('upDatePlayerList', playerInfo, roomInfo)
      socket.leave(room)
    }
    console.log(rooms)
  })




  // socket.on('hostLeaveRoom', playerInfo=>{
  //   let room = playerInfo.room
  //   socket.leave(room)
  //   let playerRoom = rooms.slice().filter(x=>x.RoomId!==room)
  //   rooms = playerRoom
  //   io.to(room).emit('hostLeftLeave')
  // })
  // socket.on('leaveRoom', playerInfo=>{
  //   // let playerRoom = rooms.find(rooms=>rooms.RoomId === room) || []
  //   let room = playerInfo.room
  //   socket.leave(room)
  // })

  // socket.on('getPlayerList', (playerList)=>{
    
  // })

  // socket.on('joinARoom', (playerList, playerInfo, setPlayerList)=>{
  //   let player = playerList //{player}
  //   let room = playerInfo.room
  //   if(playerInfo.isHost){ //Is creating Private Room
  //     io.to(room).emit('playerList', playerList)
  //     socket.join(room)
  //   }else{ //Is Joining Private Room

  //   }

  //   // console.log(playerList, playerInfo)
  //   // let playerCopy = player.filter(x=>{
  //   //   return playerInfo.playerName !== x.playerName
  //   // })
  //   // socket.join(room)
  //   // playerCopy.push(playerInfo)
  //   // player = playerCopy

  //   // io.to(room).emit('playerList', player)
    
  // })
  // socket.on('leaveRoom', (playerInfo)=>{
  //   let room = playerInfo.room
  //   let playerCopy = player.slice()
  //   socket.leave(room)
  //   if(playerInfo.isHost){
  //     console.log('Host Left')
  //     player = []
  //     io.to(room).emit('didHostLeave', true, player)
  //   }else{
  //     console.log('Player Left')
  //     player = playerCopy.filter(x=>x.playerName !== playerInfo.playerName)
  //     io.to(room).emit('didHostLeave', false, player)
  //   }
  // })




  
})



const PORT = process.env.PORT || 5000
server.listen(PORT, ()=>{
  console.log(`Server is RUNNING in PORT: ${PORT}`)
})


