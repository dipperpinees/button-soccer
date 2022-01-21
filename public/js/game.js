$ = document.querySelector.bind(document);
$$ = document.querySelectorAll.bind(document);
const socket = io({query: {type: 'create'}});
const listBall = $$(".settings-ball li");
const listTime = $$(".settings-time li");
const listPlayer = {};

const game = (listPlayer, ballSrc, startTime) => {
    const GAME_WIDTH = window.screen.width * window.devicePixelRatio;
    const GAME_HEIGHT = window.screen.height * window.devicePixelRatio;
    const PITCH_X = GAME_WIDTH / 12;
    const PITCH_Y = GAME_HEIGHT / 16;
    const SCALE_BALL = GAME_HEIGHT / 27 / 256;
    const SCALE_PLAYER = GAME_HEIGHT / 23 / 100;
    const STADIUM_WIDTH = GAME_WIDTH - PITCH_X * 2;
    const STADIUM_HEIGHT = GAME_HEIGHT - PITCH_Y * 2;
    const STRAIGHT_PLAYER_SPEED = GAME_WIDTH / 7;
    const DIAGONAL_PLAYER_SPEED = STRAIGHT_PLAYER_SPEED/2 * Math.sqrt(2);
    const STRAIGHT_BALL_SPEED = GAME_WIDTH / 3.4;
    const DIAGONAL_BALL_SPEED = STRAIGHT_BALL_SPEED/2 * Math.sqrt(2);
    const WIDTH_PLAYER = 100 * SCALE_PLAYER;
    const WIDTH_BALL = 256 * SCALE_BALL;
    const SCALE_CORN = GAME_HEIGHT / 20 / 250;
    const SCALE_CENTER_CIRCLE = GAME_HEIGHT / 4 / 500;
    const SCALE_GOAL = GAME_HEIGHT / 4 / 149;
    let isGoal = false;
    let isMove = false;
    let playerData = {};
    const logGame = {
        "blue": {},
        "red": {}
    }
    const teamPos = {
        "blue": [
            {x: 3 / 8 * STADIUM_WIDTH + PITCH_X, y: GAME_HEIGHT / 2 - WIDTH_PLAYER / 2},
            {x: 1 / 4 * STADIUM_WIDTH + PITCH_X, y: GAME_HEIGHT / 2 - WIDTH_PLAYER / 2},
            {x: 1 / 4 * STADIUM_WIDTH + PITCH_X, y: PITCH_Y + 1/8 * STADIUM_HEIGHT},
            {x: 1 / 4 * STADIUM_WIDTH + PITCH_X, y: GAME_HEIGHT - PITCH_Y - 1/8 * STADIUM_HEIGHT - WIDTH_PLAYER },
            {x: 1 / 8 * STADIUM_WIDTH + PITCH_X, y: GAME_HEIGHT - PITCH_Y - 1/4 * STADIUM_HEIGHT - WIDTH_PLAYER },
            {x: 1 / 8 * STADIUM_WIDTH + PITCH_X, y: PITCH_Y + 1/4 * STADIUM_HEIGHT},
        ],
        "red": [
            {x: GAME_WIDTH - WIDTH_PLAYER -  3 / 8 * STADIUM_WIDTH - PITCH_X, y: GAME_HEIGHT / 2 - WIDTH_PLAYER / 2},
            {x: GAME_WIDTH - WIDTH_PLAYER - 1 / 4 * STADIUM_WIDTH - PITCH_X, y: GAME_HEIGHT / 2 - WIDTH_PLAYER / 2},
            {x: GAME_WIDTH - WIDTH_PLAYER- 1 / 4 * STADIUM_WIDTH - PITCH_X, y: PITCH_Y + 1/8 * STADIUM_HEIGHT},
            {x: GAME_WIDTH - WIDTH_PLAYER - 1 / 4 * STADIUM_WIDTH - PITCH_X, y: GAME_HEIGHT - PITCH_Y - 1/8 * STADIUM_HEIGHT - WIDTH_PLAYER },
            {x: GAME_WIDTH - WIDTH_PLAYER - 1 / 8 * STADIUM_WIDTH - PITCH_X, y: GAME_HEIGHT - PITCH_Y - 1/4 * STADIUM_HEIGHT - WIDTH_PLAYER },
            {x: GAME_WIDTH - WIDTH_PLAYER - 1 / 8 * STADIUM_WIDTH - PITCH_X, y: PITCH_Y + 1/4 * STADIUM_HEIGHT},
        ]
    }

    kaboom({
        background: [49, 217, 120],
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        fullscreen: true,
        scale: Number($(".graphics").value),
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
    
    const handleAvatar = (avatar, team) => {
        if(team === "blue") {
            return avatar.replace(",r_max/", `,r_max,bo_6px_solid_royalblue/`);
        } else {
            return avatar.replace(",r_max/", `,r_max,bo_6px_solid_indianred/`);
        }
    }
    
    const addPlayer = async (listPlayer, playerData) => {
        const handlePlayerCollide = (obj, name, team, socketId) => {
            obj.collides("wallleft",  () => {
                obj.move(STRAIGHT_PLAYER_SPEED*2.5, 0);
            })
            obj.collides("wallright",  () => {
                obj.move(-STRAIGHT_PLAYER_SPEED*2.5, 0);
            })
            obj.collides("walltop",  () => {
                obj.move(0, STRAIGHT_PLAYER_SPEED*2.5);
            })
            obj.collides("wallbottom",  () => {
                obj.move(0, -STRAIGHT_PLAYER_SPEED*2.5);
            })
        
            obj.collides("ball",  (s) => {
                if(s.value.touchId === socketId) {
                    return;
                }
                s.value.touch = name;
                s.value.touchTeam = team;
                s.value.touchId = socketId;
                s.value.direction = playerData[socketId].player.value.direction;
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
                {value: {name: player.name, socketId: player.socketId, team: player.team, startX: teamPos[player.team][count].x, startY: teamPos[player.team][count].y, x: 0, y: 0, direction: "top"}}
            ])
        })
    
        every("player", (s) => {
            s.collides("player", (t) => {
                s.move(6*(s.pos.x-t.pos.x), 6*(s.pos.y-t.pos.y));
            })
    
            handlePlayerCollide(s, s.value.name, s.value.team, s.value.socketId);
        })
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
            pos(GAME_WIDTH / 2- 500*SCALE_CENTER_CIRCLE / 2, GAME_HEIGHT / 2 - 500*SCALE_CENTER_CIRCLE / 2),
            // circle(100),
            sprite('circle'),
            scale(SCALE_CENTER_CIRCLE),
            "linecircle"
        ])
        add([
            pos(PITCH_X, GAME_HEIGHT - PITCH_Y - SCALE_CORN * 250),
            sprite('corn'),
            scale(SCALE_CORN),
            "bottomleftcorn"
        ])
    
        add([
            pos(PITCH_X + SCALE_CORN * 250, PITCH_Y),
            sprite('corn'),
            scale(SCALE_CORN),
            rotate(90),
            "topleftcorn"
        ])
    
        add([
            pos(GAME_WIDTH - PITCH_X , PITCH_Y + SCALE_CORN * 250),
            sprite('corn'),
            scale(SCALE_CORN),
            rotate(180),
            "toprightcorn"
        ])
    
        add([
            pos(GAME_WIDTH - PITCH_X - SCALE_CORN * 250 , GAME_HEIGHT - PITCH_Y),
            sprite('corn'),
            scale(SCALE_CORN),
            rotate(270),
            "bottomrightcorn"
        ])
    
        add([
            pos(GAME_WIDTH / 2 - 2, PITCH_Y),
            rect(4, STADIUM_HEIGHT),
            "linecenter"
        ])
    
        add([
            pos(GAME_WIDTH / 2, GAME_HEIGHT / 2),
            circle(8),
            "centerdot"
        ])
    
        add([
            pos(PITCH_X, PITCH_Y + 1/4 * (STADIUM_HEIGHT)),
            rect( 1/8 * (STADIUM_WIDTH), 4),
            "penlefttop"
        ])
    
        add([
            pos(PITCH_X, PITCH_Y + 3/4 * (STADIUM_HEIGHT)),
            rect( 1/8 * (STADIUM_WIDTH), 4),
            "penleftbottom"
        ])
    
        add([
            pos(PITCH_X + 1/8 * (STADIUM_WIDTH), PITCH_Y + 1/4 * (STADIUM_HEIGHT)),
            rect( 4, 1/2 * (STADIUM_HEIGHT) + 4),
            "penleftright"
        ])
    
        add([
            sprite('pencircle'),
            pos(PITCH_X + 1/8 * (STADIUM_WIDTH) + 4, PITCH_Y + 1/3 * STADIUM_HEIGHT ),
            scale(1/3 * (STADIUM_HEIGHT) / 472),
            'penleftcirle'
        ])
    
        add([
            pos(GAME_WIDTH - PITCH_X - 1/8 * (STADIUM_WIDTH), PITCH_Y + 1/4 * STADIUM_HEIGHT),
            rect( 1/8 * (STADIUM_WIDTH), 4),
            "penrighttop"
        ])
    
        add([
            pos(GAME_WIDTH - PITCH_X - 1/8 * (STADIUM_WIDTH), PITCH_Y + 1/4 * STADIUM_HEIGHT),
            rect( 4, 1/2 * (STADIUM_HEIGHT) + 4),
            "penrightleft"
        ])
    
        add([
            pos(GAME_WIDTH - PITCH_X - 1/8 * (STADIUM_WIDTH), PITCH_Y + 3/4 * STADIUM_HEIGHT),
            rect( 1/8 * (STADIUM_WIDTH), 4),
            "penrightbottom"
        ])
    
        add([
            sprite('pencircle'),
            pos(GAME_WIDTH - PITCH_X - 1/8 * (STADIUM_WIDTH) + 4, PITCH_Y + 2/3 * STADIUM_HEIGHT),
            scale(1/3 * (STADIUM_HEIGHT) / 472),
            rotate(180),
            'penleftcirle'
        ])
    
        add([
            pos(PITCH_X, PITCH_Y),
            rect(4, 1/3*(STADIUM_HEIGHT)),
            // outline(0.6),
            area(),
            "wallleft",
        ])
        
        add([
            pos(PITCH_X, PITCH_Y + 2/3*(STADIUM_HEIGHT) ),
            rect(4, 1/3*(STADIUM_HEIGHT)),
            // outline(0.6),
            area(),
            "wallleft"
        ])
        
        add([
            pos(PITCH_X - 1/6*(STADIUM_HEIGHT), PITCH_Y + 2/3*(STADIUM_HEIGHT) ),
            rect(1/6*(STADIUM_HEIGHT), 4),
            // outline(0.6),
            area(),
            "wallbottom"
        ])
        
        add([
            pos(PITCH_X - 1/6*(STADIUM_HEIGHT), PITCH_Y + 1/3*(STADIUM_HEIGHT) - 4 ),
            rect(1/6*(STADIUM_HEIGHT), 4),
            // outline(0.6),
            area(),
            "walltop"
        ])
        
        add([
            pos(PITCH_X - 1/6*(STADIUM_HEIGHT), PITCH_Y + 1/3*(STADIUM_HEIGHT) ),
            rect(4, 1/3*(STADIUM_HEIGHT)),
            // outline(0.6),
            area(),
            "wallleft"
        ])
    
        add([
            sprite('net'),
            pos(PITCH_X - 1/6*(STADIUM_HEIGHT) + 4, PITCH_Y + 1/3*(STADIUM_HEIGHT) ),
            scale(1/3*(STADIUM_HEIGHT)/168),
            "leftnet",
        ])
        
        add([
            pos(PITCH_X, PITCH_Y),
            rect(STADIUM_WIDTH, 4),
            // outline(0.6),
            area(),
            "walltop"
        ])
        
        add([
            pos(GAME_WIDTH - 4 - PITCH_X, PITCH_Y),
            rect(4, 1/3*(STADIUM_HEIGHT)),
            // outline(0.6),
            area(),
            "wallright"
        ])
        
        add([
            pos(GAME_WIDTH - 4 - PITCH_X, PITCH_Y + 2/3*(STADIUM_HEIGHT)),
            rect(4, 1/3*(STADIUM_HEIGHT)),
            // outline(0.6),
            area(),
            "wallright"
        ])
        
        add([
            pos(GAME_WIDTH - 4 - PITCH_X, PITCH_Y + 1/3*(STADIUM_HEIGHT) - 4),
            rect(1/6*(STADIUM_HEIGHT), 4),
            // outline(0.6),
            area(),
            "walltop"
        ])
        
        add([
            pos(GAME_WIDTH - PITCH_X - 4 + 1/6*(STADIUM_HEIGHT), PITCH_Y + 1/3*(STADIUM_HEIGHT) - 4 ),
            rect(4, 1/3*(STADIUM_HEIGHT) + 4),
            // outline(0.6),
            area(),
            "wallright"
        ])
        
        add([
            pos(GAME_WIDTH - PITCH_X, PITCH_Y + 2/3*(STADIUM_HEIGHT) ),
            rect(1/6*(STADIUM_HEIGHT), 4),
            // outline(0.6),
            area(),
            "wallbottom"
        ])
        
        add([
            sprite('net'),
            pos(GAME_WIDTH - 4 - PITCH_X, PITCH_Y + 1/3*(STADIUM_HEIGHT)),
            scale(1/3*(STADIUM_HEIGHT)/168),
            "rightnet"
        ])
    
        add([
            pos(PITCH_X, GAME_HEIGHT - 4 - PITCH_Y),
            rect(STADIUM_WIDTH, 4),
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
        ball.value.touchId = null;
        ball.value.x = 0;
        ball.value.y = 0;
        
        ball.moveTo(GAME_WIDTH / 2 - WIDTH_BALL/2, GAME_HEIGHT / 2 - WIDTH_BALL/2);
        every("player", (s) => {
            const {startX, startY} = s.value;
            s.moveTo(startX, startY)
        })
    }
    
    const handleShowGoal = (touchPlayer, touchTeam, time, teamGoal) => {
        // wait(2, () => {
        add([
            sprite("goal"),
            pos(GAME_WIDTH / 2 - SCALE_GOAL*434/2, GAME_HEIGHT / 2 - SCALE_GOAL*149/2),
            scale(SCALE_GOAL),
            "goal",
        ])
        
        add([
            pos(GAME_WIDTH / 2 - SCALE_GOAL*434/2 + 40, GAME_HEIGHT / 2 + SCALE_GOAL*149/2),
            text(`${touchPlayer}  ${touchTeam !== teamGoal ? "(OG)" : ""} ${time}`, {
                size: GAME_HEIGHT / 30,
            }),
            "goalplayer"
        ])
            
    }

    buildStadium();
    
    //play background music
    const music = play("crowd", {
        loop: true
    })

    //score board
    const blueScore = add([
        pos(GAME_WIDTH / 2 - GAME_WIDTH / 14, GAME_HEIGHT / 80),
        text("0", {
            size: GAME_WIDTH / 40, // 48 pixels tall
            font: 'sinko'
        }),
        {value: 0},
        color(66, 180, 230)
    ])
    const time = add([
        pos(GAME_WIDTH / 2  - GAME_WIDTH / 26, GAME_HEIGHT / 80),
        text("", {
            size: GAME_WIDTH / 50,
            font: 'sinko',
        }),
        { value: startTime }
    ])
    const redScore = add([
        pos(GAME_WIDTH / 2 + GAME_WIDTH / 16, GAME_HEIGHT / 80),
        text("0", {
            size: GAME_WIDTH / 40, // 48 pixels tall
            font: 'sinko'
        }),
        {value: 0},
        color(237, 62, 62)
    ])

    //readd player
    addPlayer(listPlayer, playerData);

    const ball = add([
        sprite("ball"),
        pos(GAME_WIDTH / 2 - WIDTH_BALL/2, GAME_HEIGHT / 2 - WIDTH_BALL/2),
        area(),
        scale(SCALE_BALL),
        {value: {x: 0, y: 0, touch: null, touchTeam: null, touchId: null, direction: ""}},
        "ball"
    ])

    ball.collides("wallleft",  () => {
        ball.value.x = ball.value.x * -1;
        ball.move(200, 0);
    })


    ball.collides("wallright",  () => {
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

    const handleKeepBall = (direction) => {
        const playerPosX = playerData[ball.value.touchId].player.pos.x;
        const playerPosY = playerData[ball.value.touchId].player.pos.y;
        const playerCenterX = playerPosX + WIDTH_PLAYER/2;
        const playerCenterY = playerPosY + WIDTH_PLAYER/2;
        switch(direction) {
            case "right": 
                ball.moveTo(playerCenterX + WIDTH_PLAYER / 2, playerCenterY - WIDTH_BALL / 2);
                break;
            case "left": 
                ball.moveTo(playerCenterX - WIDTH_PLAYER / 2 - WIDTH_BALL , playerCenterY - WIDTH_BALL / 2);
                break;
            case "up": 
                ball.moveTo(playerCenterX - WIDTH_BALL / 2, playerCenterY - WIDTH_PLAYER / 2 - WIDTH_BALL)
                break;
            case "down":
                ball.moveTo(playerCenterX - WIDTH_BALL / 2, playerCenterY + WIDTH_PLAYER / 2);
                break;
            case "up left":
                ball.moveTo(playerPosX - WIDTH_BALL / 2, playerPosY - WIDTH_BALL / 2);
                break;
            case "up right":
                ball.moveTo(playerPosX + WIDTH_PLAYER - WIDTH_BALL / 2 , playerPosY - WIDTH_BALL / 2)
                break;
            case "down right": 
                ball.moveTo(playerPosX + WIDTH_PLAYER - WIDTH_BALL / 2, playerPosY + WIDTH_PLAYER - WIDTH_BALL / 2 )
                break;
            case "down left": 
                ball.moveTo(playerPosX - WIDTH_BALL / 2 , playerPosY + WIDTH_PLAYER - WIDTH_BALL / 2 )
                break;
        }
    }

    const handleGoal = () => {
        if(isGoal) return;
        if(ball.pos.x >= 0 && ball.pos.x + WIDTH_BALL <= PITCH_X && ball.pos.y>= PITCH_Y + 1/3*(STADIUM_HEIGHT) && ball.pos.y + WIDTH_BALL <= PITCH_Y + 2/3*(STADIUM_HEIGHT)) {
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
        if(ball.pos.x <= GAME_WIDTH && ball.pos.x >= (GAME_WIDTH - PITCH_X) && ball.pos.y>= PITCH_Y + 1/3*(STADIUM_HEIGHT) && ball.pos.y + WIDTH_BALL <= PITCH_Y + 2/3*(STADIUM_HEIGHT)) {
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

    const handleMoveBall = () => {
        if(Math.abs(ball.value.x) < 1 && Math.abs(ball.value.y) < 1) return;

        ball.value.x  = ball.value.x / 1.012;
        ball.value.y  = ball.value.y / 1.012;

        ball.move(ball.value.x, ball.value.y);
    }

    onUpdate('ball' , () => {
        handleGoal();
        
        if(!ball.value.touchId) {
            handleMoveBall();
            return;
        };
        handleKeepBall(ball.value.direction);

    })

    const handleMove = (moveX, moveY, socketId, direction) => {
        playerData[socketId].player.value.x = moveX;
        playerData[socketId].player.value.y = moveY;
        playerData[socketId].player.value.direction = direction;
    }

    socket.on("move", ({socketId, move}) => {
        if(!isMove) return;
        if(socketId === ball.value.touchId) {
            ball.value.direction = move;
        }
        switch(move) {
            case "up": 
                handleMove(0, -STRAIGHT_PLAYER_SPEED, socketId, move);
                break;
            case "down":
                handleMove(0, STRAIGHT_PLAYER_SPEED, socketId, move);
                break;
            case "left":
                handleMove(-STRAIGHT_PLAYER_SPEED, 0, socketId, move);
                break;
            case "right":
                handleMove(STRAIGHT_PLAYER_SPEED, 0, socketId, move);
                break;
            case "up right":
                handleMove(DIAGONAL_PLAYER_SPEED, -DIAGONAL_PLAYER_SPEED, socketId, move);
                break;
            case "up left":
                handleMove(-DIAGONAL_PLAYER_SPEED, -DIAGONAL_PLAYER_SPEED, socketId, move);
                break;
            case "down left":
                handleMove(-DIAGONAL_PLAYER_SPEED, DIAGONAL_PLAYER_SPEED, socketId, move);
                break;
            case "down right":
                handleMove(DIAGONAL_PLAYER_SPEED, DIAGONAL_PLAYER_SPEED, socketId), move;
                break;
        }
    })

    const handleShoot = (direction) => {
        if(ball.pos.y <= PITCH_Y) {
            return;
        }
        if(ball.pos.y + WIDTH_BALL >= GAME_HEIGHT - PITCH_Y) {
            return;
        }
        if(ball.pos.x <= PITCH_X) {
            if(ball.pos.y <= PITCH_Y + STADIUM_HEIGHT * 1/3 ) {
                return;
            }

            if(ball.pos.y + WIDTH_BALL >= PITCH_Y + STADIUM_HEIGHT * 2/3) {
                return;
            }
        }
        if(ball.pos.x + WIDTH_BALL >= GAME_WIDTH - PITCH_X) {
            if(ball.pos.y <= PITCH_Y + STADIUM_HEIGHT * 1/3 ) {
                return;
            }

            if(ball.pos.y + WIDTH_BALL >= PITCH_Y + STADIUM_HEIGHT * 2/3) {
                return;
            }
        }
        ball.value.touchId = null;
        switch(direction) {
            case "right": {
               ball.value.x = STRAIGHT_BALL_SPEED;
               ball.value.y = 0; 
               break;
            }
            case "left": {
                ball.value.x = -STRAIGHT_BALL_SPEED;
                ball.value.y = 0; 
                break;
            }
            case "up": {
                ball.value.x = 0;
                ball.value.y = -STRAIGHT_BALL_SPEED; 
                break;
            }
            case "down": {
                ball.value.x = 0;
                ball.value.y = STRAIGHT_BALL_SPEED; 
                break;
            }
            case "up left": {
                ball.value.x = -DIAGONAL_BALL_SPEED;
                ball.value.y = -DIAGONAL_BALL_SPEED;
                break;
            }
            case "up right": {
                ball.value.x = DIAGONAL_BALL_SPEED;
                ball.value.y = -DIAGONAL_BALL_SPEED;
                break;
            }
            case "down left": {
                ball.value.x = -DIAGONAL_BALL_SPEED;
                ball.value.y = DIAGONAL_BALL_SPEED;
                break;
            }
            case "down right": {
                ball.value.x = DIAGONAL_BALL_SPEED;
                ball.value.y = DIAGONAL_BALL_SPEED;
                break;
            }
        }
    }

    socket.on("shoot", ({socketId}) => {
        if(ball.value.touchId === socketId) {
            handleShoot(ball.value.direction);
        }
    })

    onKeyDown("up", () => {
        handleMove(0, -STRAIGHT_PLAYER_SPEED, "test");
        if("test" === ball.value.touchId) {
            ball.value.direction = "up";
        }   
    })

    // onKeyDown("down", () => {
    //     if("test" === ball.value.touchId) {
    //         ball.value.direction = "down";
    //     }
    //     handleMove(0, STRAIGHT_PLAYER_SPEED, "test");
    // })

    // onKeyDown("right", () => {
    //     if("test" === ball.value.touchId) {
    //         ball.value.direction = "right";
    //     }
    //     handleMove(STRAIGHT_PLAYER_SPEED, 0, "test");
    // })

    // onKeyDown("left", () => {
    //     if("test" === ball.value.touchId) {
    //         ball.value.direction = "left";
    //     }
    //     handleMove(-STRAIGHT_PLAYER_SPEED, 0, "test");
    // })

    // onKeyDown("space", () => {
    //     handleShoot(ball.value.direction);
    // })

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

    game(Object.values(listPlayer), $(".ball-choose").getAttribute("src"), 60 * Number($(".time-choose").getAttribute("time")));

    //open full screen
    if(!isFullscreen()) {
        fullscreen();
    }
}












