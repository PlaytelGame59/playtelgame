const Players = require('../models/Players');
const FriendList = require('../models/FriendList');
const WithdrawDetails = require('../models/WithdrawDetails');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
require('dotenv').config();
const multer = require('multer')
const fs = require('fs');
const configMulter = require('../configMulter');
const Tournament = require('../models/tournament');
const RegisteredTournament = require('../models/RegisteredTournament');
const Notification = require('../models/Notification');
const AdharKYC = require('../models/AdharKYC');
const WalletHistory = require('../models/WalletHistory');
const GameHistory = require('../models/GameHistory');
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

// exports.getPlayerDetails = async function (req, res) {
//   try {
//     const {
//       player_id
//     } = req.body;

//     // Find player by player_id
//     const player = await Players.findById(player_id).exec();

//     if (!player) {
//       return res.status(404).json({
//         success: false,
//         message: 'Player not found.'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       player
//     });
//   } catch (error) {
//     console.error('Error fetching player details:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch player details.',
//       error: error.message
//     });
//   }
// };


exports.getPlayerDetails = async function (req, res) {
  try {
    const { player_id } = req.body;

    // Find player by player_id
    const player = await Players.findById(player_id).exec();

    if (!player) {
      return res.status(404).json({
        success: false,

        message: 'Player not found.'
      });
    }
// console.log("abc");
    // Construct the desired response format
    const response = {
      success: true,
      player: {
        _id: player._id,
        first_name: player.first_name,
        mobile: player.mobile,
        join_code: player.join_code,
        no_of_loose: player.no_of_loose,
        no_of_total_win: player.no_of_total_win,
        banned: player.banned,
      },
      wallet: {
        current_amount: player.wallet_amount || 0,
      },
      winning_wallet: {
        current_amount: player.winning_amount || 0,
      },
      bonus_wallet: {
        current_amount: player.bonus_ammount || 0,
      },
      bot: {
        bot_status: 1, // You can update this based on your logic
      },
      app: {
        version_control: "1.0", // Update with your actual version
        joining_link: "https://www.google.com", // Update with your landing page link
      },
    };

    res.status(200).json(response);
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
    if (!ObjectId.isValid(player_id)) return res.status(400).json({
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
exports.getPlayerWalletHistory = async function (req, res) {
  try {
    const {
      player_id
    } = req.body;
    if (!ObjectId.isValid(player_id)) return res.status(400).json({
      success: false,
      message: 'Player ID can not be blank'
    })
    console.log(player_id);
    // console.log("jdsadn");
    // Check if player_id exists in WithdrawDetails
    const walletHistory = await WalletHistory.find({
      player_id: player_id
    });

    // console.log(walletHistory)

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
    const notificationList = await Notification.find()

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
    const {
      tournament_id,
      player_id,
      play_amount,
      bonus_amount,
      players_count
    } = req.body;

    // Check if the tournament exists
    const tournament = await Tournament.findById(tournament_id);
    if (!tournament) {
      return res.status(400).json({ success: false, message: 'Tournament not found.' });
    }

    // Check if the player exists
    const player = await Players.findById(player_id);
    if (!player) {
      return res.status(400).json({ success: false, message: 'Player not found.' });
    }

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
    return res.status(200).json({
      "success": true,
      "operator": "creator", 
      "room_no": "736453"
  });
  } catch (error) {
    console.error('Error registering player for tournament:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register player for tournament.',
      error: error.message
    });
  }
};

exports.getAllNotification = async function (req, res) {
  try {
    const notificationList = await Notification.find()

    res.status(200).json({
      success: true,
      notificationList
    });
  } catch (error) {
    console.error('Error fetching notification List:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification list',
      error: error.message
    });
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
    const latestWinners = await Players.find().sort({
      winning: -1,
      createdAt: -1
    });

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

exports.deleteNotification = async function (req, res) {
  try {
    const notification_id = req.body.notification_id; // Assuming the key for skillId in the body is 'skillId'

    if (!notification_id || !mongoose.Types.ObjectId.isValid(notification_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID'
      });
    }

    const deletedNotification = await Notification.findByIdAndDelete(notification_id);

    if (!deletedNotification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
      deletedNotification
    });
  } catch (error) {
    console.error('Error deleting Notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete Notification',
      error: error.message
    });
  }
};


const uploadAdharImage = configMulter('playerAdahrImage/', [{
  name: 'aadhar_image',
  maxCount: 1
}]);

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
      const {
        player_id,
        type
      } = req.body;

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
//     // Extract data from the request body
//     const {
//       player_id,
//       wallet_type,
//       loaded_amount,
//       type,
//       notes
//     } = req.body;

//     // Validate input parameters
//     if (!player_id || !ObjectId.isValid(player_id) || !wallet_type || !loaded_amount) {
//       return res.status(400).json({
//         error: 'Invalid input parameters'
//       });
//     }
//     const player = await Players.findOne({
//       _id: player_id,
//       // status: "ACTIVE"
//     }).exec();
//     if (!player) {
//       return res.status(404).json({
//         error: 'Player not found with the id: ' + player_id
//       });
//     }
//     // Create a new record in the WalletHistory table
//     const walletHistory = new WalletHistory({
//       player_id: player_id,
//       wallet_type: wallet_type,
//       amount: loaded_amount || 0, // Dynamically set the field based on wallet_type,
//       type: type || "",
//       notes: notes || ""
//     });

//     // Save the record
//     /**
//      * PLAY_BALANCE: user can add the money IN wallet_amount, and can use to play, bit
//      * WINNING_BALANCE: Won ammount bit, user can widthraw the amount
//      * 
//      */
//     await walletHistory.save();

//     switch (wallet_type.toUpperCase()) {
//       case "PLAY_BALANCE":
//         const wallet_amount = Number(player.wallet_amount);
//         if (type.toUpperCase() == "DEBIT") {
//           player.wallet_amount = wallet_amount - Number(loaded_amount)
//         } else {
//           player.wallet_amount = wallet_amount + Number(loaded_amount);
//         }
//         break;
//       case "WINNING_BALANCE":
//         const winning_amount = Number(player.winning_amount);
//         if (type.toUpperCase() == "DEBIT") {
//           player.winning_amount = winning_amount - Number(loaded_amount)
//         } else {
//           player.winning_amount = winning_amount + Number(loaded_amount);
//         }
//         break;

//       case "BONUS_BALANCE":
//         const bonus_ammount = Number(player.bonus_ammount);
//         if (type.toUpperCase() == "DEBIT") {
//           player.bonus_ammount = bonus_ammount - Number(loaded_amount)
//         } else {
//           player.bonus_ammount = bonus_ammount + Number(loaded_amount);
//         }
//         break;
//     }
//     const upldated = await Players.findOneAndUpdate({
//       _id: player_id
//     }, player).exec();

//     upldated ? res.status(200).json({
//       success: true,
//       message: 'Amount loaded for that player.'
//     }) : res.status(500).json({
//       success: false,
//       message: 'Failed to load amount for player.',
//       error: error.message
//     });
//   } catch (error) {
//     console.error('Error in loading amount for this player:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to load amount for player.',
//       error: error.message
//     });
//   }
// };


// exports.loadWalletAmount = async function (req, res) {
//   try {
//     const {
//       player_id,
//       wallet_type,
//       loaded_amount,
//       type,
//       notes
//     } = req.body;

//     if (!player_id || !ObjectId.isValid(player_id) || !wallet_type || !loaded_amount) {
//       return res.status(400).json({
//         error: 'Invalid input parameters'
//       });
//     }

//     const player = await Players.findOne({
//       _id: player_id,
//       // status: "ACTIVE"
//     }).exec();

//     if (!player) {
//       return res.status(404).json({
//         error: 'Player not found with the id: ' + player_id
//       });
//     }

//     const walletHistory = new WalletHistory({
//       player_id: player_id,
//       wallet_type: wallet_type,
//       amount: loaded_amount || 0,
//       type: type || "",
//       notes: notes || ""
//     });

//     await walletHistory.save();

//     switch (wallet_type.toUpperCase()) {
//       case "PLAY_BALANCE":
//         player.wallet_amount += (type.toUpperCase() === "DEBIT") ? -Number(loaded_amount) : Number(loaded_amount);
//         break;
//       case "WINNING_BALANCE":
//         player.winning_amount += (type.toUpperCase() === "DEBIT") ? -Number(loaded_amount) : Number(loaded_amount);
//         break;
//       case "BONUS_BALANCE":
//         player.bonus_ammount += (type.toUpperCase() === "DEBIT") ? -Number(loaded_amount) : Number(loaded_amount);
//         break;
//     }

//     const updatedPlayer = await Players.findOneAndUpdate({
//       _id: player_id
//     }, player, {
//       new: true
//     }).exec();

//     if (updatedPlayer) {
//       return res.status(200).json({
//         success: true,
//         message: 'Amount loaded for that player.'
//       });
//     } else {
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to load amount for player.'
//       });
//     }
//   } catch (error) {
//     console.error('Error in loading amount for this player:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to load amount for player.',
//       error: error.message
//     });
//   }
// };

exports.loadWalletAmount = async function (req, res) {
  try {
    const {
      player_id,
      wallet_type,
      loaded_amount,
      type,
      notes
    } = req.body;

    if (!player_id || !ObjectId.isValid(player_id) || !wallet_type || !loaded_amount) {
      return res.status(400).json({
        error: 'Invalid input parameters'
      });
    }

    const player = await Players.findOne({
      _id: player_id,
      // status: "ACTIVE"
    }).exec();

    if (!player) {
      return res.status(404).json({
        error: 'Player not found with the id: ' + player_id
      });
    }

    const walletHistory = new WalletHistory({
      player_id: player_id,
      wallet_type: wallet_type,
      amount: loaded_amount || 0,
      type: type || "",
      notes: notes || ""
    });

    await walletHistory.save();

    switch (wallet_type.toUpperCase()) {
      case "PLAY_BALANCE":
        player.wallet_amount += (type.toUpperCase() === "DEBIT") ? -Number(loaded_amount) : Number(loaded_amount);
        break;
      case "WINNING_BALANCE":
        player.winning_amount += (type.toUpperCase() === "DEBIT") ? -Number(loaded_amount) : Number(loaded_amount);
        break;
      case "BONUS_BALANCE":
        player.bonus_ammount += (type.toUpperCase() === "DEBIT") ? -Number(loaded_amount) : Number(loaded_amount);
        break;
    }

    const updatedPlayer = await Players.findOneAndUpdate({
      _id: player_id
    }, player, {
      new: true
    }).exec();

    if (updatedPlayer) {
      return res.status(200).json({
        success: true,
        message: 'Amount loaded for that player.'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to load amount for player.'
      });
    }
  } catch (error) {
    console.error('Error in loading amount for this player:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load amount for player.',
      error: error.message
    });
  }
};

// exports.getTournamentDetails = async function (req, res) {
//   try {
//     const { player_id, tournament_id } = req.body;

//     // Check if tournament_id is present in the Tournament table
//     const tournamentData = await Tournament.findOne({ _id: tournament_id });

//     let responseData;

//     if (tournamentData) {
//       // If tournament_id is present, update the response with tournament details
//       const playerData = await RegisteredTournament.findOne({ player_id });
//       const playerCount = await RegisteredTournament.countDocuments({ tournament_id });

//       responseData = {
//         success: true,
//         count: playerCount.toString(),
//         registered: playerData ? 1 : 0, // Set to 1 if player_id is registered, otherwise 0
//         operator: "creator", // Default value
//         playmoney: 0, // Default value
//         bonusmoney: 0, // Default value
//         tournament_id,
//         player_id,
//       };

//       // If player_id is present, update the response with relevant data
//       if (playerData) {
//         responseData = {
//           ...responseData,
//           registered: 1,
//         };
//       }

//       // Fetch betAmount from tournamentData
//       const betAmount = tournamentData.betAmount || 0; // Set a default value if betAmount is undefined
//       const playMoneyPercentage = 98;
//       const bonusMoneyPercentage = 100 - playMoneyPercentage;

//       responseData.playmoney = (playMoneyPercentage / 100) * betAmount;
//       responseData.bonusmoney = (bonusMoneyPercentage / 100) * betAmount;

//       // Convert tournamentInterval to a numerical value (in seconds)
//       const tournamentIntervalInSeconds = parseInt(tournamentData.tournamentInterval) * 60;

//       // Convert createdAt to a formatted time string
//       const tournamentStartTime = new Date(tournamentData.createdAt);

//       // Calculate remaining time for the tournament based on repeating intervals
//       const currentTime = new Date().getTime();
//       const timeDifference = currentTime - tournamentStartTime.getTime();
//       const elapsedSeconds = timeDifference / 1000;

//       // Calculate the current interval boundary
//       const currentIntervalStart = Math.floor(elapsedSeconds / tournamentIntervalInSeconds) * tournamentIntervalInSeconds;

//       // Calculate the next interval boundary
//       const nextIntervalStart = currentIntervalStart + tournamentIntervalInSeconds;

//       const remainingSeconds = nextIntervalStart - elapsedSeconds;

//       responseData.remainingtime = remainingSeconds;

//     } else {
//       // If tournament_id does not exist, set default values
//       responseData = {
//         success: true,
//         count: "5", // You can set the default player count to any value
//         registered: 0,
//         operator: "creator",
//         playmoney: 9.8,
//         bonusmoney: 0.2,
//         tournament_id,
//         player_id,
//         remainingtime: 60, // You can set the default remaining time to any value
//       };
//     }

//     // Respond with the formatted data
//     return res.status(200).json(responseData);
//   } catch (error) {
//     console.error('Error in getting registered tournament data:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to get registered tournament data.',
//       error: error.message,
//     });
//   }
// };

exports.getTournamentDetails = async function (req, res) {
  try {
    const { player_id, tournament_id } = req.body;

    // Check if tournament_id is present in the Tournament table
    const tournamentData = await Tournament.findOne({ _id: tournament_id });

    let responseData;

    if (tournamentData) {
      // If tournament_id is present, update the response with tournament details
      const playerData = await RegisteredTournament.findOne({ player_id });
      const playerCount = await RegisteredTournament.countDocuments({ tournament_id });

      responseData = {
        success: true,
        count: playerCount.toString(),
        registered: playerData ? 1 : 0,
        operator: "creator",
        tournament_id,
        player_id,
      };

      // If player_id is present, update the response with relevant data
      if (playerData) {
        responseData = {
          ...responseData,
          registered: 1,
        };
      }

      // Fetch betAmount from tournamentData
      const betAmount = parseFloat(tournamentData.betAmount) || 0; // Convert to float and set a default value if betAmount is undefined
      const playMoneyPercentage = 98;
      const bonusMoneyPercentage = 2;

      responseData.playmoney = (playMoneyPercentage / 100) * betAmount;
      responseData.bonusmoney = (bonusMoneyPercentage / 100) * betAmount;

      // Convert tournamentInterval to a numerical value (in seconds)
      const tournamentIntervalInSeconds = parseInt(tournamentData.tournamentInterval) * 60;

      // Convert createdAt to a formatted time string
      const tournamentStartTime = new Date(tournamentData.createdAt);

      // Calculate remaining time for the tournament based on repeating intervals
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - tournamentStartTime.getTime();
      const elapsedSeconds = timeDifference / 1000;

      // Calculate the current interval boundary
      const currentIntervalStart = Math.floor(elapsedSeconds / tournamentIntervalInSeconds) * tournamentIntervalInSeconds;

      // Calculate the next interval boundary
      const nextIntervalStart = currentIntervalStart + tournamentIntervalInSeconds;

      const remainingSeconds = nextIntervalStart - elapsedSeconds;

      responseData.remainingtime = remainingSeconds;

    } else {
      // If tournament_id does not exist, set default values
      responseData = {
        success: true,
        count: "5",
        registered: 0,
        operator: "creator",
        playmoney: 9.8,
        bonusmoney: 0.2,
        tournament_id,
        player_id,
        remainingtime: 60,
      };
    }

    // Respond with the formatted data
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error in getting registered tournament data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get registered tournament data.',
      error: error.message,
    });
  }
};


exports.getTournamentList =async function (req,res) {
  try {
    const tournaments = await Tournament.find({});

    const formattedTournaments = tournaments.map(tournament => ({
      id: tournament._id,
      tournament_name: tournament.tournamentName,
      bet_amount: tournament.betAmount,
      no_players: tournament.noPlayers,
      no_of_winners: tournament.winnerCount,
      tournament_interval: tournament.tournament_interval,
      four_player_winning_1: tournament.winningAmount1,
      four_player_winning_2: tournament.winningAmount2,
      four_player_winning_3: tournament.winningAmount3,
      two_player_winning: tournament.winningAmount // Adjust this based on your schema
    }));

    res.status(200).json({
      success: true,
      data: formattedTournaments
    });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tournaments.',
      error: error.message
    });
  }
};

// refund tournament Amount
exports.refundTournamentAmount = async function (req, res) {
  try {
    const { player_id, tournament_id, bonusmoney, playmoney } = req.body;

    const playmoneyNumeric = parseFloat(playmoney);
    const bonusmoneyNumeric = parseFloat(bonusmoney);

    const player = await Players.findOneAndUpdate(
      { _id: player_id },
      { $inc: { wallet_amount: playmoneyNumeric, bonus_ammount: bonusmoneyNumeric } },
      { new: true }
    );

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found.',
      });
    }

    // Update registered field in registeredTournament table
    const updatedRegistration = await RegisteredTournament.findOneAndUpdate(
      { player_id, tournament_id },
      { is_registered: 0 },
      { new: true }
    );

    if (!updatedRegistration) {
      return res.status(404).json({
        success: false,
        message: 'Player not registered for the given tournament.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Wallet and bonus updated successfully.',
      player,
      updatedRegistration,
    });
  }
  catch (error) {
    console.error('Error in refunding for tournaments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refund for tournaments.',
      error: error.message
    });
  }
};

// game history
exports.storeGameHistory = async function (req, res) {
  try {
      const { game_name, bet_amount, win_amount, game_result, no_ofplayers, time } = req.body;

      const newGameHistory = new GameHistory({
        game_name, 
        bet_amount, 
        win_amount, 
        game_result, 
        no_ofplayers, 
        time 
      });

      const savedGameHistory = await newGameHistory.save();
      // console.log("savedGameHistory", savedGameHistory)
      
      res.status(201).json({ status: "success",msg: "Game History data stored successfuly", savedGameHistory});
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Game History List
exports.getGameHistoryList =async function (req,res) {
  try {
    const gameHistoryList = await GameHistory.find()

    res.status(200).json({
      success: true,
      gameHistoryList
    });
  } catch (error) {
    console.error('Error fetching game History List:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game History List',
      error: error.message
    });
  }
};