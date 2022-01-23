module.exports = (roomList) => {
    const listChar = "abcdefghijklmnopqrstuvwxyz0123456789";
    while (true) {
        let roomId = "";
        const lengthList = listChar.length;
        for(let i = 0; i<6; i++) {
            roomId += listChar[Math.floor(Math.random() * lengthList)];
        }
        if(!roomList[roomId]) {
            return roomId;
        }
    }
}
