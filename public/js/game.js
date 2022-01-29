$ = document.querySelector.bind(document);
$$ = document.querySelectorAll.bind(document);
const socket = io({query: {type: 'create'}});
const listBall = $$(".settings-ball li");
const listTime = $$(".settings-time li");
const listPlayer = {};

$(".game-settings i").onclick = () => {
    if($(".game-settings div").style.display === "block") {
        $(".game-settings div").style.display = "none";
    } else {
        $(".game-settings div").style.display = "block";
    }
}

for(let i = 0; i<listBall.length; i++) {
    listBall[i].onclick = (e) => {
        $(".ball-choose").classList.remove("ball-choose");
        listBall[i].classList.add("ball-choose");
    }
}

for(let i = 0; i<listTime.length; i++) {
    listTime[i].onclick = (e) => {
        $(".time-choose").classList.remove("time-choose");
        listTime[i].classList.add("time-choose");
    }
}

socket.on("create", ({roomId}) => {
    $(".settings-roomid").textContent = `Room Id: ${roomId}`
})

socket.on("join", (args) => {
    const {socketId, name, team, avatar} = args;
    const li = document.createElement("li");
    li.classList.add(`li-${socketId}`);
    const img = document.createElement("IMG");
    img.alt = name;
    img.src = avatar;
    img.onerror = () => {
        console.log("Image Error")
        img.src = avatar;
    }
    img.classList.add(`img-${socketId}`);
    li.appendChild(img);
    const p = document.createElement("p");
    p.textContent = name;
    li.appendChild(p);
    $(`.listplayer-${team}`).appendChild(li);
    listPlayer[socketId] = args;
})

socket.on("status", (args) => {
    if(args.type === "leave") {
        $(`.li-${args.socketId}`).remove();
        delete listPlayer[args.socketId];
    }
})

socket.on("changeteam", ({socketId, name, team, avatar}) => {
    $(`.li-${socketId}`).remove();
    const li = document.createElement("li");
    li.classList.add(`li-${socketId}`);
    const img = document.createElement("IMG");
    img.alt = socketId;
    img.src = avatar;
    li.appendChild(img);
    const p = document.createElement("p");
    p.textContent = name;
    li.appendChild(p);
    $(`.listplayer-${team}`).appendChild(li);
    listPlayer[socketId].team === 'blue' ? listPlayer[socketId].team = 'red' : listPlayer[socketId].team = 'blue';
})

$(".settings-start").onclick = () => {
    $(".wait").style.display = 'none';
    socket.emit('startgame');
    makeGameConstant();
    
    // game(Object.values(listPlayer), $(".ball-choose").getAttribute("src"), 60 * Number($(".time-choose").getAttribute("time")));
    
    const game = new Game(Object.values(listPlayer), $(".ball-choose").getAttribute("src"), 60 * Number($(".time-choose").getAttribute("time")), Number($(".graphics").value));
    game.start();
    
    //open full screen
    if(!isFullscreen()) {
        fullscreen();
    }
}
