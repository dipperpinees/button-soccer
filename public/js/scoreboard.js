class ScoreBoard {
    constructor(startTime) {
        this.time = startTime;
    }

    render() {
        this.blueScore = add([
            pos(GAME_WIDTH / 2 - GAME_WIDTH / 18,GAME_HEIGHT/2 - GAME_HEIGHT/(CAM_SCALE*2) + GAME_HEIGHT / 80),
            text("0", {
                size: GAME_WIDTH / 50, // 48 pixels tall
                font: 'sinko'
            }),
            {value: 0},
            color(66, 180, 230)
        ])
    
        this.timeBoard = add([
            pos(GAME_WIDTH / 2  - GAME_WIDTH / 36, GAME_HEIGHT/2 - GAME_HEIGHT/(CAM_SCALE*2) + GAME_HEIGHT/80),
            text("", {
                size: GAME_WIDTH / 60,
                font: 'sinko',
            }),
            { value: this.startTime }
        ])
    
        this.redScore = add([
            pos(GAME_WIDTH / 2 + GAME_WIDTH / 18, GAME_HEIGHT/2 - GAME_HEIGHT/(CAM_SCALE*2) + GAME_HEIGHT / 80),
            text("0", {
                size: GAME_WIDTH / 50, 
                font: 'sinko'
            }),
            {value: 0},
            color(237, 62, 62)
        ])
    }

    move(x, y) {
        this.blueScore.moveTo(x - GAME_WIDTH / 18,y - GAME_HEIGHT/(CAM_SCALE*2) + GAME_HEIGHT / 80);
        this.timeBoard.moveTo(x  - GAME_WIDTH / 36, y - GAME_HEIGHT/(CAM_SCALE*2) + GAME_HEIGHT/80);
        this.redScore.moveTo(x + GAME_WIDTH / 18, y - GAME_HEIGHT/(CAM_SCALE*2) + GAME_HEIGHT / 80);
    }

    countTime () {
        if(this.time === 0) {
            return;
        }
        --this.time;
        let minute = Math.floor(this.time/60);
        let second = this.time%60;
        if(minute < 10) {
            minute = "0" + minute;
        }
        if(second < 10) {
            second = "0" + second;
        }
        this.timeBoard.text = `${minute}:${second}`;
    }

    goalBlue() {
        this.blueScore.text = ++this.blueScore.value;
    }

    goalRed() {
        this.redScore.text = ++this.redScore.value;
    }
}
