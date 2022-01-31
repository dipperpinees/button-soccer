$ = document.querySelector.bind(document);
$$ = document.querySelectorAll.bind(document);
const socket = io({query: {type: 'create', roomId: roomId}});
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

$(".graphics").onchange = (e) => {
    localStorage.setItem("graphic", e.target.value)
}

if(localStorage.getItem("graphic")) {
    $(".graphics").value = localStorage.getItem("graphic");
}

if(localStorage.getItem("ball")) {
    $(".ball-choose").classList.remove("ball-choose");
    $(`.${localStorage.getItem("ball")}`).classList.add("ball-choose")
}

if(localStorage.getItem("logmatch")) {
    const {blueScore, redScore, logGame} = JSON.parse(localStorage.getItem("logmatch"));
    $(".lastmatch-detail > p").textContent = `${blueScore} - ${redScore}`;
    while ( $(".blue-detail").hasChildNodes()) {
        $(".blue-detail").removeChild( $(".blue-detail").lastChild);
    }
    while ( $(".red-detail").hasChildNodes()) {
        $(".red-detail").removeChild( $(".red-detail").lastChild);
    }
    Object.keys(logGame["blue"]).forEach(key => {
        const div = document.createElement('div');
        div.textContent = `${key} (${logGame["blue"][key].join(", ")})`;
        $(".blue-detail").appendChild(div);
    })

    Object.keys(logGame["red"]).forEach(key => {
        const div = document.createElement('div');
        div.textContent = `${key} (${logGame["red"][key].join(", ")})`;
        $(".red-detail").appendChild(div);
    })
}

for(let i = 0; i<listBall.length; i++) {
    listBall[i].onclick = (e) => {
        $(".ball-choose").classList.remove("ball-choose");
        listBall[i].classList.add("ball-choose");
        localStorage.setItem("ball", `ball${i+1}`);
    }
}

for(let i = 0; i<listTime.length; i++) {
    listTime[i].onclick = (e) => {
        $(".time-choose").classList.remove("time-choose");
        listTime[i].classList.add("time-choose");
        localStorage.setItem("time", e.target.getAttribute("time"));
    }
    if(localStorage.getItem("time") && listTime[i].getAttribute("time") === localStorage.getItem("time")) {
        $(".time-choose").classList.remove("time-choose");
        listTime[i].classList.add("time-choose");
    }
}

socket.on("create", (args) => {
    if(args === "error") {
        window.location.href = "/";
    } else {
        args.playerList.forEach((player) => {
            const {socketId, name, team, avatar} = player;
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
            listPlayer[socketId] = player;
        })
    }
    // $(".settings-roomid").textContent = `Room Id: ${roomId}`
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
