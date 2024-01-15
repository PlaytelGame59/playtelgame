const chatRooms = {};

function initializeSocketIO(io) {
  io.on("connection", (socket) => {
    console.log("Socket established");

    // ************************* create Room *************************
    socket.on("create_room", (data) => {
      const { room_code, user_id, prize, user_name, join_fee, player_count } = data;

      if (chatRooms[room_code]) {
        socket.emit("create_room_failed", {
          room_code: room_code,
          message: "Failed to create room. Room already exists.",
        });
        return;
      }

      if (!room_code || room_code.trim() === '') {
        socket.emit("create_room_failed", {
          room_code: room_code,
          message: "Failed to create room. Room code is required.",
        });
        return;
      }

      chatRooms[room_code] = {
        users: [user_id],
        createrID: user_id,
        createrName: user_name,
        prize: prize,
        joinFee: join_fee,
        playerCount: 1,
        maximumPlayer: player_count
      }

      socket.join(room_code)

      io.to(room_code).emit("created_room", {
        room_code: room_code,
        createrID: user_id,
        createrName: user_name,
        message: `Room ${room_code} created successfully!`,
      });
    });

    // ************************* Join Room *************************

    socket.on("join_room", (data) => {
      const { room_code, user_id, user_name, prize, join_fee, player_count } = data;

      if (!chatRooms[room_code]) {
        socket.emit("join_room_failed", {
          room_code: room_code,
          message: "Failed to join room. Room does not exist.",
        });
        return;
      }

      const room = chatRooms[room_code]
      if(room.users.length == 4){
        return
      }
      room.users.push(user_id)
      room.playerCount++;
      socket.join(room_code)

      socket.emit("join_room_success", {
        room_code: room_code,
        createrID: room.createrID,
        users_list: room.users,
        players_count: room.playerCount,
        message: `Joined room ${room_code} successfully!`,
      });

      io.to(room_code).emit("on_joined_room", {
        room_code: room_code,
        user_id: user_id,
        user_name: user_name,
        message: "Another Player joined room successfully!",
      });

    });


    // ************************* Add bots *************************

    socket.on("add_bots", (data) => {
      const { room_code } = data;

      const room = chatRooms[room_code]

      if (!room) {
        io.to(room_code).emit("add_bots_failed", {
          room_code: room_code,
          message: "Failed to add bots. bots does not exist.",
        });
        return;
      }

      socket.emit("add_bots_success", {
        room_code: room_code,
        message: "Bots added successfully!",
      });

      io.to(room_code).emit("on_add_bots", {
        room_code: room_code,
        message: "Bots added successfully!",
      });

    });
    
    // ************************* leave Room *************************

    socket.on("leave_room", (data) => {
      const { room_code, user_id, reason } = data;
    
      if (!chatRooms[room_code]) {
        socket.emit("leave_room_failed", {
          user_id: user_id,
          user_name: user_name,
          message: "Failed to leave room. Room does not exist.",
        });
        return;
      }
    
      const room = chatRooms[room_code];
    
      const userIndex = room.users.indexOf(user_id);

      if (userIndex === -1) {
        socket.emit("leave_room_failed", {
          user_id: user_id,
          user_name: user_name,
          message: "Failed to leave room. User is not in the room.",
        });
        return;
      }
    
      // Remove the user from the room
      room.users.splice(userIndex, 1);
    
      // Emit a success event to acknowledge the user leaving the room
      io.to(room_code).emit("on_player_left_room", {
        room_code: room_code,
        user_id: user_id,
        user_name: user_name,
        reason: reason,
        message: "Left room successfully!",
      });
    
      // Check remaining players in the room
      const remainingPlayers = room.users.length;
    
      if (remainingPlayers === 0) {
        // Close the room if no players remaining
        delete chatRooms[room_code];
        socket.emit("on_room_close", {
          room_code: room_code,
          message: "Room closed due to no players remaining.",
        });
      } else if (room.createrID === user_id) {
        // If the leaving user was the master, assign a new master from remaining players
        room.createrID = room.users[0]; // Assign the first user in the list as the new master
        io.to(room_code).emit("on_master_changed", {
          room_code: room_code,
          createrID: room.createrID,
          message: `New master assigned in room ${room_code}.`,
        });
      }
    });
    
// ******************************* join random room ******************************* 
// function generateRoomCode() {
//   const numbers = '0123456789';
//   const codeLength = 6;
//   let room_code = '';

//   for (let i = 0; i < codeLength; i++) {
//     const randomIndex = Math.floor(Math.random() * numbers.length);
//     room_code += numbers.charAt(randomIndex);
//   }

//   return room_code;
// }


// socket.on("join_random_room", (data) => {
//   const { user_id, user_name, prize, join_fee } = data;

//   if (!chatRooms[room_code]) {
//     io.to(room_code).emit("join_random_failed", {
//       reason: reason,
//       message: "Failed to join random room.",
//     });
//     return;
//   }

//   // Find a suitable chat room to join
//   let foundRoom = null;
//   for (const roomCode in chatRooms) {
//     const room = chatRooms[roomCode];
//     if (
//       room.users.length < 4 &&
//       room.prize === prize &&
//       room.join_fee === join_fee &&
//       !room.users.includes(user_id)
//     ) {
//       foundRoom = roomCode;
//       break;
//     }
//   }

//   if (!foundRoom) {
//     const room_code = generateRoomCode(); 
//     socket.emit("created_room", {
//       room_code: room_code,
//       createrID: user_id,
//       createrName: user_name,
//       message: `Room ${room_code} created successfully!`,
//     });

//     chatRooms[room_code] = {
//       createrID: user_id,
//       users: [user_id],
//       prize: prize,
//       join_fee: join_fee,
//     };
//   } else {
//     chatRooms[foundRoom].users.push(user_id);
//     const createrID = chatRooms[foundRoom].createrID;

//     io.to(room_code).emit("join_room_success", {
//       room_code: foundRoom,
//       createrID: createrID,
//       message: `Joined room ${foundRoom} successfully!`,
//     });
//   }
// });

// ******************************* join random room ******************************* 
function generateRoomCode() {
  const numbers = '0123456789';
  const codeLength = 6;
  let room_code = '';

  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * numbers.length);
    room_code += numbers.charAt(randomIndex);
  }

  return room_code;
}

socket.on("join_random_room", (data) => {
  const { user_id, user_name, prize, join_fee } = data;

  // Find a suitable chat room to join
  let foundRoom = null;
  for (const room of chatRooms) {
    if (
      room.users.length < 4 &&
      room.prize === prize &&
      room.join_fee === join_fee &&
      !room.users.includes(user_id)
    ) {
      foundRoom = roomCode;
      break;
    }
  }

  if (foundRoom) {
    const room = chatRooms[foundRoom]
    room.users.push(user_id)
    room.playerCount++;
    socket.join(foundRoom)

    socket.emit("join_room_success", {
      room_code: foundRoom,
      createrID: room.createrID,
      users_list: room.users,
      players_count: room.playerCount,
      message: `Joined room ${foundRoom} successfully!`,
    });

    io.to(foundRoom).emit("on_joined_room", {
      room_code: foundRoom,
      user_id: user_id,
      user_name: user_name,
      message: "Another Player joined room successfully!",
    });
  } else {
    socket.emit("join_random_failed", {
      message: "Failed to join random room. Room does not exist.",
    });
  }
});

// ************************ close room ***************************
socket.on("close_room", (data) => {
  const { room_code, closed } = data;


  if (!chatRooms[room_code]) {
    socket.emit("close_room_failed", {
      room_code: room_code,
      message: "Failed to close room. Room does not exist.",
    });
    return;
  }

  chatRooms[room_code].closed = closed;

  io.to(room_code).emit("on_room_close", {
    room_code: room_code,
    closed: closed,
    message: `Room ${room_code} has been ${closed ? 'closed' : 'opened'}.`,
  });
});

  // ************************* Pause Game *************************

socket.on("on_player_paused", (data) => {
  const { room_code, user_id } = data;

  // Check if the room exists
  if (!chatRooms[room_code]) {
    socket.emit("pause_game_failed", {
      user_id: user_id,
      room_code: room_code,
      message: "Failed to pause game. Room does not exist.",
    });
    return;
  }

  // Check if the user is in the room
  const userIndex = chatRooms[room_code].users.indexOf(user_id);
  if (userIndex === -1) {
    socket.emit("pause_game_failed", {
      user_id: user_id,
      room_code: room_code,
      message: "Failed to pause game. User is not in the room.",
    });
    return;
  }

  // Emit an event to acknowledge the player pausing the game
  io.to(room_code).emit("on_player_paused", {
    room_code: room_code,
    user_id: user_id,
    message: `Player ${user_id} paused the game in room ${room_code}.`,
  });

  // Optionally, emit to other users in the room
  socket.to(room_code).emit("on_player_paused", {
    room_code: room_code,
    user_id: user_id,
    message: `Player ${user_id} paused the game in room ${room_code}.`,
  });
});

// ************************* Resume Game *************************

socket.on("on_player_resumed", (data) => {
  const { room_code, user_id } = data;

  // Check if the room exists
  if (!chatRooms[room_code]) {
    socket.emit("resume_game_failed", {
      user_id: user_id,
      room_code: room_code,
      message: "Failed to resume game. Room does not exist.",
    });
    return;
  }

  // Check if the user is in the room
  const userIndex = chatRooms[room_code].users.indexOf(user_id);
  if (userIndex === -1) {
    socket.emit("resume_game_failed", {
      user_id: user_id,
      room_code: room_code,
      message: "Failed to resume game. User is not in the room.",
    });
    return;
  }

  // Emit an event to acknowledge the player resuming the game
  io.to(room_code).emit("on_player_resumed", {
    room_code: room_code,
    user_id: user_id,
    message: `Player ${user_id} resumed the game in room ${room_code}.`,
  });

  // Optionally, emit to other users in the room
  io.to(room_code).to(room_code).emit("on_player_resumed", {
    room_code: room_code,
    user_id: user_id,
    message: `Player ${user_id} resumed the game in room ${room_code}.`,
  });
});


  // ************************* Set Turn *************************
  socket.on("set_turn", (data) => {
    const { room_code, by_user_id, turn } = data;
  
    if (!chatRooms[room_code]) {
      socket.emit("set_turn_failed", {
        room_code: room_code,
        message: "Failed to set turn. Room does not exist.",
      });
      return;
    }
  
    // Update the turn for the specified user in the room
    chatRooms[room_code].turn = turn;
  
    // Emit an event to acknowledge setting the turn
    io.to(room_code).emit("on_set_turn", {
      room_code: room_code,
      by_user_id: by_user_id,
      turn: turn,
      message: `Player ${by_user_id} set the turn in room ${room_code}.`, // Changed user_id to by_user_id
    });
  });
  
// *********************************** Dice value ****************************************
  
  socket.on("dice_value", (data) => {
    const { room_code, by_user_id, dice_value } = data;

    // socket.emit("dice_value", {
    //   room_code: room_code,
    //   by_user_id: by_user_id,
    //   dice_value: dice_value,
    // });

    io.to(room_code).emit("on_dice_value", {
      room_code: room_code,
      by_user_id: by_user_id,
      dice_value: dice_value,
    });
  });

// ***************************** Pawn clicked *****************************
socket.on("pawn_clicked", (data) => {
  const { room_code, player_index, clicked_pawn, move_value } = data;

  // socket.emit("dice_value", {
  //   room_code: room_code,
  //   by_user_id: by_user_id,
  //   dice_value: dice_value,
  // });

  io.to(room_code).to(room_code).emit("on_pawn_clicked", {
    room_code: room_code,
    player_index: player_index,
    clicked_pawn: clicked_pawn,
    move_value: move_value,
  });
});

// ************************ turn switch **********************************
socket.on("turn_switch", (data) => {
  const { room_code, player_turn } = data;

  if (!chatRooms[room_code]) {
    socket.emit("switch_turn_failed", {
      room_code: room_code,
      message: "Failed to switch turn. Room does not exist.",
    });
    return;
  }

  // Update the switch turn 
  chatRooms[room_code].player_turn = player_turn;

  // Emit an event to acknowledge switching the turn
  io.to(room_code).emit("on_turn_switch", {
    room_code: room_code,
    player_turn: player_turn,
    message: "turn switched successfully."
  });
});


//****************************** handle disconnection ******************************
    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
}

module.exports = {
  initializeSocketIO,
};

