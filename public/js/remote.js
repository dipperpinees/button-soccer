const up = document.querySelector('#up')
const down = document.querySelector('#down')
const right = document.querySelector('#right')
const left = document.querySelector('#left')
let moveUp;
let moveRight;
let moveDown;
let moveLeft;
const body = document.querySelector("#body");
const MOVE_SPEED = 180;
let count = 0;
let listTouch = [];
let sendMove = null;

const makeSendMove = () => {
    return setInterval(() => {
        if(listTouch.length === 0  || listTouch.length >= 3) {
            return;
        }
    
        const move = handleTouch(listTouch);
        console.log(move);
        if(move) {
            socket.emit("move", move)
        }
    }, 100)
}

const handleTouch = (touchList) => {
    const touchTemp = {};
    touchTemp[handleTouchPos(touchList[0].target)] = true;
    if(touchList.length === 2) {
        touchTemp[handleTouchPos(touchList[1].target)] = true;
    }

    if(touchTemp["up"] ) {
        if(touchTemp["right"]) {
            return {moveX: MOVE_SPEED/2 * Math.sqrt(2), moveY: - (MOVE_SPEED/2 * Math.sqrt(2)) }
        } else if(touchTemp["left"]) {
            return {moveX: -MOVE_SPEED/2 * Math.sqrt(2), moveY: -(MOVE_SPEED/2 * Math.sqrt(2)) }
        } else if(!touchTemp["down"]) {
            return {moveX: 0, moveY: -MOVE_SPEED }
        }
    }
    else if(touchTemp["down"]) {
        if(touchTemp["right"]) {
            return {moveX: MOVE_SPEED/2 * Math.sqrt(2), moveY: MOVE_SPEED/2 * Math.sqrt(2) }
        } else if(touchTemp["left"]) {
            return {moveX: -(MOVE_SPEED/2 * Math.sqrt(2)), moveY: MOVE_SPEED/2 * Math.sqrt(2) }
        }  else if(!touchTemp["up"]) {
            return {moveX: 0, moveY: MOVE_SPEED }
        }
    } else if(touchTemp["right"] && !touchTemp["left"]) {
        return {moveX: MOVE_SPEED, moveY: 0 }
    } else if(touchTemp["left"] && !touchTemp["right"]) {
        return {moveX: -MOVE_SPEED, moveY: 0 }
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

document.addEventListener("touchmove", (e) => {
    listTouch = e.touches;
    const move = handleTouch(listTouch);
    if(move) {
        socket.emit("move", move)
    }
})

document.addEventListener("touchstart", (e) => {
    listTouch = e.touches;
    const move = handleTouch(listTouch);
    if(move) {
        socket.emit("move", move)
    }
    listTouch = e.touches;
    sendMove = makeSendMove();
})

document.addEventListener("touchend", (e) => {  
    clearInterval(sendMove);
    listTouch = [];
})
