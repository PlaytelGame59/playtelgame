const Players = require('../models/Players');
const FriendList = require('../models/FriendList');
const WithdrawDetails = require('../models/WithdrawDetails');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
require('dotenv').config();
const multer = require('multer')
const fs = require('fs');
const configMulter = require('../configMulter');
const Tournment = require('../models/Tournment'); 
const RegisteredTournament = require('../models/RegisteredTournament');
const Notification = require('../models/Notification');
const AdharKYC = require('../models/AdharKYC');
const WalletHistory = require('../models/WalletHistory');
const ObjectId = require('mongodb').ObjectId;


exports.userLogin = async function (req, res) {
  try {
    const {
      email,
      first_name,
      device_type,
      device_token,
      mobile
    } = req.body;

    // Check if the mobile number already exists in the Players table
    let existingUser = await Players.findOne({
      mobile
    });

    if (existingUser) {
      // If the user exists, return the existing data without updating
      return res.status(200).json({
        success: true,
        data: existingUser,
        message: 'User already exists. Returning existing data.',
      });
    } else {
      // If the user doesn't exist, create a new user entry
      const data = await Players.create({
        email,
        first_name,
        device_type,
        device_token,
        mobile,
      });

      const token = jwt.sign({
        mobile
      }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      }); // Using the secret key from .env

      return res.status(200).json({
        success: true,
        data,
        token: token,
        message: 'New user created.',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


const uploadImage = configMulter('playerImage/', [{
  name: 'player_image',
  maxCount: 1
}]);

exports.addPlayerImage = async function (req, res) {
  uploadImage(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({
        success: false,
        message: 'Multer error',
        error: err
      });
    } else if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error uploading file',
        error: err
      });
    }

    try {
      const player_id = req.body.player_id; // Corrected to use req.body.player_id

      // Check if player_id is provided
      if (!player_id) {
        return res.status(400).json({
          success: false,
          message: 'Player ID is required.'
        });
      }

      // Check if the player with the given player_id exists
      const existingPlayer = await Players.findOne({
        _id: player_id
      });

      if (!existingPlayer) {
        return res.status(404).json({
          success: false,
          message: 'Player not found.'
        });
      }

      const player_image = req.files['player_image'] ? req.files['player_image'][0].path.replace(/^.*playerImage[\\/]/, 'playerImage/') : '';

      // Update the player's image
      existingPlayer.player_image = player_image;

      await existingPlayer.save();

      res.status(200).json({
        success: true,
        message: 'Player image updated successfully.',
        data: existingPlayer
      });
    } catch (error) {
      console.error('Error updating player image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update player image.',
        error: error.message
      });
    }
  });
};

exports.getPlayerProfileImage = async function (req, res) {
  try {
    const {
      player_id
    } = req.body;

    // Find player by player_id and select only the profile_image field
    const player = await Players.findById(player_id).select('player_image');

    if (!player) {
      return res.status(200).json({
        success: false,
        message: 'Player not found.'
      });
    }

    // Send the profile_image data in the response
    res.status(200).json({
      success: true,
      player_image: player.player_image
    });
  } catch (error) {
    console.error('Error fetching profile image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch player profile image.',
      error: error.message
    });
  }
};

exports.getPlayerDetails = async function (req, res) {
  try {
    const {
      player_id
    } = req.body;

    // Find player by player_id
    const player = await Players.findById(player_id);

    if (!player) {
      return res.status(200).json({
        success: false,
        message: 'Player not found.'
      });
    }

    res.status(200).json({
      success: true,
      player
    });
  } catch (error) {
    console.error('Error fetching player details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch player details.',
      error: error.message
    });
  }
};


exports.updatePlayerDetails = async function (req, res) {
  try {
    const player_id = req.body.player_id;
    const existingPlayer = await Players.findById(player_id);

    if (!existingPlayer) {
      return res.status(200).json({
        success: false,
        message: 'Player not found.'
      });
    }

    const {
      mobile,
      first_name,
      email
    } = req.body;

    existingPlayer.first_name = first_name || existingPlayer.first_name;
    existingPlayer.mobile = mobile || existingPlayer.mobile;
    existingPlayer.email = email || existingPlayer.email;

    await existingPlayer.save();

    res.status(200).json({
      success: true,
      message: 'Player updated successfully.',
      data: existingPlayer
    });
  } catch (error) {
    console.error('Error updating Player:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update Player.',
      error: error.message
    });
  }
};

exports.updatePlayerName = async function (req, res) {
  try {
    const player_id = req.body.player_id;
    const existingPlayer = await Players.findById(player_id);

    if (!existingPlayer) {
      return res.status(200).json({
        success: false,
        message: 'Player not found.'
      });
    }

    const {
      first_name
    } = req.body;

    existingPlayer.first_name = first_name || existingPlayer.first_name;

    await existingPlayer.save();

    res.status(200).json({
      success: true,
      message: 'Player Name updated successfully.',
      data: existingPlayer
    });
  } catch (error) {
    console.error('Error updating Player Name:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update Player Name.',
      error: error.message
    });
  }
};


exports.sendFriendRequest = async function (req, res) {
  try {
    const {
      player_id,
      email,
      friend_email
    } = req.body;

    const userExists = await Players.findOne({
      _id: player_id,
      email: email
    });
    if (!userExists) {
      return res.status(200).json({
        success: false,
        message: 'User not found.'
      });
    }

    const friendExists = await Players.findOne({
      email: friend_email
    });
    if (!friendExists) {
      return res.status(200).json({
        success: false,
        message: 'Friend not found.'
      });
    }

    const existingFriend = await FriendList.findOne({
      player_id,
      friend_email
    });
    if (existingFriend) {
      return res.status(400).json({
        success: false,
        message: 'Friend request already sent or friend exists.'
      });
    }

    const newFriend = new FriendList({
      player_id: player_id,
      email: email,
      friend_email: friend_email,
      friend_status: 'pending'
    });

    await newFriend.save();

    res.status(200).json({
      success: true,
      message: 'Friend request sent successfully.',
      data: newFriend
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send friend request.',
      error: error.message
    });
  }
};

exports.isMobileRegistedred = async function (req, res) {
  try {
    const {
      mobile
    } = req.body;

    const player = await Players.findOne({
      mobile: mobile
    });

    if (player) {
      res.status(200).json({
        success: true,
        message: 'Mobile number is registered.'
      });
    } else {
      res.status(200).json({
        success: false,
        message: 'Mobile number is not registered.'
      });
    }
  } catch (error) {
    console.error('Error checking mobile registration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check mobile registration.',
      error: error.message
    });
  }
};

exports.getFriendList = async function (req, res) {
  try {
    const {
      player_id,
      email
    } = req.body;

    const friends = await FriendList.find({
      player_id: player_id,
      email
    });

    res.status(200).json({
      success: true,
      message: 'Friends retrieved successfully.',
      data: friends
    });
  } catch (error) {
    console.error('Error retrieving friends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve friends.',
      error: error.message
    });
  }
};

exports.sendWithdrawalRequest = async function (req, res) {
  try {
    const {
      player_id,
      amt_withdraw,
      bank_account,
      bank_ifsc
    } = req.body;

    // Create a new withdrawal request entry
    const newWithdrawalRequest = new WithdrawDetails({
      player_id,
      amt_withdraw,
      bank_account,
      bank_ifsc
    });

    await newWithdrawalRequest.save();

    res.status(200).json({
      success: true,
      message: 'Withdrawal request sent to admin.',
      data: newWithdrawalRequest
    });
  } catch (error) {
    console.error('Error sending withdrawal request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send withdrawal request.',
      error: error.message
    });
  }
};

exports.getWithdrawHistory = async function (req, res) {
  try {
    const {
      player_id
    } = req.body;

    // Find player by player_id
    if(!ObjectId.isValid(player_id))  return res.status(400).json({
      success: false,
      message: 'player_id is not valid'
    });
    const withdrawHistory = await WithdrawDetails.findById(player_id);

    if (!withdrawHistory) {
      return res.status(200).json({
        success: false,
        message: 'Withdrawl History not found.'
      });
    }

    res.status(200).json({
      success: true,
      withdrawHistory
    });
  } catch (error) {
    console.error('Error fetching withdrawl history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch withdrawl history.',
      error: error.message
    });
  }
};

// get player'swallet history
exports.getPlayerWithdrawHistory = async function (req, res) {
  try {
    const {
      player_id
    } = req.body;
    if (player_id.length <= 0) return res.status(400).json({
      success: false,
      message: 'Player ID can not be blank'
    })
    // console.log("jdsadn");
    // Check if player_id exists in WithdrawDetails
    const walletHistory = await WalletHistory.findOne({
      player_id
    });

    if (!walletHistory) {
      return res.status(200).json({
        success: false,
        message: 'No wallet history for the specified user.'
      });
    }

    res.status(200).json({
      success: true,
      walletHistory
    });
  } catch (error) {
    console.error('Error fetching wallet history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet history.',
      error: error.message
    });
  }
};

exports.changeFriendStatus = async function (req, res) {
  try {
    const {
      player_id,
      email,
      status
    } = req.body;

    // Update the status of the friend request in the FriendList table
    const updatedFriend = await FriendList.findOneAndUpdate({
      friend_id: player_id,
      email
    }, {
      friend_status: status
    }, {
      new: true
    });

    if (!updatedFriend) {
      return res.status(200).json({
        success: false,
        message: 'Friend request not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Friend request status updated.',
      data: updatedFriend
    });
  } catch (error) {
    console.error('Error updating friend request status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update friend request status.',
      error: error.message
    });
  }
};

// // API endpoint for getting friends list
// exports.getFriendsList = async function (req, res) {
//     try {
//       const { user_id, email } = req.body;

//       // Find the user by either user_id or email
//       const user = await UserModel.findOne({
//         $or: [{ _id: user_id }, { email }],
//       });

//       if (!user) {
//         return res
//           .status(200)
//           .json({ success: false, message: "User not found" });
//       }

//       // Get the list of friend IDs
//       const friendIds = user.friends;

//       // Find friends using the list of friend IDs
//       const friends = await UserModel.find({ _id: { $in: friendIds } });

//       res.status(200).json({ success: true, friends });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };


exports.getleaderboard = async function (req, res) {
  try {
    // Fetch users from the database, sorted by a relevant metric (e.g., amount)
    const leaderboard = await PlayerModel.find().sort({
      wallet_amount: -1
    }).limit(10);

    // You can customize the sorting and limit based on your application's requirements

    return res.status(200).json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

//  // Function to calculate prizes based on your logic
// function calculatePrizes(topUsers) {
//    // Your logic to assign prizes based on positions, scores, etc.
//    // This is just a placeholder, customize it as per your requirements
//    // return topUsers.map((user, index) => ({ userId: user._id, prize: Prize for position ${index + 1} }));
// }

const calculatePrizes = async (topUsers) => {
  // Logic based on position and scores
  return await topUsers.map((user, index) => ({
    userId: user._id,
    winningAmount: `winningAmount for position ${index + 1}`
  }));
}

exports.topprize = async function (req, res) {
  try {
    // Fetch the top 10 users from the database, sorted by a relevant metric (e.g., score)
    const topUsers = await PlayerModel.find().sort({
      score: -1
    }).limit(1);

    // Calculate prizes based on your logic (this is just an example)
    const prizes = calculatePrizes(topUsers);

    return res.status(200).json({
      success: true,
      prizes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
}

// save bank details 
exports.saveBankDetails = async function (req, res) {
  try {
    const {
      player_id,
      upi_id,
      bank_name,
      bank_account,
      bank_ifsc
    } = req.body;

    const newBankDetails = new WithdrawDetails({
      player_id,
      upi_id,
      bank_name,
      bank_account,
      bank_ifsc
    });

    await newBankDetails.save();

    res.status(200).json({
      success: true,
      message: 'Bank details of player saved successfully.',
      data: newBankDetails
    });
  } catch (error) {
    console.error('Error saving bank details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to saving bank details.',
      error: error.message
    });
  }
};

exports.getNotificationList = async function (req, res) {
  try {
    const notificationList = await Tournament.find()

    res.status(200).json({
      success: true,
      notificationList
    });
  } catch (error) {
    console.error('Error fetching notification list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification list',
      error: error.message
    });
  }
};

// register tournament 

exports.registerTournament = async function (req, res) {
  try {
  // Extract data from the request body
  const { tournament_id, player_id, play_amount, bonus_amount, players_count } = req.body;

  // Check if the tournament exists
  // const tournament = await Tournment.findById(tournament_id);
  // if (!tournament) {
  //   return res.status(400).json({ success: false, message: 'Tournament not found.' });
  // }

  // Check if the player exists
  // const player = await Players.findById(player_id);
  // if (!player) {
  //   return res.status(400).json({ success: false, message: 'Player not found.' });
  // }

  // Create a new record in the registeredTournament table
  const registeredTournament = new RegisteredTournament({
    tournament_id,
    player_id,
    play_amount, 
    bonus_amount, 
    players_count
  });

  // Save the record
  await registeredTournament.save();

  // Respond with success message
  return res.status(200).json({ success: true, message: 'Player registered for the tournament.' });
} catch (error) {
  console.error('Error registering player for tournament:', error);
  return res.status(500).json({ success: false, message: 'Failed to register player for tournament.', error: error.message });
}
};

exports.getAllNotification = async function(req,res) {
  try {
    const notificationList = await Notification.find()

    res.status(200).json({ success: true, notificationList });
  } catch (error) {
    console.error('Error fetching notification List:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notification list', error: error.message });
  }
};

// exports.getLatestWinner = async function(req,res) {
//   try {
//     // Find players and sort them based on the creation timestamp in descending order
//     const latestWinners = await Players.find().sort({ createdAt: -1, winning: -1 }).limit(10); // Adjust the limit as needed

//     res.status(200).json({
//       success: true,
//       message: 'Latest winners retrieved successfully.',
//       data: latestWinners
//     });
//   } catch (error) {
//     console.error('Error retrieving Latest winners:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to retrieve Latest winners.',
//       error: error.message
//     });
//   }
// };

exports.getLatestWinner = async function (req, res) {
  try {
    // Find players and sort them based on the creation timestamp and winning value in descending order
    const latestWinners = await Players.find().sort({ winning: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Latest winners retrieved successfully.',
      data: latestWinners
    });
  } catch (error) {
    console.error('Error retrieving Latest winners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve Latest winners.',
      error: error.message
    });
  }
};

exports.deleteNotification = async function(req,res) {
  try {
    const notification_id = req.body.notification_id; // Assuming the key for skillId in the body is 'skillId'

    if (!notification_id || !mongoose.Types.ObjectId.isValid(notification_id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }

    const deletedNotification = await Notification.findByIdAndDelete(notification_id);

    if (!deletedNotification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.status(200).json({ success: true, message: 'Notification deleted successfully', deletedNotification });
  } catch (error) {
    console.error('Error deleting Notification:', error);
    res.status(500).json({ success: false, message: 'Failed to delete Notification', error: error.message });
  }
};


const uploadAdharImage = configMulter('playerAdahrImage/', [
  {
    name: 'aadhar_image',
    maxCount: 1
  }
]);

exports.playerAdharImage = async function (req, res) {
  uploadAdharImage(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({
        success: false,
        message: 'Multer error',
        error: err
      });
    } else if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error uploading file',
        error: err
      });
    }

    try {
      const { player_id, type } = req.body;

      // Check if player_id is provided
      if (!player_id || !type) {
        return res.status(400).json({
          success: false,
          message: 'Player ID and type are required.'
        });
      }

      // Check if the player with the given player_id exists
      const existingPlayer = await Players.findOne({
        _id: player_id
      });

      if (!existingPlayer) {
        return res.status(404).json({
          success: false,
          message: 'Player not found.'
        });
      }

      // Save the details in the AdharKYC table
      const aadhar_image = req.files['aadhar_image'] ? req.files['aadhar_image'][0].path.replace(/^.*playerAdahrImage[\\/]/, 'playerAdahrImage/') : '';

      const adharKYC = new AdharKYC({
        player_id: player_id,
        type: type,
        aadhar_image: aadhar_image
      });

      await adharKYC.save();

      res.status(200).json({
        success: true,
        message: 'AdharKYC details saved successfully.',
        data: adharKYC
      });
    } catch (error) {
      console.error('Error saving AdharKYC details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save AdharKYC details.',
        error: error.message
      });
    }
  });
};

// exports.loadWalletAmount = async function (req, res) {
//   try {
//     const { player_id, field, loaded_amount } = req.body;

//     // Validate input parameters
//     if (!player_id || !field || !loaded_amount) {
//       return res.status(400).json({ error: 'Invalid input parameters' });
//     }

//     // Validate the field
//     const allowedFields = ['winning', 'bonus', 'wallet_amount'];
//     if (!allowedFields.includes(field)) {
//       return res.status(400).json({ error: 'Invalid field' });
//     }

//     // Update the specified field for the player and return the modified document
//     const result = await Players.findOneAndUpdate(
//       { _id: player_id },
//       { $inc: { [field]: isNumeric(loaded_amount) ? loaded_amount : 0 } },
//       { new: true }
//     );
    

//     if (!result) {
//       return res.status(404).json({ error: 'Player not found' });
//     }

//     res.json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };


// exports.loadWalletAmount = async function (req, res) {
//   try {
//     // Extract data from the request body
//     const { player_id, wallet_type, loaded_amount } = req.body;

//     // Validate input parameters
//     if (!player_id || !wallet_type || !loaded_amount) {
//       return res.status(400).json({ error: 'Invalid input parameters' });
//     }

//     // Check if the player exists
//     const player = await WalletHistory.findOne({ player_id });

//     if (!player) {
//       return res.status(400).json({ success: false, message: 'Player not found.' });
//     }

//     // Update the specified wallet_type for the player and return the modified document
//     const result = await WalletHistory.findOneAndUpdate(
//       { player_id },
//       { $inc: { [wallet_type]: loaded_amount } },
//       { new: true }
//     );

//     if (!result) {
//       return res.status(404).json({ error: 'Player not found' });
//     }

//     res.json(result);
//   } catch (error) {
//     console.error('Error in loading amount for this player:', error);
//     return res.status(500).json({ success: false, message: 'Failed to load amount for player.', error: error.message });
//   }
// };

exports.loadWalletAmount = async function (req, res) {
  try {
    // Extract data from the request body
    const { player_id, wallet_type, loaded_amount } = req.body;

    // Validate input parameters
    if (!player_id || !wallet_type || !loaded_amount) {
      return res.status(400).json({ error: 'Invalid input parameters' });
    }

    // Create a new record in the WalletHistory table
    const walletHistory = new WalletHistory({
      player_id,
      [wallet_type]: loaded_amount // Dynamically set the field based on wallet_type
    });

    // Save the record
    await walletHistory.save();

    // Respond with success message
    return res.status(200).json({ success: true, message: 'Amount loaded for that player.' });
  } catch (error) {
    console.error('Error in loading amount for this player:', error);
    return res.status(500).json({ success: false, message: 'Failed to load amount for player.', error: error.message });
  }
};

exports.getTournamentDetails = async function (req, res) {
  try {
    // Extract data from the request body
    const { player_id, tournament_id } = req.body;

    // Validate input parameters
    if (!player_id || !tournament_id) {
      return res.status(400).json({ error: 'Invalid input parameters' });
    }

    // Find data in the RegisteredTournament table based on player_id and tournament_id
    const data = await RegisteredTournament.findOne({ player_id, tournament_id });

    // Check if data is found
    if (!data) {
      return res.status(404).json({ success: false, message: 'Data not found for the provided player_id and tournament_id' });
    }

    // Respond with the retrieved data
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in getting registered tournament data:', error);
    return res.status(500).json({ success: false, message: 'Failed to get registered tournament data.', error: error.message });
  }
};