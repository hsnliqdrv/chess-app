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

Object.defineProperties(Array.prototype, {
    count: {
        value: function(value) {
            return this.filter(x => x==value).length;
        }
    }
});

function ptoc(pos) {
	return [8-pos[1],xc.indexOf(pos[0])];
};
function ctop(pos) {
	return xc[pos[1]]+(8-pos[0]);
}

function posToIndex(pos) {
	return (ptoc(pos)[0]*8+ptoc(pos)[1])
}

function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;
  
	for (var i = 0; i < a.length; ++i) {
	  if (b.count(a[i]) != a.count(a[i])) return false;
	}
	return true;
  }

/*const stands = [
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
];*/
const stands = [
	["c1","w"+pieces.bishop],["e1","w"+pieces.king],["e8","b"+pieces.king],["f8","b"+pieces.bishop]
]

const xc = ['a','b','c','d','e','f','g','h'];
const yc = ['1','2','3','4','5','6','7','8'];

class Board {
	constructor() {
		this.data=Array(8*8);
		this.off=[];
		this.init = () => {
			this.data.fill("");
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
			return xc[index%8]+yc[7-parseInt(index/8)];
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
	
	let piece1 = game.board.get(pos1);
	let piece2 = game.board.get(pos2);

	if (game.turn == o || !piece1 || piece1[0] == o || pos1 == pos2) {
		return false;
	};

	if (!canMoveTo(game.board,pos1,pos2,true)) return false;

	if (isCastle(piece1,piece2)) { // castling case
		game.board=castle(game.board,pos1,pos2);
	} else if (pawnPromotes(game.board,pos1,pos2)) {
		game.board.set(pos2,c+pieces.queen);
		game.board.set(pos1,"");
	} else {
		game.board.set(pos2,piece1);
		game.board.set(pos1,"");
	}
	
	game.board.movehis.push([pos1,pos2]);
	game.turn=o;
	
	return game;
};

const castle = (board,pos1,pos2) => {
	let c1=ptoc(pos1),c2=ptoc(pos2);
	let d = (c1[1]-c2[1])/Math.abs(c1[1]-c2[1]);
	let pos1_,pos2_;
	if (Math.abs(c1[1]-c2[1]) == 3) {
		pos1_=ctop([c1[0],c1[1]-2*d]),pos2_=ctop([c2[0],c2[1]+2*d]);
	} else {
		pos1_=ctop([c1[0],c1[1]-2*d]),pos2_=ctop([c2[0],c2[1]+3*d]);
	}
	board.set(pos1_,board.get(pos1));
	board.set(pos2_,board.get(pos2));
	board.set(pos1,"");
	board.set(pos2,"");
	return board;
};


const isCastle = (piece1,piece2) => {
	return (piece1[0] == piece2[0] && piece1.slice(1) == pieces.king && piece2.slice(1) == pieces.rook);
}


const canMoveTo = (board,pos1,pos2,checkKing) => {
	let p1=ptoc(pos1),p2=ptoc(pos2);
	let r0=p2[0]-p1[0],r1=p2[1]-p1[1];
	let piece1=board.get(pos1),piece2=board.get(pos2);
	let c=piece1[0];
	let o=c=="w"?"b":"w";
	let ch1=piece1.slice(1);
	let iscastle = false;
	switch (ch1) {
		case pieces.bishop:
			if (Math.abs(r0) != Math.abs(r1)) {
				return false;
			}
			break;
		case pieces.knight:
			if (!arraysEqual([Math.abs(r0),Math.abs(r1)].sort(),[1,2])) {
				return false;
			}
			break;
		case pieces.rook:
			if (r0*r1 != 0) {
				return false;
			}
			break;
		case pieces.king:
			if (!(Math.abs(r0) <= 1 && Math.abs(r1) <= 1)) {
				if (canCastle(board,pos1,pos2)) {
					iscastle=true;
				} else {
					return false;
				}
			}
			break;
		case pieces.queen:
			if (!(Math.abs(r0) == Math.abs(r1) || r0*r1 == 0)) {
				return false;
			}
			break;
		case pieces.pawn:
			let s1 = board.get(ctop([pos1[0],pos2[1]-1]));
			let s2 = board.get(ctop([pos1[0],pos2[1]+1]));
			if (!piece2) {
				if (!(((piece1[0] == "w" && r0 == -1 && r1==0) || (piece1[0] == "b" && r0 == 1 && r1==0)) || 
			((piece1[0] == "w" && p1[0] == 6 && r0 == -2 && r1 == 0) || (piece1[0] == "b" && p1[0] == 1 && r0 == 2 && r1 == 0)) ||
		((s1 && s1[0] == o && ((piece1[0] == "w" && r0 == -1 && r1 == -1) || (piece1[0] == "b" && r0 == 1 && r1 == -1))) 
		|| (s2 && s2[0] == o && ((piece1[0] == "w" && r0 == -1 && r1 == 1) || (piece1[0] == "b" && r0 == 1 && r1 == 1)))))) {
					return false;
				}
			} else {
				if (!((piece1[0] == "w" && r0 == -1 && Math.abs(r1) == 1)||(piece1[0] == "b" && r0 == 1 && Math.abs(r1)==1))) {
					return false;
				}
			}
			break;
		default:
			return false;
	}

	if (!iscastle && piece2[0] == c) {
		return false;
	}

	if (ch1 != pieces.knight && !iscastle) {
		let step0 = r0==0?0:r0/Math.abs(r0),step1 = r1==0?0:r1/Math.abs(r1);
		let n = (r0 != 0)? r0/step0 : r1/step1;
		for (let i = 1; i <= n-1; i++) {
			if (board.get(ctop([p1[0]+step0*i,p1[1]+step1*i]))) {
				return false;
			}
		}
	}
	if (!iscastle) {
		if (checkKing) {
			data=board.data.slice();
			board.set(pos2, piece1);
			board.set(pos1,"")
			if (isChecked(board,board.find(c+pieces.king),o)) {
				board.data=data;
				return false;
			}
		}
		board.data=data;
	}
	return true;
};

const canCastle = (board,pos1,pos2) => {
	let piece1 = board.get(pos1);
	let piece2 = board.get(pos2);

	if (isCastle(piece1,piece2)) {
		if (isChecked(board,pos1,piece1[0]=="w"?"b":"w")) {
			return false;
		}
		for (let m of board.movehis) {
			if (m.includes(pos1) || m.includes(pos2)) {
				return false;
			}
		}
		let p1=ptoc(pos1),p2=ptoc(pos2);
		let step = ((p2[1]-p1[1])/Math.abs(p1[1]-p2[1]));
		while (p1[1]+step != p2[1]) {
			let p = ctop([p1[0],p1[1]+step]);
			if (board.get(p) || isChecked(board,p,piece1[0]=="w"?"b":"w")) {
				return false;
			}
			p1[1]=p1[1]+step;
		}
		return true;
	} else {
		return false;
	}
};

const pawnPromotes = (board,pos1,pos2) => {
	let piece1 = board.get(pos1), piece2 = board.get(pos2);
	let c2 = ptoc(pos2);
	if (piece1.slice(1) == pieces.pawn && !piece2 && (c2[0] == 0 && piece1[0] == "w" || c2[0] == 7 && piece1[0] == "b")) {
		return true;
	}
	return false;
};

const isChecked = (board, t_pos,o=false) => {
	let arr = [];
	for (let pos of piecesPos(board,o)) {
		let ch = board.get(pos);
		if (ch && ((o && ch[0] == o) || (!o)) && canMoveTo(board,pos,t_pos,checkKing=false)) {
			arr.push(pos);
		}
	}
	return arr.length==0?false:arr;
};

const piecesPos = (board,color) => {
	let arr = [];
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			let pos = ctop([i,j]);
			let ch = board.get(pos);
			if (ch) {
				if ((color && ch[0] == color) || (!color)) {
					arr.push(pos);
				}
			}
		}
	}
	return arr;
};

const checkMate = (board,color) => {
	let o = color=="w"?"b":"w";
	let pos = board.find(color+pieces.king);
	let checkers = isChecked(board,pos,o); 
	if (!checkers) return false;
	if (possibleMoves(board,pos).length == 0) {
		let poss = piecesPos(board,color);
		for (let chPos of checkers) {
			for (let cpos of poss) {
				let p1=ptoc(chPos),p2=ptoc(pos);
				let r0=p2[0]-p1[0],r1=p2[1]-p1[1];
				let step0 = r0==0?0:r0/Math.abs(r0),step1 = r1==0?0:r1/Math.abs(r1);
				let n = (r0 != 0)? r0/step0 : r1/step1;
				for (let i = 0; i <= n-1; i++) {
					if (canMoveTo(board,cpos,ctop([p1[0] + step0*i,p1[1] + step1*i]),true)) {
						return false;
					}
				}
			}
		}
		return true;
	} else {
		return false;
	}
};

const possibleMoves = (board,pos) => {
	if (!pos) return false;
	let arr = [];
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			let pos_ = ctop([i,j]);
			if (canMoveTo(board,pos,pos_,true)) {
				arr.push([pos,pos_])
			}
		}
	}
	return arr;
};

const staleMate = (board,color) => {
	for (let i = 0; i < 8; i++) {
		for (let j=0; j<8; j++) {
			let pos = ctop([i,j]);
			let piece = board.get(pos);
			if (piece[0] == color) {
				if (possibleMoves(board,pos).length > 0) {
					return false;
				}
			}
		}
	}
	return true;
};

const inSufficientMaterial = (board) => {
	let w = piecesPos(board,"w");
	let b = piecesPos(board,"b");
	let wp = w.map(board.get), wpp = w.map(ptoc).map(p => (p[0]+p[1])%2);
	let bp = b.map(board.get), bpp = b.map(ptoc).map(p => (p[0]+p[1])%2);
	if ((wp == ["w"+pieces.king] && bp == ["b"+pieces.king]) || 
(wp, arraysEqual(["w"+pieces.king,"w"+pieces.knight]) && arraysEqual(bp, ["b"+pieces.king])) || 
(wp, arraysEqual(["w"+pieces.king]) && arraysEqual(bp, ["b"+pieces.king,"b"+pieces.knight])) ||
(wp, arraysEqual(["w"+pieces.king,"w"+pieces.bishop]) && arraysEqual(bp, ["b"+pieces.king])) || 
(wp, arraysEqual(["w"+pieces.king]) && arraysEqual(bp, ["b"+pieces.king,"b"+pieces.bishop])) ||
(arraysEqual(wp,["w"+pieces.king,"w"+pieces.bishop]) && arraysEqual(bp,["b"+pieces.king,"b"+pieces.bishop]) && 
wpp[wp.indexOf("w"+pieces.bishop)] == bpp[bp.indexOf("b"+pieces.bishop)])) {
	return true;
	}
};

const gameStatus = (game) => {
	let o = game.turn=="w"?"b":"w";
	
	if (checkMate(game.board,game.turn)) {
		return o=="w"?2:4;
	} else if (staleMate(game.board,game.turn) || inSufficientMaterial(game.board)) {
		return 3;
	} else {
		return 1;
	}
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
	game.board.movehis=[];
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

	let gstatus = gameStatus(r);
	
	if (gstatus == 2) {
		gameList[index].result="won_by_white";
	} else if (gstatus == 4) {
		gameList[index].result="won_by_black"
	} else if (gstatus == 3) {
		gameList[index].result="draw"
	}

	return gstatus;
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

