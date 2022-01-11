const up = document.querySelector('#up')
const down = document.querySelector('#down')
const right = document.querySelector('#right')
const left = document.querySelector('#left')
let moveUp;
let moveRight;
let moveDown;
let moveLeft;
const body = document.querySelector("#body");
let count = 0;
let listTouch = [];
let sendMove;
const params = (new URL(document.location)).searchParams;
const username = params.get('name'); 
const password = params.get('password');
const roomId = params.get('roomId');
const players = ["bruyne", "congphuong", "haaland", "hoangduc", "kante", "lukaku", "mbappe", "messi", "neymar", "quanghai", "ronaldo", "tuananh"];
let currentTeam, currentPlayer;
$ = document.querySelector.bind(document);
$$ = document.querySelectorAll.bind(document);

$(".fullscreen").onclick = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    }
    if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}

$(".sharelink").onclick = () => {
    navigator.clipboard.writeText(`http://localhost:8001/join?roomId=${roomId}&password=${password}`);
}
const socket = io({
    query: {type: "join", name: username, password: password, roomId: roomId}
});
socket.on('status', (args) => {
    if(args.type === 'error') {
        alert(args.message);
        window.location.href="/join";
    }
})
socket.on('startgame', () => {
    $(".waiting").style.display = 'none';
    $(".gamepad").style.display = 'flex';
})
socket.on('endgame', () => {
    $(".waiting").style.display = 'flex';
    $(".gamepad").style.display = 'none';
})
socket.on('join', (args) => {
    if(args.type === 'error') {
        // window.location.href="/";
        return;
    }
    const img = document.createElement("IMG");
    img.alt = args.socketId;
    img.src = `/img/${args.team}default.png`;
    img.onclick = () => {
        if($(".waiting-choose-toggle").style.display === 'flex') {
            $(".waiting-choose-toggle").style.display = 'none';
        } else {
            $(".waiting-choose-toggle").style.display = 'flex';
        }
    }
    $(".waiting-choose").appendChild(img);
    currentTeam = args.team;
    if(args.team === 'blue') {
        $('body').style.backgroundColor = "#91CAE3";
    } else {
        $('body').style.backgroundColor = "#F39898";
    }
    players.forEach((player) => {
        const newImg = document.createElement("IMG");
        newImg.src = `/img/${args.team}${player}.png`;
        newImg.onclick = () => {
            socket.emit("player", player);
            currentPlayer = player;
            $(".waiting-choose > img").src = `/img/${args.team}${player}.png`;
            $(".waiting-choose-toggle").style.display = 'none';
        }
        $(".waiting-choose-toggle").appendChild(newImg);
    })
})
$(".waiting-changeteam").onclick = () => {
    socket.emit("changeteam", null);
    if(currentTeam === 'blue') {
        $('body').style.backgroundColor = "#F39898";
        $(".waiting-choose > img").src = `/img/red${currentPlayer || "default"}.png`;
        currentTeam = 'red';
    } else {
        $('body').style.backgroundColor = "#91CAE3";
        $(".waiting-choose > img").src = `/img/blue${currentPlayer || "default"}.png`;
        currentTeam = 'blue';
    }
    const toggle = $(".waiting-choose-toggle");
    while ( toggle.hasChildNodes()) {
        toggle.removeChild( toggle.lastChild);
    }
    players.forEach((player) => {
        const newImg = document.createElement("IMG");
        newImg.src = `/img/${currentTeam}${player}.png`;
        newImg.onclick = () => {
            socket.emit("player", player);
            currentPlayer = player;
            $(".waiting-choose > img").src = `/img/${currentTeam}${player}.png`;
            $(".waiting-choose-toggle").style.display = 'none';
        }
        $(".waiting-choose-toggle").appendChild(newImg);
    })
}

const makeSendMove = () => {
    console.log("tao interval")
    
}

// {moveX: MOVE_SPEED/2 * Math.sqrt(2), moveY: - (MOVE_SPEED/2 * Math.sqrt(2)) }

const handleTouch = (touchList) => {
    if(!touchList || touchList.length === 0) return;
    const touchTemp = {};
    touchTemp[handleTouchPos(touchList[0].target)] = true;
    if(touchList.length === 2) {
        touchTemp[handleTouchPos(touchList[1].target)] = true;
    }

    if(touchTemp["up"] ) {
        if(touchTemp["right"]) {
            return "up right";
        } else if(touchTemp["left"]) {
            return "up left";
        } else if(!touchTemp["down"]) {
            return "up"
        }
    }
    else if(touchTemp["down"]) {
        if(touchTemp["right"]) {
            return "down right";
        } else if(touchTemp["left"]) {
            return "down left";
        }  else if(!touchTemp["up"]) {
            return "down";
        }
    } else if(touchTemp["right"] && !touchTemp["left"]) {
        return "right";
    } else if(touchTemp["left"] && !touchTemp["right"]) {
        return "left";
    }

    return null;
}

const handleTouchPos = (touch) => {
    if(touch === up) {
        return "up";
    } 
    if(touch === down) {
        return "down";
    }
    if(touch === right) {
        return "right";
    }
    if(touch === left) {
        return "left";
    }
    return null;
}

document.addEventListener("touchmove", (e) => {
    // const move = handleTouch(e.touches);
    // if(move) {
    //     socket.emit("move", move)
    // }
    listTouch = e.touches;  
})

document.addEventListener("touchstart", (e) => {
    listTouch = e.touches;
    const move = handleTouch(listTouch);
    if(move) {
        socket.emit("move", move);
    }
    let sendMove = setInterval(() => {
        if(listTouch.length === 0  || listTouch.length >= 3) {
            clearInterval(sendMove);
        }
        
        const move = handleTouch(listTouch);
        if(move) {
            socket.emit("move", move)
        }
    }, 60)
    // socket.emit('test', "touch start" + e.touches.length);
})

document.addEventListener("touchend", (e) => {  
    listTouch = e.touches;
    // if(e.touches.length === 0 && isInterval) {
    //     clearInterval(sendMove);
    //     sendMove = null;
    //     console.log("het interval");
    //     isInterval = false;
    // } 
})

