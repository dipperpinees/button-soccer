class Ball {
    constructor(ballSrc, playerData) {
        this.x = 0;
        this.y = 0;
        this.touchTeam = null;
        this.touchId = null;
        this.direction = "";
        this.ballSrc = ballSrc;
        this.playerData = playerData;
        this.touch = null;
    }

    render() {
        loadSprite("ball", this.ballSrc);
        this.ball = add([
            sprite("ball"),
            pos(GAME_WIDTH / 2 - WIDTH_BALL/2, GAME_HEIGHT / 2 - WIDTH_BALL/2),
            area(),
            scale(SCALE_BALL),
            "ball"
        ])
        this.handleCollides();
    }

    handleMoveBall () {
        if(Math.abs(this.x) < 1 && Math.abs(this.y) < 1) return;
        this.x  = this.x / 1.012;
        this.y  = this.y / 1.012;    
        this.ball.move(this.x, this.y);
    }

    handleKeepBall () {
        // const playerData[this.touchId].player.pos.x = playerData[this.touchId].player.pos.x;
        // const playerData[this.touchId].player.pos.y = playerData[this.touchId].player.pos.y;
        // const playerData[this.touchId].player.pos.x+WIDTH_PLAYER/2 = playerData[this.touchId].player.pos.x + WIDTH_PLAYER/2;
        // const playerData[this.touchId].player.pos.y + WIDTH_PLAYER/2 = playerData[this.touchId].player.pos.y + WIDTH_PLAYER/2;
        // handleMoveCam(playerData[this.touchId].player.pos.x,playerData[this.touchId].player.pos.y);
        switch(this.direction) {
            case "right": 
                this.ball.moveTo(this.playerData[this.touchId].player.pos.x + WIDTH_PLAYER/2 + WIDTH_PLAYER / 2, this.playerData[this.touchId].player.pos.y + WIDTH_PLAYER/2 - WIDTH_BALL / 2);
                break;
            case "left": 
                this.ball.moveTo(this.playerData[this.touchId].player.pos.x + WIDTH_PLAYER/2 - WIDTH_PLAYER / 2 - WIDTH_BALL , this.playerData[this.touchId].player.pos.y + WIDTH_PLAYER/2 - WIDTH_BALL / 2);
                break;
            case "up": 
                this.ball.moveTo(this.playerData[this.touchId].player.pos.x + WIDTH_PLAYER/2 - WIDTH_BALL / 2, this.playerData[this.touchId].player.pos.y + WIDTH_PLAYER/2 - WIDTH_PLAYER / 2 - WIDTH_BALL)
                break;
            case "down":
                this.ball.moveTo(this.playerData[this.touchId].player.pos.x + WIDTH_PLAYER/2 - WIDTH_BALL / 2, this.playerData[this.touchId].player.pos.y + WIDTH_PLAYER/2 + WIDTH_PLAYER / 2);
                break;
            case "up left":
                this.ball.moveTo(this.playerData[this.touchId].player.pos.x - WIDTH_BALL / 2, this.playerData[this.touchId].player.pos.y - WIDTH_BALL / 2);
                break;
            case "up right":
                this.ball.moveTo(this.playerData[this.touchId].player.pos.x + WIDTH_PLAYER - WIDTH_BALL / 2 , this.playerData[this.touchId].player.pos.y - WIDTH_BALL / 2)
                break;
            case "down right": 
                this.ball.moveTo(this.playerData[this.touchId].player.pos.x + WIDTH_PLAYER - WIDTH_BALL / 2, this.playerData[this.touchId].player.pos.y + WIDTH_PLAYER - WIDTH_BALL / 2 )
                break;
            case "down left": 
                this.ball.moveTo(this.playerData[this.touchId].player.pos.x - WIDTH_BALL / 2 , this.playerData[this.touchId].player.pos.y + WIDTH_PLAYER - WIDTH_BALL / 2 )
                break;
        }
    }

    update () {
        if(!this.touchId) {
            this.handleMoveBall();
            return;
        };
        this.handleKeepBall();
    }

    handleCollides() {
        this.ball.collides("wallleft",  () => {
            this.x = this.x * -1;
            this.ball.move(200, 0);
        })
    
    
        this.ball.collides("wallright",  () => {
            this.x = this.x * -1;
            this.ball.move(-200, 0);
        })
    
        this.ball.collides("wallbottom",  () => {
            this.y = this.y * -1;
            this.ball.move(0, -200);
        })
        
        this.ball.collides("walltop",  () => {
            this.y = this.y * -1;
            this.ball.move(0, 200);
        })
    }

    resetBall() {
        this.touchId = null;
        this.x = 0;
        this.y = 0;
        this.ball.moveTo(GAME_WIDTH / 2 - WIDTH_BALL/2, GAME_HEIGHT / 2 - WIDTH_BALL/2);
    }

    checkGoal() {
        if(this.ball.pos.x >= 0 && this.ball.pos.x + WIDTH_BALL <= PITCH_X && this.ball.pos.y>= PITCH_Y + 1/3*(STADIUM_HEIGHT) && this.ball.pos.y + WIDTH_BALL <= PITCH_Y + 2/3*(STADIUM_HEIGHT)) {
            return "red";
        }
        if(this.ball.pos.x <= GAME_WIDTH && this.ball.pos.x >= (GAME_WIDTH - PITCH_X) && this.ball.pos.y>= PITCH_Y + 1/3*(STADIUM_HEIGHT) && this.ball.pos.y + WIDTH_BALL <= PITCH_Y + 2/3*(STADIUM_HEIGHT)) {
            return "blue"
        }
    }

    shoot () {
        if(this.ball.pos.y <= PITCH_Y) {
            return;
        }
        if(this.ball.pos.y + WIDTH_BALL >= GAME_HEIGHT - PITCH_Y) {
            return;
        }
        if(this.ball.pos.x <= PITCH_X) {
            if(this.ball.pos.y <= PITCH_Y + STADIUM_HEIGHT * 1/3 ) {
                return;
            }

            if(this.ball.pos.y + WIDTH_BALL >= PITCH_Y + STADIUM_HEIGHT * 2/3) {
                return;
            }
        }
        if(this.ball.pos.x + WIDTH_BALL >= GAME_WIDTH - PITCH_X) {
            if(this.ball.pos.y <= PITCH_Y + STADIUM_HEIGHT * 1/3 ) {
                return;
            }

            if(this.ball.pos.y + WIDTH_BALL >= PITCH_Y + STADIUM_HEIGHT * 2/3) {
                return;
            }
        }
        this.touchId = null;
        switch(this.direction) {
            case "right": {
                this.x = STRAIGHT_BALL_SPEED;
                this.y = 0; 
                break;
            }
            case "left": {
                this.x = -STRAIGHT_BALL_SPEED;
                this.y = 0; 
                break;
            }
            case "up": {
                this.x = 0;
                this.y = -STRAIGHT_BALL_SPEED; 
                break;
            }
            case "down": {
                this.x = 0;
                this.y = STRAIGHT_BALL_SPEED; 
                break;
            }
            case "up left": {
                this.x = -DIAGONAL_BALL_SPEED;
                this.y = -DIAGONAL_BALL_SPEED;
                break;
            }
            case "up right": {
                this.x = DIAGONAL_BALL_SPEED;
                this.y = -DIAGONAL_BALL_SPEED;
                break;
            }
            case "down left": {
                this.x = -DIAGONAL_BALL_SPEED;
                this.y = DIAGONAL_BALL_SPEED;
                break;
            }
            case "down right": {
                this.x = DIAGONAL_BALL_SPEED;
                this.y = DIAGONAL_BALL_SPEED;
                break;
            }
        }
    }
}