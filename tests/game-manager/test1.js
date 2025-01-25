// Test Case: Game is created, started, all pieces are set correctly and game is closed

const gameManager = require("../../game-manager");

const pieces = {
	"rook":"rk",
	"knight":"kt",
	"bishop":"bp",
	"queen":"qn",
	"king":"kg",
	"pawn":"pn",
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

function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;
  
	for (var i = 0; i < a.length; ++i) {
	  if (b.count(a[i]) != a.count(a[i])) return false;
	}
	return true;
}

function execute() {
    let data;
    // opening a game
    let id = gameManager.openGame('player1');
    data = gameManager.gameData(id);
    if (!data) {
        return {code:1,err:new Error("Opening game failed")};
    }

    // joining players
    gameManager.joinPlayerToGame('player1',id);
    gameManager.joinPlayerToGame('player2',id);
    data = gameManager.gameData(id).players;
    if (!arraysEqual(data,['player1','player2'])) {
        return {code:1,err:new Error("Joining players failed")};
    }

    // starting the game
    gameManager.startGame(id);
    data = gameManager.gameData(id).boardAccesser;
    for (let i = 0; i < stands.length; i++) {
        if (!(data.get(stands[i][0]) == stands[i][1])) {
            return {code:1,err:new Error("Starting game failed")};
        }
    }

    // closing the game
    gameManager.closeGame(id);
    data = gameManager.gameData(id);
    if (data) {
        return {code:1,err:new Error("Closing game failed")};
    }

    return {code:0};
}

module.exports = {execute};