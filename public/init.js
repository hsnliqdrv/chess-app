function setAppActive(b) {
	let l = document.querySelectorAll("div:not(#navbar)");
	if (!b) {
		l.forEach(elem => {
			elem.style.pointerEvents="none";
			elem.style.filter="blur(5px)";
		});
	} else {
		l.forEach(elem => {
			elem.style.pointerEvents="";
			elem.style.filter="";
		});
	};
};
function prompt_(question,callback) {
	
	let cont = document.createElement("DIV");
	cont.id="prompt";
	cont.className="center";
	
	document.body.appendChild(cont);
	let para = document.createElement("P");
	para.innerHTML=question;
	let inp = document.createElement("INPUT");
	inp.placeHolder="Enter here...";
	let submit = document.createElement("BUTTON");
	submit.innerHTML = "Submit";
	submit.onclick = () => {
		let input = event.target.parentElement.querySelector("input");
		callback(input.value);
	};
	cont.appendChild(para);
	cont.appendChild(inp);
	cont.appendChild(submit);
};
var socket;
function connectToSocket(user,success,err) {
	socket = io();
	socket.on("connect",() => {
		console.log("connected to socket server.");
	});
	socket.emit("set-uname",user);
	socket.on("login-fail", () => {
		console.log("invalid username");
		alert("Cannot use this username, please enter another one.");
		localStorage.removeItem("uname");
		err();
	});
	socket.on("login-success", () => {
		console.log("logged in as", user);
		localStorage.setItem("uname",user);
		setAppActive(true);
		document.querySelector("#navbar span").innerHTML=user;
		success(user);
	});

};

function resetLocal() {
	localStorage.removeItem("uname");
	location.reload();
};

function init() {
	setAppActive(false);
	socket=null;
	let local=localStorage.getItem("uname");
	if (!local) {
		let uname = prompt_("Enter your name to use in the game:",(user) => {
			document.getElementById("prompt").remove();
			connectToSocket(user,main,init);
		});
	} else {
		connectToSocket(local,main,init);
	};
};
