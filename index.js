'use strict'

const readline = require('readline')
const net = require('net')
const scanner = require('./scan')
const dB = require('./old/clientDb')
const wrapEvent = require('./wrapEvent')
const MAX_ATTEMPTS = 5
const PORT = 5002

let listOfPeers = []
let attemptsCount = 0
let clientSocket, serverSocket, nick;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.on('line', (line) => {
})

function initializeServer() {
  return net.createServer()
}

function bootStrap(cb) { 
  let server = net.createServer();
 
  server.listen(PORT, () => {
    console.log('listening')
    cb()
  })

  server.on('connection', (socket) => {
    socket.on('data', (data) => {  
      let message = parseAndEval(data, { ip: clientSocket.remoteAddress });
      socket.write(JSON.stringify(message))
    })
  })
}

function parseAndEval(_data, extra) {
  let data = JSON.parse(_data.toString('utf8'));
  let message = {}

  if(data.type == 'ping') {
    message = Object.create({}, message, extra, { type: 'pong', text: nick })
  }

  return message
}

function checkAttempCount(count) {
  if(count > MAX_ATTEMPTS) {
    console.log("Maximum number of retries failed")
    return true
  }
}

function showListofPeers() {
  listOfPeers.forEach(peer => {
    console.log(peer.name)
  })
}

rl.question('Enter a nick name ', (name) => {
  nick = name;

  bootStrap(() => {
    console.log('here')
    scanner().then(data => {
      listOfPeers = dB.get()
      showListofPeers()
      rl.prompt(true)
    })
  })
})

