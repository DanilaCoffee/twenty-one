const express = require('express')
const http = require('http')
const path = require('path')
const socketIO = require('socket.io')

const app = express()
const server = http.Server(app)
const io = socketIO(server)

const PORT = process.env.PORT || 5000

app.set('port', PORT)
app.use('/client', express.static(__dirname + '/client'))

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/client', 'index.html'))
})

let players = []

io.on('connection', (socket) => {
	socket.on('new player', (name) => {
		if (players.length < 2) {
			let isUniqName = true
			for (let i = 0; i < players.length; i++) {
				if (players[i].name == name) {
					isUniqName = false
				}
			}
			if (isUniqName) {
				players.push({
					id: socket.id,
					name: name,
				})
				console.log(name + ' - connected')
				io.emit('player connected', players)
			} else {
				socket.emit('not uniq name')
			}
		} else {
			socket.emit('no more places')
		}
	})

	socket.on('move', (data) => {
		io.emit('moved', data)
	})

	socket.on('new message', (data) => {
		io.emit('мessage sent', data)
	})

	socket.on('win', (n) => {
		io.emit('player win', players[n].name)
	})

	socket.on('disconnect', () => {
		let newPlayers = []
		let disconnectedPlayer = ''
		for (let i = 0; i < players.length; i++) {
			if (players[i].id != socket.id) {
				newPlayers.push(players[i])
			} else {
				disconnectedPlayer = players[i].name
			}
		}
		players = newPlayers
		console.log(disconnectedPlayer + ' - disconnected')
		io.emit('player disconnected', [players, disconnectedPlayer])
	})
})

server.listen(PORT, () => {
	console.log('Server is working')
})