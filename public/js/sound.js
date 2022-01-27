class Sound {
    constructor () {}

    loadSound() {
        loadSound("crowd", "/sound/crowd.mp3");
        loadSound("goal", "/sound/goal.mp3");
        loadSound("whistle", "/sound/whistle.mp3");
        loadSound("endwhistle", "/sound/endwhistle.mp3");
    }

    playBg() {
        this.music = play("crowd", {
            loop: true
        })
    }

    pause() {
        this.music.pause();
    }

    playWhistle() {
        play("whistle");
    }

    playEndWhistle() {
        play("endwhistle")
    }

    playGoal() {
        play("goal");
    }
}