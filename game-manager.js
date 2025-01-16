var gameList = [];
var joinedPlayers = [];

const pieces = {
	"rook":"rk",
	"knight":"kt",
	"bishop":"bp",
	"queen":"qn",
	"king":"kg",
	"pawn":"pn",
};
function ptoc(pos) {
	return [8-pos[1],xc.indexOf(pos[0])];
};

const stands = [
	["a1","w"+pieces.rook],
	["b1","w"+pieces.knight],
	["c1","w"+pieces.bishop],
	["d1","w"+pieces.queen],
	["e1","w"+pieces.king],
	["f1","w"+pieces.bishop],
	["g1","w"+pieces.knight],
	["h1","w"+pieces.rook],
	["a2","w"+pieces.pawn],
	["b2","w"+pieces.pawn],
	["c2","w"+pieces.pawn],
	["d2","w"+pieces.pawn],
	["e2","w"+pieces.pawn],
	["f2","w"+pieces.pawn],
	["g2","w"+pieces.pawn],
	["h2","w"+pieces.pawn],
	["a8","b"+pieces.rook],
	["b8","b"+pieces.knight],
	["c8","b"+pieces.bishop],
	["d8","b"+pieces.queen],
	["e8","b"+pieces.king],
	["f8","b"+pieces.bishop],
	["g8","b"+pieces.knight],
	["h8","b"+pieces.rook],
	["a7","b"+pieces.pawn],
	["b7","b"+pieces.pawn],
	["c7","b"+pieces.pawn],
	["d7","b"+pieces.pawn],
	["e7","b"+pieces.pawn],
	["f7","b"+pieces.pawn],
	["g7","b"+pieces.pawn],
	["h7","b"+pieces.pawn]
];

const xc = ['a','b','c','d','e','f','g','h'];
const yc = ['1','2','3','4','5','6','7','8'];

class Board {
	constructor() {
		this.data=Array(8*8);
		this.off=[];
		this.init = () => {
			for (let i = 0; i < stands.length;i++) {
				this.set(stands[i][0],stands[i][1]);
			};
		};
		
		this.set = (pos,d) => {
			let c = ptoc(pos);
			let index=c[0]*8+c[1];
			if (index>=0 && index<=63) {
				this.data[index]=d;
			} else {
				return false;
			};
			return true;
		};
		this.isEmpty=(pos)=>{
			return !this.get(pos);
		};
		this.find=(piece) => {
			let index = this.data.indexOf(piece);
			return xc[index%8]+yc[8-parseInt(index/8)];
		};
		this.get=(pos)=>{
			let c = ptoc(pos);
			let index=c[0]*8+c[1];
			if (index>=0 && index<=63) {
				return this.data[index];
			} else {
				return -1;
			};
		};
	};
};

const findGame = (id) => {
	for (let i = 0; i < gameList.length; i++) {
		
		if (gameList[i].id == id) {
			return i;
		};
	};
	return -1;
};

const movePiece = (game,pos1,pos2,player) => {
	
	let order=game.players.indexOf(player);
	
	if (order==-1) {
		return false;
	};
	
	let c=["w","b"][order];
	let o=c=="w"?"b":"w";
	
	let piece = game.board.get(pos1);
	
	if (game.turn == o || !piece || piece[0] == o) {
		return false;
	};
	
	piece = piece.slice(1);

	let valid;
	// do move validation here...
	valid=true;
	if (!valid) return false;
	
	game.board.set(pos2,game.board.get(pos1));
	game.board.set(pos1,"");
	
	game.movehis.push([pos1,pos2]);
	game.turn=o;
	game.result=gameResult(game.board);
	
	return game;
};



const gameResult = (board) => {
	// if game has finished return result else return false
	return;
};

// exports

const startGame = (id) => {
	let index=findGame(id);
	if (index == -1) {
		return false;
	};
	let game= gameList[index];
	game.board=new Board();
	game.board.init();
	let players=game.players;
	if (Math.floor(Math.random()*2)) {
		game.players=players.reverse();
	};
	game.turn="w";
	game.movehis=[];
	gameList[index]=game;
	return true;
};

const handlePlayerTurn = (player,move,gid) => {
	let pos1=move[0];
	let pos2=move[1];
	
	let index = findGame(gid);
	if (index == -1) {
		return false;
	};
	
	let r = movePiece(gameList[index],pos1,pos2,player);
	
	if (!r) {
		return false;
	};
	
	gameList[index]=r;
	
	return true;
};

const openGame = (createdBy) => {
	let data = {
		id:Date.now(),
		createdBy:createdBy,
		players:[]
	};
	gameList.push(data);
	return data.id;
};

const playerLeaveGame = (player,id) => {
	let index=findGame(id);
	if (index == -1) {
		return false;
	};
	let li = gameList[index].players;
	let l = li.length;
	let n = li.indexOf(player);
	let n2 = joinedPlayers.indexOf(player);
	if (n == -1) {
		return false;
	} else {
		gameList[index].players=li.slice(0,n).concat(li.slice(n+1));
		joinedPlayers=joinedPlayers.slice(0,n2).concat(joinedPlayers.slice(n2+1));
		gameList[index].result=n==0?"won_by_black":"won_by_white";
		return l-1;
	};
};

const gameData = (id) => {
	let index=findGame(id);
	if (index == -1) {
		return false;
	};
	let game = gameList[index];
	let res = {
		players: game.players,
		result: game.result
	};
	if (game.board) {
		res.board=game.board.data;
	};
	return res;
};

const joinPlayerToGame = (player,id) => {
	let index=findGame(id);
	if (index == -1) {
		return false;
	};
	let l = gameList[index].players.length;
	
	if (l==2) {
		return false;
	} else {
		if (gameList[index].players.includes(player)) {
			return false;
		};
		gameList[index].players.push(player);
		joinedPlayers.push(player);
		return l+1;
	};
};

const getGames = () => {
	let res = gameList.map(a=>Object({
		id:a.id,
		createdBy:a.createdBy,
		playerCount:a.players.length
	}));
	return res;
};

const closeGame = (id) => {
	let i = findGame(id);
	if (i != -1) {
		gameList=gameList.slice(0,i).concat(gameList.slice(i+1));
	};
};

module.exports={closeGame,getGames,joinPlayerToGame,openGame,handlePlayerTurn,playerLeaveGame,startGame,gameData};

