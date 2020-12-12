const { removeGame } = require('./games');
// storing current users in following array 
const users = []

const addUser = ({ id, name, room}) => {
    name = name.trim().toLowerCase(); 
    room = room.trim().toLowerCase(); 

    const existingUser = users.find((user) => user.room === room && user.name === name); 

    if (!name || !room){
        return { error: 'Username and room are required.' }; 
    }

    if (getUsersInRoom(room).length>=2){
        return { error: 'Game is currently created to support at most two players' }
    }

    if (existingUser) {
        return { error: 'Username is taken,' }; 
    }
     
    const user = { id, name, room }; 

    users.push(user); 

    return { user }; 
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id); 
    if (index !== -1){
        if (getUsersInRoom(getUser(id).room).length === 1){
            // clear the game data 
            removeGame(getUser(id).room);
        }
        return users.splice(index, 1)[0]; 
    }
}


const getUser = (id) => users.find((user) => user.id === id); 

const getUsersInRoom = (room) => users.filter((user) => user.room === room); 

module.exports = { addUser, removeUser, getUser, getUsersInRoom }; 