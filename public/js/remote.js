const up = document.querySelector('#up')
const down = document.querySelector('#down')
const right = document.querySelector('#right')
const left = document.querySelector('#left')
const shoot = document.querySelector('#shoot')
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
    navigator.clipboard.writeText(`https://bs.hiepnguyen.site/join?roomId=${roomId}`);
}
const socket = io({
    path: "/bssocket",
    query: {type: "join", name: username, password: password, roomId: roomId, avatar: Cookies.get('avatar')}
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
        window.location.href="/";
        return;
    }
    currentTeam = args.team;
    if(args.team === 'blue') {
        $('body').style.backgroundColor = "#91CAE3";
    } else {
        $('body').style.backgroundColor = "#F39898";
    }
})

$(".waiting-changeteam").onclick = () => {
    socket.emit("changeteam", null);
    if(currentTeam === 'blue') {
        $('body').style.backgroundColor = "#F39898";
        currentTeam = 'red';
    } else {
        $('body').style.backgroundColor = "#91CAE3";
        currentTeam = 'blue';
    }
}

const handleTouch = (touchList) => {
    if(!touchList || touchList.length === 0 || touchList.length > 3) return;
    const touchTemp = {};
    
    for(let i = 0; i<touchList.length; i++) {
        touchTemp[handleTouchPos(touchList[i].target)] = true;
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

shoot.addEventListener("touchmove", (e) => {
    socket.emit("shoot");
})

shoot.addEventListener("touchstart", (e) => {
    socket.emit("shoot");
})

document.addEventListener("touchmove", (e) => {
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
})

document.addEventListener("touchend", (e) => {  
    listTouch = e.touches;
})

