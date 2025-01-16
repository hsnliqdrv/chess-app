const serverPort=5000;

const path = require('path');
const homePath = path.resolve();

const gameManager=require('./game-manager.js');



const express = require('express');
const app = express();

app.use(express.static(homePath+"/public"));

const httpServer = require("http").createServer(app);

const io = require("socket.io")(httpServer);

let sockets = {};

let handleConn = socket => {
	let user;
	let currentGame;
	socket.on("set-uname",uname=>{
		if (Object.values(sockets).includes(uname)) {
			socket.emit("login-fail");
		} else {
			socket.emit("login-success");
			user=uname;
			sockets[socket.id]=user;
			console.log(user+" connected");
			
			let handleGetGames = () => {
				let r = gameManager.getGames();
				if (!(r === false)) {
					socket.emit("gameList", r);
				} else {
					socket.emit("error","error");
				};	
			};
			socket.on("getGames", handleGetGames);
			
			let handleOpenGame = () => {
				let r = gameManager.openGame(user);
				if (!(r === false)) {
					console.log(user+" opened game #"+r);
					
					io.emit("gameList", gameManager.getGames());
				} else {
					socket.emit("error","error");
				};
			};
			socket.on("openGame", handleOpenGame);
			let sendUpdate = () => {
				let data = gameManager.gameData(currentGame);
				io.to(currentGame).emit("gameUpdate",data.board.join(","));
			};
			let handleJoinGame = (id) => {
				let r = gameManager.joinPlayerToGame(user,id);
			
				if (!(r === false)) {
					console.log(user+" joined #"+id);
					if (currentGame) {
						handleLeaveGame(currentGame);
					};
					
					currentGame=id;
					
					socket.join(currentGame);
					
					socket.emit("goToGame",id);
					
					if (r == 2) {
						gameManager.startGame(id);
						let data = gameManager.gameData(id).players;
						io.to(id).emit("gameStart",data.join(","));
						sendUpdate();
						console.log("started game #"+id);
					};
					
					io.emit("gameList", gameManager.getGames());
				} else {
					socket.emit("error","error");
				};
			};
			socket.on("joinGame", handleJoinGame);
			
			let handleLeaveGame = () => {
				let r = gameManager.playerLeaveGame(user,currentGame);
				if (!(r === false)) {
					console.log(user+" left #"+currentGame);
					
					if (r == 1) {
						let data = gameManager.gameData(currentGame);
						let {result} = data;
						gameManager.closeGame(currentGame);
						io.to(currentGame).emit("gameEnd",result);
					};

					socket.emit("closeGame");

					socket.leave(currentGame);
					
					currentGame=null;
					
					io.emit("gameList", gameManager.getGames());
				} else {
					socket.emit("error","error");
				};
			};
			socket.on("leaveGame",handleLeaveGame);
			
			let handleDoMove = (move) => {
				let r = gameManager.handlePlayerTurn(user,move,currentGame);
				if (!(r===false)) {
					let res = gameManager.gameData(currentGame).result;
					if (res) {
						
						io.to(currentGame).emit("gameEnd",result);
					
						gameManager.closeGame(currentGame);
					
						socket.leave(currentGame);
					
						currentGame=null;
					
						io.emit("gameList", gameManager.getGames());
					};
				};
				sendUpdate();
			};
			socket.on("doMove",handleDoMove);
			
			let handleDisconnect = () => {
				handleLeaveGame();
				
				console.log(user+" disconnected");
				delete sockets[socket.id];
			};
			socket.on("disconnect", handleDisconnect);
		};
	});
};

io.on("connection",handleConn);

httpServer.listen(serverPort);

module.exports={gameManager}
