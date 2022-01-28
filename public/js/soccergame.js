"use strict"
class Game {
    constructor(listPlayer, ballSrc, startTime, scaleGraphic) {
        this.isGoal = false;
        this.isMove = false;
        this.playerData = {};
        this.logGame = {
            "blue": {},
            "red": {}
        }
        this.listPlayer = listPlayer;
        this.scaleGraphic = scaleGraphic;
        this.stadium = new Stadium();
        this.ball = new Ball(ballSrc, this.playerData);
        this.scoreBoard = new ScoreBoard(startTime);
        this.sound = new Sound();
    }
    
    addListPlayer () {
        let countBlue = -1;
        let countRed = -1;
        this.listPlayer.forEach( (player) => {
            const count = player.team === 'blue' ? ++countBlue : ++countRed;
            const posX = TEAM_POSITION[player.team][count].x;
            const posY = TEAM_POSITION[player.team][count].y;
            const currentPlayer = new Player(player, posX, posY);
            this.handleCollidesPlayerAndBall(currentPlayer);
            this.playerData[player.socketId] = currentPlayer;
        })
    }

    handleShowLog (blueScore, redScore, logGame) {
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

    handleSocket() {
        socket.on("move", ({socketId, move}) => {
            if(!this.isMove) return;
            if(socketId === this.ball.touchId) {
                this.ball.direction = move;
            }
            switch(move) {
                case "up": 
                    this.playerData[socketId].handleMove(0, -STRAIGHT_PLAYER_SPEED, move)
                    break;
                case "down":
                    this.playerData[socketId].handleMove(0, STRAIGHT_PLAYER_SPEED, move);
                    break;
                case "left":
                    this.playerData[socketId].handleMove(-STRAIGHT_PLAYER_SPEED, 0, move);
                    break;
                case "right":
                    this.playerData[socketId].handleMove(STRAIGHT_PLAYER_SPEED, 0, move);
                    break;
                case "up right":
                    this.playerData[socketId].handleMove(DIAGONAL_PLAYER_SPEED, -DIAGONAL_PLAYER_SPEED, move);
                    break;
                case "up left":
                    this.playerData[socketId].handleMove(-DIAGONAL_PLAYER_SPEED, -DIAGONAL_PLAYER_SPEED, move);
                    break;
                case "down left":
                    this.playerData[socketId].handleMove(-DIAGONAL_PLAYER_SPEED, DIAGONAL_PLAYER_SPEED, move);
                    break;
                case "down right":
                    this.playerData[socketId].handleMove(DIAGONAL_PLAYER_SPEED, DIAGONAL_PLAYER_SPEED, move);
                    break;
            }
        })

        socket.on("shoot", ({socketId}) => {
            if(this.ball.touchId === socketId) {
                this.ball.shoot();
            }
        })
    }

    handleCollidesPlayerAndBall (player) {
        player.player.collides("ball", () => {
            if(this.ball.touchId === player.socketId) {
                return;
            }
            this.ball.touch = player.name;
            this.ball.touchTeam = player.team;
            this.ball.touchId = player.socketId;
            this.ball.direction = player.direction;
        })
    }

    destroy() {
        this.sound.pause();
        debug.paused = true 
        //destroy all game's object
        every((obj) => {
            destroy(obj)
        })
        fullscreen(!isFullscreen());
        const canvas = $('canvas');
        canvas.remove() 
        //return waiting screen
        $(".wait").style.display = "flex";
    }

    countTime() {
        loop(1, () => {
            if(!this.isMove) return;
            this.scoreBoard.countTime();
            if(!this.isGoal && this.scoreBoard.time === 0) {
                this.sound.playEndWhistle();
                socket.emit('endgame');
    
                //stop move
                this.isMove = false;
    
                //stop ball
                this.ball.x = 0;
                this.ball.y = 0;
                wait(4, () => {
                    this.handleShowLog(this.scoreBoard.blueScore.text, this.scoreBoard.redScore.text, this.logGame);
                    this.destroy();
                })
            }
        })
    }

    resetAfterGoal () {
        this.ball.resetBall();
        every("player", (s) => {
            s.moveTo(s.value.startX, s.value.startY);
        })
    }

    handleGoal () {
        if(this.isGoal) return;
        this.isGoal = this.ball.checkGoal();
        if(this.isGoal === "blue") {
            shake(120);
            this.scoreBoard.goalBlue();
            this.isMove = false;
            this.handleSaveLog(this.ball.touch, "blue", this.ball.touchTeam !== "blue", this.scoreBoard.timeBoard.text)
            this.sound.playGoal();
            wait(2, () => {
                const goal = new Goal(this.ball.touch, this.ball.touchTeam, "blue", this.scoreBoard.timeBoard.text, camPos().x, camPos().y);
                goal.render();
                wait(3, () => {
                    this.isGoal = false;
                    this.resetAfterGoal();
                    goal.destroy();
                    wait(2, () => {
                        this.sound.playWhistle();
                        this.isMove = true;
                    })
                })
            })
        }
        if(this.isGoal === "red") {
            shake(120);
            this.scoreBoard.goalRed();
            this.isMove = false;
            this.handleSaveLog(this.ball.touch, "red", this.ball.touchTeam !== "red", this.scoreBoard.timeBoard.text)
            this.sound.playGoal();
            wait(2, () => {
                const goal = new Goal(this.ball.touch, this.ball.touchTeam, "red", this.scoreBoard.timeBoard.text, camPos().x, camPos().y);
                goal.render();
                wait(3, () => {
                    this.isGoal = false;
                    this.resetAfterGoal();
                    goal.destroy();
                    wait(2, () => {
                        this.sound.playWhistle();
                        this.isMove = true;
                    })
                })
            })
        }
    }  
    
    handleMoveCam (posX, posY) {
        // && y>GAME_HEIGHT/(CAM_SCALE*2) && y < GAME_HEIGHT - GAME_HEIGHT/(CAM_SCALE*2)
        if(posX < GAME_WIDTH/(CAM_SCALE*2)) {
            posX = GAME_WIDTH/(CAM_SCALE*2);
        }
        if(posX > GAME_WIDTH - GAME_WIDTH/(CAM_SCALE*2)) {
            posX = GAME_WIDTH - GAME_WIDTH/(CAM_SCALE*2);
        }
        if(posY < GAME_HEIGHT/(CAM_SCALE*2) ) {
            posY =GAME_HEIGHT/(CAM_SCALE*2);
        }
        if(posY > GAME_HEIGHT - GAME_HEIGHT/(CAM_SCALE*2)) {
            posY = GAME_HEIGHT - GAME_HEIGHT/(CAM_SCALE*2);
        }
        if(posX !== camPos().x || posY !== camPos().y) {
            camPos(posX, posY);
            this.scoreBoard.move(posX, posY);
        }
    }

    handleSaveLog (player, teamGoal, isOG, time) {
        if(this.logGame[teamGoal][player]) {
            this.logGame[teamGoal][player].push(`${time}${isOG ? "-OG" : ""}`);
        } else {
            this.logGame[teamGoal][player] = [`${time}${isOG ? "-OG" : ""}`];
        }
    }

    update() {
        onUpdate("ball", () => {
            this.handleGoal();
            if(!this.ball.touchId) {
                this.ball.handleMoveBall();
                this.handleMoveCam(this.ball.ball.pos.x, this.ball.ball.pos.y);
                return;
            };
            this.ball.handleKeepBall();
            this.handleMoveCam(this.playerData[this.ball.touchId].player.pos.x, this.playerData[this.ball.touchId].player.pos.y);
        })
        onUpdate("player", (s) => {
            s.movePlayer();
        })
    }

    start () {
        kaboom({
            background: [49, 217, 120],
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
            fullscreen: true,
            scale: this.scaleGraphic,
            debug: true,
        });
        camScale(CAM_SCALE);
        camPos(GAME_WIDTH/2, GAME_HEIGHT/2);
        this.stadium.render();
        this.ball.render();
        this.scoreBoard.render();
        this.addListPlayer();
        this.update();

        //add socket
        this.handleSocket();

        //descrease time
        this.countTime();

        //load sound and play crowd sound
        this.sound.loadSound();
        this.sound.playBg();

        //whistle and start game
        wait(3, () => {
            this.sound.playWhistle();
            this.isMove = true;
        })
    }
}