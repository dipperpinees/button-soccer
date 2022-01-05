const game = (ballSrc, listPlayer, minute) => {
    // document.querySelector("#body").offsetWidth

    const GAME_WIDTH = screen.width;
    const GAME_HEIGHT = screen.height;
    const PITCH_X = GAME_WIDTH / 12;
    const PITCH_Y = GAME_HEIGHT / 16;
    const MOVE_SPEED = 200;
    const SCALE_BALL = GAME_HEIGHT / 16 / 300;
    const SCALE_PLAYER = GAME_HEIGHT / 18 / 256;
    kaboom({
        background: [49, 217, 120],
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        fullscreen: true,
        debug: true,
    });

    fullscreen(!isFullscreen())

    loadSprite("ball", ballSrc)
    loadSprite("circle", "/img/circlecenter.png");
    loadSprite('corn', '/img/corn.png');
    loadSprite('pencircle', '/img/circlepenalty.png')
    loadSprite('net', '/img/goal.png')
    loadSprite('goal', '/img/goal_text.png')

    const buildMap = () => {
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
    
    buildMap();

    //score
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
        text("08.00", {
            size: 16,
            font: 'sinko',
        }),
        { value: minute * 60 }
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
    loop(1, () => {
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
    })
    const STADIUM_WIDTH = GAME_WIDTH - PITCH_X * 2;
    const STADIUM_HEIGHT = GAME_HEIGHT - PITCH_Y * 2;

    const teamPos = {
        "blue": [
            {x: 3 / 8 * STADIUM_WIDTH + PITCH_X, y: GAME_HEIGHT / 2 - 300 * SCALE_PLAYER / 2},
            {x: 1 / 4 * STADIUM_WIDTH + PITCH_X, y: GAME_HEIGHT / 2 - 300 * SCALE_PLAYER / 2},
            {x: 1 / 4 * STADIUM_WIDTH + PITCH_X, y: PITCH_Y + 1/8 * STADIUM_HEIGHT},
            {x: 1 / 4 * STADIUM_WIDTH + PITCH_X, y: GAME_HEIGHT - PITCH_Y - 1/8 * STADIUM_HEIGHT - 300 * SCALE_PLAYER },
            {x: 1 / 8 * STADIUM_WIDTH + PITCH_X, y: GAME_HEIGHT - PITCH_Y - 1/4 * STADIUM_HEIGHT - 300 * SCALE_PLAYER },
            {x: 1 / 8 * STADIUM_WIDTH + PITCH_X, y: PITCH_Y + 1/4 * STADIUM_HEIGHT},
        ],
        "red": [
            {x: GAME_WIDTH - 300*SCALE_PLAYER -  3 / 8 * STADIUM_WIDTH - PITCH_X, y: GAME_HEIGHT / 2 - 300 * SCALE_PLAYER / 2},
            {x: GAME_WIDTH - 300*SCALE_PLAYER - 1 / 4 * STADIUM_WIDTH - PITCH_X, y: GAME_HEIGHT / 2 - 300 * SCALE_PLAYER / 2},
            {x: GAME_WIDTH - 300*SCALE_PLAYER- 1 / 4 * STADIUM_WIDTH - PITCH_X, y: PITCH_Y + 1/8 * STADIUM_HEIGHT},
            {x: GAME_WIDTH - 300*SCALE_PLAYER - 1 / 4 * STADIUM_WIDTH - PITCH_X, y: GAME_HEIGHT - PITCH_Y - 1/8 * STADIUM_HEIGHT - 300 * SCALE_PLAYER },
            {x: GAME_WIDTH - 300*SCALE_PLAYER - 1 / 8 * STADIUM_WIDTH - PITCH_X, y: GAME_HEIGHT - PITCH_Y - 1/4 * STADIUM_HEIGHT - 300 * SCALE_PLAYER },
            {x: GAME_WIDTH - 300*SCALE_PLAYER - 1 / 8 * STADIUM_WIDTH - PITCH_X, y: PITCH_Y + 1/4 * STADIUM_HEIGHT},
        ]
    }

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
    
        obj.collides("ball",  () => {
            ballSpeed.touch = name;
            ballSpeed.touchTeam = team;
            obj.move(8*(obj.pos.x-ball.pos.x), 8*(obj.pos.y-ball.pos.y));
            const vectoX = ball.pos.x-obj.pos.x;
            const vectoY = ball.pos.y-obj.pos.y;
            const countStepMove = Math.sqrt((Math.pow(MOVE_SPEED + 40, 2))/(Math.pow(vectoX, 2) +  Math.pow(vectoY, 2) ))
            ballSpeed.x += countStepMove * vectoX;
            ballSpeed.y += countStepMove * vectoY;
            ball.move(ballSpeed.x, ballSpeed.y)    
        })
    }

    let countBlue = -1;
    let countRed = -1;
    const playerData = {};
    listPlayer.forEach((player) => {
        const count = player.team === 'blue' ? ++countBlue : ++countRed;
        loadSprite(`${player.team}${player.player}`, `/img/${player.team}${player.player}.png`);
        playerData[player.socketId] = {};
        playerData[player.socketId]["defaultPos"] = {x: teamPos[player.team][count].x, y: teamPos[player.team][count].y}
        playerData[player.socketId]["player"] = add([
            sprite(`${player.team}${player.player}`),
            pos(teamPos[player.team][count].x, teamPos[player.team][count].y),
            area(),
            scale(SCALE_PLAYER),
            "player",
            "hehe",
            {value: player.socketId}
        ])
        handlePlayerCollide(playerData[player.socketId]["player"], player.name, player.team);
    })

    every("player", (s) => {
        s.collides("player", (t) => {
            console.log("va cham");
            s.move(8*(s.pos.x-t.pos.x), 8*(s.pos.y-t.pos.y));
        })
    })

    const ball = add([
        sprite("ball"),
        pos(GAME_WIDTH / 2 - 256*SCALE_BALL/2, GAME_HEIGHT / 2 - 256*SCALE_BALL/2),
        area(),
        scale(SCALE_BALL),
        "ball"
    ])

    
    const ballSpeed = {
        x: 0,
        y: 0,
        touch: null,
        touchTeam: null,
    }

    const resetGame = () => {
        ballSpeed.x = 0;
        ballSpeed.y = 0;

        ball.moveTo(GAME_WIDTH / 2 - 256*SCALE_BALL/2, GAME_HEIGHT / 2 - 256*SCALE_BALL/2);
        every("player", (s) => {
            const {x, y} = playerData[s.value].defaultPos;
            s.moveTo(x, y)
        })
    }

    
    let isGoal = false;
    let moveX = 0;
    let moveY = 0;

    const handleShowGoal = (touchPlayer, touchTeam, time, teamGoal) => {
        wait(2, () => {
            const goal = add([
                sprite("goal"),
                pos(GAME_WIDTH / 2 - 434/2, GAME_HEIGHT / 2 - 149/2),
                "goal"
            ])
        
            const goalPlayer = add([
                pos(GAME_WIDTH / 2 - 434/2 + 20, GAME_HEIGHT / 2 + 149/2),
                text(`${touchPlayer}  ${touchTeam !== teamGoal ? "(OG)" : ""} ${time}`, {
                    size: 24,
                }),
                "goalplayer"
            ])
            wait(4, () => {
                destroy(goal);
                destroy(goalPlayer)
                isGoal = false;
                resetGame();
            })
        })
    }

    onUpdate('ball' , () => {
        const handleMoveBall = () => {
            if(Math.abs(ballSpeed.x) < 1 && Math.abs(ballSpeed.y) < 1) return;
    
            ballSpeed.x  = ballSpeed.x / 1.015;
            ballSpeed.y  = ballSpeed.y / 1.015;
    
            ball.move(ballSpeed.x, ballSpeed.y);
        }
        const handleGoal = () => {
            if(isGoal) return;
            if(ball.pos.x + ball.width * ball.scale.x <= PITCH_X) {
                shake(120)
                isGoal = 'red';
                blueScore.value++;
                blueScore.text = blueScore.value;
                handleShowGoal(ballSpeed.touch, ballSpeed.touchTeam, time.text, "red");
            }
            if(ball.pos.x >= (GAME_WIDTH - PITCH_X)) {
                shake(120);
                isGoal = 'blue';
                redScore.value++;
                redScore.text = redScore.value;
                handleShowGoal(ballSpeed.touch, ballSpeed.touchTeam, time.text, "blue");
            }
        }
        handleMoveBall();
        handleGoal();
    })

    onUpdate(() => {
        if(Math.abs(moveX) < 1 && Math.abs(moveY) < 1) return;
        moveX  = moveX / 1.08;
        moveY  = moveY / 1.08;
    
        playerData["1"].player.move(moveX, moveY);
    })

    socket.on('move', (args) => {
        
        moveX = args.moveX;
        moveY = args.moveY;
    })
    
    
    onKeyDown("up", () => {
        playerData["1"].player.move(0, -MOVE_SPEED);
    })
    
    onKeyDown("down", () => {
        playerData["1"].player.move(0, MOVE_SPEED);
    })
    
    onKeyDown("right", () => {
        playerData["1"].player.move(MOVE_SPEED, 0);
    })
    
    onKeyDown("left", () => {
        playerData["1"].player.move(-MOVE_SPEED, 0);
    })
    
    // bean.collides('bean2', () => {
    //     bean.move(4*(bean.pos.x-bean2.pos.x), 4*(bean.pos.y-bean2.pos.y));
    //     bean2.move(4*(bean2.pos.x-bean.pos.x), 4*(bean2.pos.y-bean.pos.y))
    // })
    
    const handleBallCollide = () => {
        ball.collides("wallleft1",  () => {
            ballSpeed.x = ballSpeed.x * -1;
            ball.move(200, 0);
        })
        ball.collides("wallleft2",  () => {
            ballSpeed.x = ballSpeed.x * -1;
            ball.move(200, 0);
        })
        ball.collides("wallright1",  () => {
            ballSpeed.x = ballSpeed.x * -1;
            ball.move(-200, 0);
        })
        ball.collides("wallright2",  () => {
            ballSpeed.x = ballSpeed.x * -1;
            ball.move(-200, 0);
        })
        
        ball.collides("wallbottom",  () => {
            ballSpeed.y = ballSpeed.y * -1;
            ball.move(0, -200);
        })
        
        ball.collides("walltop",  () => {
            ballSpeed.y = ballSpeed.y * -1;
            ball.move(0, 200);
        })
    
        ball.collides("goallefttop",  () => {
            ballSpeed.y = ballSpeed.y * -1;
            ball.move(0, 200);
        })
        ball.collides("goalleftleft",  () => {
            ballSpeed.x = ballSpeed.x * -1;
            ball.move(200, 0);
        })
        ball.collides("goalleftbottom",  () => {
            ballSpeed.y = ballSpeed.y * -1;
            ball.move(0, -200);
        })
        ball.collides("goalrighttop",  () => {
            ballSpeed.y = ballSpeed.y * -1;
            ball.move(0, 200);
        })
        ball.collides("goalrightright",  () => {
            ballSpeed.x = ballSpeed.x * -1;
            ball.move(-200, 0);
        })
        ball.collides("goalrightbottom",  () => {
            ballSpeed.y = ballSpeed.y * -1;
            ball.move(0, -200);
        })
    }

    handleBallCollide();

}











