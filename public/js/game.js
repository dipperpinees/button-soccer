const GAME_WIDTH = screen.width;
const GAME_HEIGHT = screen.height;
const PITCH_X = GAME_WIDTH / 12;
const PITCH_Y = GAME_HEIGHT / 16;
const SCALE_BALL = GAME_HEIGHT / 22 / 256;
const SCALE_PLAYER = GAME_HEIGHT / 22 / 100;
const STADIUM_WIDTH = GAME_WIDTH - PITCH_X * 2;
const STADIUM_HEIGHT = GAME_HEIGHT - PITCH_Y * 2;
const STRAIGHT_SPEED = screen.width / 7;
const DIAGONAL_SPEED = STRAIGHT_SPEED/2 * Math.sqrt(2);
const BALL_SPEED = screen.width / 6.5;
$ = document.querySelector.bind(document);
$$ = document.querySelectorAll.bind(document);
const socket = io({query: {type: 'create'}});
const listBall = $$(".settings-ball li");
const listTime = $$(".settings-time li");
const listPlayer = {};

const teamPos = {
    "blue": [
        {x: 3 / 8 * STADIUM_WIDTH + PITCH_X, y: GAME_HEIGHT / 2 - 100 * SCALE_PLAYER / 2},
        {x: 1 / 4 * STADIUM_WIDTH + PITCH_X, y: GAME_HEIGHT / 2 - 100 * SCALE_PLAYER / 2},
        {x: 1 / 4 * STADIUM_WIDTH + PITCH_X, y: PITCH_Y + 1/8 * STADIUM_HEIGHT},
        {x: 1 / 4 * STADIUM_WIDTH + PITCH_X, y: GAME_HEIGHT - PITCH_Y - 1/8 * STADIUM_HEIGHT - 100 * SCALE_PLAYER },
        {x: 1 / 8 * STADIUM_WIDTH + PITCH_X, y: GAME_HEIGHT - PITCH_Y - 1/4 * STADIUM_HEIGHT - 100 * SCALE_PLAYER },
        {x: 1 / 8 * STADIUM_WIDTH + PITCH_X, y: PITCH_Y + 1/4 * STADIUM_HEIGHT},
    ],
    "red": [
        {x: GAME_WIDTH - 100*SCALE_PLAYER -  3 / 8 * STADIUM_WIDTH - PITCH_X, y: GAME_HEIGHT / 2 - 100 * SCALE_PLAYER / 2},
        {x: GAME_WIDTH - 100*SCALE_PLAYER - 1 / 4 * STADIUM_WIDTH - PITCH_X, y: GAME_HEIGHT / 2 - 100 * SCALE_PLAYER / 2},
        {x: GAME_WIDTH - 100*SCALE_PLAYER- 1 / 4 * STADIUM_WIDTH - PITCH_X, y: PITCH_Y + 1/8 * STADIUM_HEIGHT},
        {x: GAME_WIDTH - 100*SCALE_PLAYER - 1 / 4 * STADIUM_WIDTH - PITCH_X, y: GAME_HEIGHT - PITCH_Y - 1/8 * STADIUM_HEIGHT - 100 * SCALE_PLAYER },
        {x: GAME_WIDTH - 100*SCALE_PLAYER - 1 / 8 * STADIUM_WIDTH - PITCH_X, y: GAME_HEIGHT - PITCH_Y - 1/4 * STADIUM_HEIGHT - 100 * SCALE_PLAYER },
        {x: GAME_WIDTH - 100*SCALE_PLAYER - 1 / 8 * STADIUM_WIDTH - PITCH_X, y: PITCH_Y + 1/4 * STADIUM_HEIGHT},
    ]
}

const handleAvatar = (avatar, team) => {
    if(team === "blue") {
        return avatar.replace(",r_max/", `,r_max,bo_6px_solid_royalblue/`);
    } else {
        return avatar.replace(",r_max/", `,r_max,bo_6px_solid_indianred/`);
    }
}

const addPlayer = async (listPlayer, playerData) => {
    const handlePlayerCollide = (obj, name, team) => {
        obj.collides("wallleft1",  () => {
            obj.move(200, 0);
        })
        obj.collides("wallleft2",  () => {
            obj.move(200, 0);
        })
        obj.collides("goallefttop",  () => {
            obj.move(0, 200);
        })
        obj.collides("goalleftleft",  () => {
            obj.move(200, 0);
        })
        obj.collides("goalleftbottom",  () => {
            obj.move(0, -200);
        })
        obj.collides("goalrighttop",  () => {
            obj.move(0, 200);
        })
        obj.collides("goalrightright",  () => {
            obj.move(-200, 0);
        })
        obj.collides("goalrightbottom",  () => {
            obj.move(0, -200);
        })
        obj.collides("wallright1",  () => {
            obj.move(-200, 0);
        })
        obj.collides("wallright2",  () => {
            obj.move(-200, 0);
        })
        obj.collides("walltop",  () => {
            obj.move(0, 200);
        })
        
        obj.collides("wallbottom",  () => {
            obj.move(0, -200);
        })
    
        obj.collides("ball",  (s) => {
            s.value.touch = name;
            s.value.touchTeam = team;
            obj.move(8*(obj.pos.x-s.pos.x), 8*(obj.pos.y-s.pos.y));
            const vectoX = s.pos.x-obj.pos.x;
            const vectoY = s.pos.y-obj.pos.y;
            const countStepMove = Math.sqrt((Math.pow(BALL_SPEED + 40, 2))/(Math.pow(vectoX, 2) +  Math.pow(vectoY, 2) ))
            s.value.x += countStepMove * vectoX;
            s.value.y += countStepMove * vectoY;
            s.move(s.value.x, s.value.y)    
        })
    }
    let countBlue = -1;
    let countRed = -1;

    //add player and handle player collide
    listPlayer.forEach(async (player) => {
        loadSprite(`${player.team}_${player.socketId}`, handleAvatar(player.avatar, player.team));
        const count = player.team === 'blue' ? ++countBlue : ++countRed;
        playerData[player.socketId] = {};
        playerData[player.socketId]["defaultPos"] = {x: teamPos[player.team][count].x, y: teamPos[player.team][count].y}
        playerData[player.socketId]["player"] = add([
            sprite(`${player.team}_${player.socketId}`),
            pos(teamPos[player.team][count].x, teamPos[player.team][count].y),
            area(),
            scale(SCALE_PLAYER),
            "player",
            {value: {name: player.name, team: player.team, startX: teamPos[player.team][count].x, startY: teamPos[player.team][count].y, x: 0, y: 0}}
        ])
    })

    every("player", (s) => {
        s.collides("player", (t) => {
            s.move(8*(s.pos.x-t.pos.x), 8*(s.pos.y-t.pos.y));
        })
        handlePlayerCollide(s, s.value.name, s.value.team);
    })
}

const addBall = () => {
    //add ball and handle ball collide
    const ball = add([
        sprite("ball"),
        pos(GAME_WIDTH / 2 - 256*SCALE_BALL/2, GAME_HEIGHT / 2 - 256*SCALE_BALL/2),
        area(),
        scale(SCALE_BALL),
        {value: {x: 0, y: 0, touch: null, touchTeam: null}},
        "ball"
    ])
    ball.collides("wallleft1",  () => {
        ball.value.x = ball.value.x * -1;
        ball.move(200, 0);
    })
    ball.collides("wallleft2",  () => {
        ball.value.x = ball.value.x * -1;
        ball.move(200, 0);
    })
    ball.collides("wallright1",  () => {
        ball.value.x = ball.value.x * -1;
        ball.move(-200, 0);
    })
    ball.collides("wallright2",  () => {
        ball.value.x = ball.value.x * -1;
        ball.move(-200, 0);
    })
    
    ball.collides("wallbottom",  () => {
        ball.value.y = ball.value.y * -1;
        ball.move(0, -200);
    })
    
    ball.collides("walltop",  () => {
        ball.value.y = ball.value.y * -1;
        ball.move(0, 200);
    })

    ball.collides("goallefttop",  () => {
        ball.value.y = ball.value.y * -1;
        ball.move(0, 200);
    })
    ball.collides("goalleftleft",  () => {
        ball.value.x = ball.value.x * -1;
        ball.move(200, 0);
    })
    ball.collides("goalleftbottom",  () => {
        ball.value.y = ball.value.y * -1;
        ball.move(0, -200);
    })
    ball.collides("goalrighttop",  () => {
        ball.value.y = ball.value.y * -1;
        ball.move(0, 200);
    })
    ball.collides("goalrightright",  () => {
        ball.value.x = ball.value.x * -1;
        ball.move(-200, 0);
    })
    ball.collides("goalrightbottom",  () => {
        ball.value.y = ball.value.y * -1;
        ball.move(0, -200);
    })
    return ball;
}

const buildStadium = () => {
    for(let i = 0; i < 12; i++) {
        add([
            pos(PITCH_X * i , 0),
            rect(PITCH_X / 2, GAME_HEIGHT),
            color(46, 204, 113)
        ]) 
    }
    //center circle
    add([
        pos(GAME_WIDTH / 2- 500*0.25, GAME_HEIGHT / 2 - 500*0.25),
        // circle(100),
        sprite('circle'),
        scale(0.5),
        "linecircle"
    ])
    add([
        pos(PITCH_X, GAME_HEIGHT - PITCH_Y - 250*0.2),
        sprite('corn'),
        scale(0.2),
        "bottomleftcorn"
    ])

    add([
        pos(PITCH_X + 250*0.2, PITCH_Y),
        sprite('corn'),
        scale(0.2),
        rotate(90),
        "topleftcorn"
    ])

    add([
        pos(GAME_WIDTH - PITCH_X , PITCH_Y + 250 * 0.2),
        sprite('corn'),
        scale(0.2),
        rotate(180),
        "toprightcorn"
    ])

    add([
        pos(GAME_WIDTH - PITCH_X - 250*0.2 , GAME_HEIGHT - PITCH_Y),
        sprite('corn'),
        scale(0.2),
        rotate(270),
        "bottomrightcorn"
    ])

    add([
        pos(GAME_WIDTH / 2 - 2, PITCH_Y),
        rect(4, GAME_HEIGHT - PITCH_Y * 2),
        "linecenter"
    ])

    add([
        pos(GAME_WIDTH / 2, GAME_HEIGHT / 2),
        circle(8),
        "centerdot"
    ])

    add([
        pos(PITCH_X, PITCH_Y + 1/4 * (GAME_HEIGHT - PITCH_Y * 2)),
        rect( 1/8 * (GAME_WIDTH - PITCH_X * 2), 4),
        "penlefttop"
    ])

    add([
        pos(PITCH_X, PITCH_Y + 3/4 * (GAME_HEIGHT - PITCH_Y * 2)),
        rect( 1/8 * (GAME_WIDTH - PITCH_X * 2), 4),
        "penleftbottom"
    ])

    add([
        pos(PITCH_X + 1/8 * (GAME_WIDTH - PITCH_X * 2), PITCH_Y + 1/4 * (GAME_HEIGHT - PITCH_Y * 2)),
        rect( 4, 1/2 * (GAME_HEIGHT - PITCH_Y * 2) + 4),
        "penleftright"
    ])

    add([
        sprite('pencircle'),
        pos(PITCH_X + 1/8 * (GAME_WIDTH - PITCH_X * 2) + 4, PITCH_Y + 1/3 * (GAME_HEIGHT - PITCH_Y * 2) ),
        scale(1/3 * (GAME_HEIGHT - PITCH_Y * 2) / 472),
        'penleftcirle'
    ])

    add([
        pos(GAME_WIDTH - PITCH_X - 1/8 * (GAME_WIDTH - PITCH_X * 2), PITCH_Y + 1/4 * (GAME_HEIGHT - PITCH_Y * 2)),
        rect( 1/8 * (GAME_WIDTH - PITCH_X * 2), 4),
        "penrighttop"
    ])

    add([
        pos(GAME_WIDTH - PITCH_X - 1/8 * (GAME_WIDTH - PITCH_X * 2), PITCH_Y + 1/4 * (GAME_HEIGHT - PITCH_Y * 2)),
        rect( 4, 1/2 * (GAME_HEIGHT - PITCH_Y * 2) + 4),
        "penrightleft"
    ])

    add([
        pos(GAME_WIDTH - PITCH_X - 1/8 * (GAME_WIDTH - PITCH_X * 2), PITCH_Y + 3/4 * (GAME_HEIGHT - PITCH_Y * 2)),
        rect( 1/8 * (GAME_WIDTH - PITCH_X * 2), 4),
        "penrightbottom"
    ])

    add([
        sprite('pencircle'),
        pos(GAME_WIDTH - PITCH_X - 1/8 * (GAME_WIDTH - PITCH_X * 2) + 4, PITCH_Y + 2/3 * (GAME_HEIGHT - PITCH_Y * 2)),
        scale(1/3 * (GAME_HEIGHT - PITCH_Y * 2) / 472),
        rotate(180),
        'penleftcirle'
    ])

    add([
        pos(PITCH_X, PITCH_Y),
        rect(4, 1/3*(GAME_HEIGHT - PITCH_Y * 2)),
        // outline(0.6),
        area(),
        "wallleft1"
    ])
    
    add([
        pos(PITCH_X, PITCH_Y + 2/3*(GAME_HEIGHT - PITCH_Y * 2) ),
        rect(4, 1/3*(GAME_HEIGHT - PITCH_Y * 2)),
        // outline(0.6),
        area(),
        "wallleft2"
    ])
    
    add([
        pos(PITCH_X - 1/6*(GAME_HEIGHT - PITCH_Y * 2), PITCH_Y + 2/3*(GAME_HEIGHT - PITCH_Y * 2) ),
        rect(1/6*(GAME_HEIGHT - PITCH_Y * 2), 4),
        // outline(0.6),
        area(),
        "goalleftbottom"
    ])
    
    add([
        pos(PITCH_X - 1/6*(GAME_HEIGHT - PITCH_Y * 2), PITCH_Y + 1/3*(GAME_HEIGHT - PITCH_Y * 2) - 4 ),
        rect(1/6*(GAME_HEIGHT - PITCH_Y * 2), 4),
        // outline(0.6),
        area(),
        "goallefttop"
    ])
    
    add([
        pos(PITCH_X - 1/6*(GAME_HEIGHT - PITCH_Y * 2), PITCH_Y + 1/3*(GAME_HEIGHT - PITCH_Y * 2) ),
        rect(4, 1/3*(GAME_HEIGHT - PITCH_Y * 2)),
        // outline(0.6),
        area(),
        "goalleftleft"
    ])

    add([
        sprite('net'),
        pos(PITCH_X - 1/6*(GAME_HEIGHT - PITCH_Y * 2) + 4, PITCH_Y + 1/3*(GAME_HEIGHT - PITCH_Y * 2) ),
        scale(1/3*(GAME_HEIGHT - PITCH_Y * 2)/168),
        "leftnet",
    ])
    
    add([
        pos(PITCH_X, PITCH_Y),
        rect(GAME_WIDTH - PITCH_X * 2, 4),
        // outline(0.6),
        area(),
        "walltop"
    ])
    
    add([
        pos(GAME_WIDTH - 4 - PITCH_X, PITCH_Y),
        rect(4, 1/3*(GAME_HEIGHT - PITCH_Y * 2)),
        // outline(0.6),
        area(),
        "wallright1"
    ])
    
    add([
        pos(GAME_WIDTH - 4 - PITCH_X, PITCH_Y + 2/3*(GAME_HEIGHT - PITCH_Y * 2)),
        rect(4, 1/3*(GAME_HEIGHT - PITCH_Y * 2)),
        // outline(0.6),
        area(),
        "wallright2"
    ])
    
    add([
        pos(GAME_WIDTH - 4 - PITCH_X, PITCH_Y + 1/3*(GAME_HEIGHT - PITCH_Y * 2) - 4),
        rect(1/6*(GAME_HEIGHT - PITCH_Y * 2), 4),
        // outline(0.6),
        area(),
        "goalrighttop"
    ])
    
    add([
        pos(GAME_WIDTH - PITCH_X - 4 + 1/6*(GAME_HEIGHT - PITCH_Y * 2), PITCH_Y + 1/3*(GAME_HEIGHT - PITCH_Y * 2) - 4 ),
        rect(4, 1/3*(GAME_HEIGHT - PITCH_Y * 2) + 4),
        // outline(0.6),
        area(),
        "goalrightright"
    ])
    
    add([
        pos(GAME_WIDTH - PITCH_X, PITCH_Y + 2/3*(GAME_HEIGHT - PITCH_Y * 2) ),
        rect(1/6*(GAME_HEIGHT - PITCH_Y * 2), 4),
        // outline(0.6),
        area(),
        "goalrightbottom"
    ])
    
    add([
        sprite('net'),
        pos(GAME_WIDTH - 4 - PITCH_X, PITCH_Y + 1/3*(GAME_HEIGHT - PITCH_Y * 2)),
        scale(1/3*(GAME_HEIGHT - PITCH_Y * 2)/168),
        "rightnet"
    ])

    add([
        pos(PITCH_X, GAME_HEIGHT - 4 - PITCH_Y),
        rect(GAME_WIDTH - PITCH_X * 2, 4),
        // outline(0.6),
        area(),
        "wallbottom"
    ])
}

const handleShowLog = (blueScore, redScore, logGame) => {
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

const handleSaveLog = (logGame, player, teamGoal, isOG, time) => {
    if(logGame[teamGoal][player]) {
        logGame[teamGoal][player].push(`${time}${isOG ? "-OG" : ""}`);
    } else {
        logGame[teamGoal][player] = [`${time}${isOG ? "-OG" : ""}`];
    }
}

const resetBall = (ball) => {
    ball.value.x = 0;
    ball.value.y = 0;

    ball.moveTo(GAME_WIDTH / 2 - 256*SCALE_BALL/2, GAME_HEIGHT / 2 - 256*SCALE_BALL/2);
    every("player", (s) => {
        const {startX, startY} = s.value;
        s.moveTo(startX, startY)
    })
}

const handleShowGoal = (touchPlayer, touchTeam, time, teamGoal) => {
    // wait(2, () => {
    add([
        sprite("goal"),
        pos(GAME_WIDTH / 2 - 434/2, GAME_HEIGHT / 2 - 149/2),
        "goal"
    ])
    
    add([
        pos(GAME_WIDTH / 2 - 434/2 + 20, GAME_HEIGHT / 2 + 149/2),
        text(`${touchPlayer}  ${touchTeam !== teamGoal ? "(OG)" : ""} ${time}`, {
            size: 24,
        }),
        "goalplayer"
    ])
        
}

const game = (listPlayer, ballSrc, startTime) => {
    let isGoal = false;
    let isMove = false;
    let playerData = {};
    const logGame = {
        "blue": {},
        "red": {}
    }

    kaboom({
        background: [49, 217, 120],
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        fullscreen: true,
        debug: true,
    });

    loadSprite("circle", "/img/circlecenter.png");
    loadSprite('corn', '/img/corn.png');
    loadSprite('pencircle', '/img/circlepenalty.png')
    loadSprite('net', '/img/goal.png');
    loadSprite('goal', '/img/goal_text.png');
    loadSound("crowd", "/sound/crowd.mp3");
    loadSound("goal", "/sound/goal.mp3");
    loadSound("whistle", "/sound/whistle.mp3");
    loadSound("endwhistle", "/sound/endwhistle.mp3");
    loadSprite("ball", ballSrc);

    buildStadium();
    
    //play background music
    const music = play("crowd", {
        loop: true
    })

    //score board
    const blueScore = add([
        pos(GAME_WIDTH / 2 - 60, 8),
        text("0", {
            size: 20, // 48 pixels tall
            font: 'sinko'
        }),
        {value: 0},
        color(66, 180, 230)
    ])
    const time = add([
        pos(GAME_WIDTH / 2 - 30 , 8),
        text("", {
            size: 16,
            font: 'sinko',
        }),
        { value: startTime }
    ])
    const redScore = add([
        pos(GAME_WIDTH / 2 + 50, 8),
        text("0", {
            size: 20, // 48 pixels tall
            font: 'sinko'
        }),
        {value: 0},
        color(237, 62, 62)
    ])

    const ball = addBall();

    loop(1, () => {
        if(!isMove) return;
        if(time.value > 0) {
            --time.value;
            let minute = Math.floor(time.value/60);
            let second = time.value%60;
            if(minute < 10) {
                minute = "0" + minute;
            }
            if(second < 10) {
                second = "0" + second;
            }
            time.text = `${minute}:${second}`;
        }
        if(!isGoal && time.value === 0) {
            play("endwhistle");
            socket.emit('endgame');

            //stop move
            isMove = false;

            //stop ball
            ball.value.x = 0;
            ball.value.y = 0;
            wait(4, () => {
                handleShowLog(blueScore.text, redScore.text, logGame);
                music.pause();
                debug.paused = true;

                //destroy all game's object
                every((obj) => {
                    destroy(obj)
                })

                fullscreen(!isFullscreen());
                const canvas = $('canvas');
                canvas.remove();

                //return waiting screen
                $(".wait").style.display = "flex";
            })
        }
    })

    onUpdate('ball' , () => {
        const handleMoveBall = () => {
            if(Math.abs(ball.value.x) < 1 && Math.abs(ball.value.y) < 1) return;
    
            ball.value.x  = ball.value.x / 1.015;
            ball.value.y  = ball.value.y / 1.015;
    
            ball.move(ball.value.x, ball.value.y);
        }
        const handleGoal = () => {
            if(isGoal) return;
            if(ball.pos.x + ball.width * ball.scale.x <= PITCH_X) {
                shake(120)
                isGoal = 'red';
                redScore.value++;
                redScore.text = redScore.value;
                isMove = false;
                play("goal");
                wait(2, () => {
                    handleShowGoal(ball.value.touch, ball.value.touchTeam, time.text, "red");
                    wait(3, () => {
                        destroyAll("goal");
                        destroyAll("goalplayer");
                        isGoal = false;
                        resetBall(ball);
                        wait(2, () => {
                            play("whistle");
                            isMove = true;
                        })
                    })
                })
                handleSaveLog(logGame, ball.value.touch, "red", ball.value.touchTeam !== "red", time.text);
            }
            if(ball.pos.x >= (GAME_WIDTH - PITCH_X)) {
                shake(120);
                isGoal = 'blue';
                blueScore.value++;
                blueScore.text = blueScore.value;
                play("goal");
                isMove = false;
                wait(2, () => {
                    handleShowGoal(ball.value.touch, ball.value.touchTeam, time.text, "blue");
                    wait(3, () => {
                        destroyAll("goal");
                        destroyAll("goalplayer");
                        isGoal = false;
                        resetBall(ball);
                        wait(2, () => {
                            play("whistle");
                            isMove = true;
                        })
                    })
                })
                handleSaveLog(logGame, ball.value.touch, "blue", ball.value.touchTeam !== "blue", time.text);
            }
        }
        handleMoveBall();
        handleGoal();
    })

    const handleMove = (moveX, moveY, socketId) => {
        playerData[socketId].player.value.x = moveX;
        playerData[socketId].player.value.y = moveY;
    }

    socket.on("move", ({socketId, move}) => {
        if(!isMove) return;
        switch(move) {
            case "up": 
                handleMove(0, -STRAIGHT_SPEED, socketId);
                break;
            case "down":
                handleMove(0, STRAIGHT_SPEED, socketId);
                break;
            case "left":
                handleMove(-STRAIGHT_SPEED, 0, socketId);
                break;
            case "right":
                handleMove(STRAIGHT_SPEED, 0, socketId);
                break;
            case "up right":
                handleMove(DIAGONAL_SPEED, -DIAGONAL_SPEED, socketId);
                break;
            case "up left":
                handleMove(-DIAGONAL_SPEED, -DIAGONAL_SPEED, socketId);
                break;
            case "down left":
                handleMove(-DIAGONAL_SPEED, DIAGONAL_SPEED, socketId);
                break;
            case "down right":
                handleMove(DIAGONAL_SPEED, DIAGONAL_SPEED, socketId);
                break;
        }
    })
 

    //readd player
    addPlayer(listPlayer, playerData);

    onUpdate("player", (s) => {
        if(Math.abs(s.value.x) < 1 && Math.abs(s.value.y) < 1) return;
        s.value.x  = s.value.x / 1.08;
        s.value.y  = s.value.y / 1.08;
    
        s.move(s.value.x, s.value.y);
    })

    //whistle and start game
    wait(3, () => {
        play("whistle");
        isMove = true;
    })

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
    // img.classList.add(`img-${socketId}`);
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
// socket.on("player", ({socketId, player, team}) => {
//     $(`.img-${socketId}`).src = `/img/${team}${player}.png`;
//     listPlayer[socketId].player = player;
// })
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

    game(Object.values(listPlayer), $(".ball-choose").getAttribute("src"), 60 * Number($(".time-choose").getAttribute("time")));

    //open full screen
    if(!isFullscreen()) {
        fullscreen();
    }
}












