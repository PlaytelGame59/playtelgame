const Players = require('../models/Players');
const FriendList = require('../models/FriendList');
const WithdrawDetails = require('../models/WithdrawDetails');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();
const multer = require('multer')
const fs = require('fs');
const configMulter = require('../configMulter');
const Tournament = require('../models/tournament');
const RegisteredTournament = require('../models/RegisteredTournament');
const Notification = require('../models/Notification');
const AdharKYC = require('../models/AdharKYC');
const PanKYC = require('../models/PanKYC')
const WalletHistory = require('../models/WalletHistory');
const GameHistory = require('../models/GameHistory');
const SaveBankDetails = require('../models/SaveBankDetails');
const UsedReferralcodeList = require('../models/UsedReferralcodeList');
const ObjectId = require('mongodb').ObjectId;
const Tesseract = require('tesseract.js');
const credentials = require('../config/credentials'); 
const axios = require('axios');
const FormData = require('form-data');


// exports.userLogin = async function (req, res) {
//   try {
//     const {
//       email,
//       first_name,
//       device_type,
//       device_token,
//       mobile
//     } = req.body;

//     // Check if the mobile number already exists in the Players table
//     let existingUser = await Players.findOne({
//       mobile
//     });

//     if (existingUser) {
//       // If the user exists, return the existing data without updating
//       return res.status(200).json({
//         success: true,
//         data: existingUser,
//         message: 'User already exists. Returning existing data.',
//       });
//     } else {
//       // If the user doesn't exist, create a new user entry

//       // Generate a random alpha-numeric code (e.g., a referral code)
//       const referral_code = crypto.randomBytes(6).toString('hex').toUpperCase();

//       // console.log('Generated Referral Code:', referral_code);
      
//       const fcm_token = jwt.sign({
//         mobile
//       }, process.env.JWT_SECRET, {
//         expiresIn: '1h'
//       }); // Using the secret key from .env

//       // Create a Players model instance
//       const player = new Players({
//         email,
//         first_name,
//         device_type,
//         device_token,
//         mobile,
//         referral_code: referral_code,
//         fcm_token: fcm_token
//       });

//       // Save the player instance to the database
//       const data = await player.save();

//       // console.log('Data after creation:', data);

//       return res.status(200).json({
//         success: true,
//         data,
//         fcm_token: fcm_token,
//         referral_code: referral_code,
//         message: 'New user created with referral code.',
//       });
//     }
//   } catch (error) {
//     console.error('Error in userLogin:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// };

exports.userLogin = async function (req, res) {
  try {
    const { email, first_name, device_type, device_token, mobile } = req.body;

    // Check if the mobile number already exists in the Players table
    let existingUser = await Players.findOne({ mobile });

    if (existingUser) {
      // If the user exists, return the existing data without updating
      return res.status(200).json({
        success: true,
        data: existingUser,
        message: 'User already exists. Returning existing data.',
      });
    } else {
      // If the user doesn't exist, create a new user entry

      // Generate a random alpha-numeric code (e.g., a referral code)
      const referral_code = generateReferralCode();

      // const fcm_token = jwt.sign({ mobile }, process.env.JWT_SECRET, {
      //   expiresIn: '1h',
      // }); // Using the secret key from .env

      // Create a Players model instance
      const player = new Players({
        email,
        first_name,
        device_type,
        device_token,
        mobile,
        referral_code,
        fcm_token,
      });

      // Save the player instance to the database
      const data = await player.save();

      return res.status(200).json({
        success: true,
        data,
        fcm_token,
        referral_code,
        message: 'New user created with referral code.',
      });
    }
  } catch (error) {
    console.error('Error in userLogin:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

function generateReferralCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const referralCodeLength = 6;
  let referralCode = '';

  for (let i = 0; i < referralCodeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters[randomIndex];
  }

  return referralCode;
}

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


// exports.getPlayerProfileImage = async function (req, res) {
//   try {
//     const {
//       player_id
//     } = req.body;

//     // Find player by player_id and select only the profile_image field
//     const player = await Players.findById(player_id).select('player_image');

//     if (!player) {
//       return res.status(200).json({
//         success: false,
//         message: 'Player not found.'
//       });
//     }

//     // Send the profile_image data in the response
//     res.status(200).json({
//       success: true,
//       player_image: player.player_image
//     });
//   } catch (error) {
//     console.error('Error fetching profile image:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch player profile image.',
//       error: error.message
//     });
//   }
// };

exports.getPlayerProfileImage = async function (req, res) {
  try {
    const { player_id } = req.body;

    // Find player by player_id and select only the profile_image field
    const player = await Players.findById(player_id).select('player_image');

    if (!player) {
      return res.status(200).json({
        success: false,
        message: 'Player not found.'
      });
    }

    // Extract the file name from the player_image path
    const fileName = player.player_image.replace(/^.*[\\/]/, '');

    // Send the file name in the response
    res.status(200).json({
      success: true,
      player_image: fileName
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
        email: player.email,
        join_code: player.join_code,
        no_of_loose: player.no_of_loose,
        no_of_total_win: player.no_of_total_win,
        is_banned: player.is_banned,
        is_adhar_kyc: player.is_adhar_kyc,
        is_pan_kyc: player.is_adhar_kyc,
        referral_code: player.referral_code,
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

// exports.sendWithdrawalRequest = async function (req, res) {
//   try {
//     const {
//       player_id,
//       amt_withdraw,
//       bank_account,
//       bank_ifsc
//     } = req.body;

//     // Create a new withdrawal request entry
//     const newWithdrawalRequest = new WithdrawDetails({
//       player_id,
//       amt_withdraw,
//       bank_account,
//       bank_ifsc
//     });

//     await newWithdrawalRequest.save();

//     res.status(200).json({
//       success: true,
//       message: 'Withdrawal request sent to admin.',
//       data: newWithdrawalRequest
//     });
//   } catch (error) {
//     console.error('Error sending withdrawal request:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to send withdrawal request.',
//       error: error.message
//     });
//   }
// };


// exports.sendWithdrawalRequest = async function (req, res) {
//   try {
//     const {
//       player_id,
//       amt_withdraw,
//       bank_account,
//       bank_ifsc
//     } = req.body;

//     // Check if there is a pending withdrawal request for the player
//     const existingWithdrawalRequest = await WithdrawDetails.findOne({
//       player_id,
//       status: 0 // 0 means pending
//     });

//     if (existingWithdrawalRequest) {
//       // Player has a pending withdrawal request, cannot send another one
//       return res.status(400).json({
//         success: false,
//         message: 'Cannot send another withdrawal request as a previous request is pending.',
//       });
//     }

//     // Create a new withdrawal request entry
//     const newWithdrawalRequest = new WithdrawDetails({
//       player_id,
//       amt_withdraw,
//       bank_account,
//       bank_ifsc
//     });

//     await newWithdrawalRequest.save();

//     res.status(200).json({
//       success: true,
//       message: 'Withdrawal request sent to admin.',
//       data: newWithdrawalRequest
//     });
//   } catch (error) {
//     console.error('Error sending withdrawal request:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to send withdrawal request.',
//       error: error.message
//     });
//   }
// };


exports.sendWithdrawalRequest = async function (req, res) {
  try {
    const {
      player_id,
      amt_withdraw,
      payment_type,
      bank_account,
      bank_ifsc,
      upi_id,
    } = req.body;

    // Get the player's data
    const player = await Players.findById(player_id);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found with the provided player_id.',
      });
    }

    // Check if the requested amount is greater than winning_amount
    if (amt_withdraw > player.winning_amount) {
      return res.status(400).json({
        success: false,
        message: 'Requested amount is greater than the available winning amount. Cannot process the withdrawal.',
      });
    }

    // Deduct the requested amount from winning_amount
    player.winning_amount -= amt_withdraw;

    // Deduct the requested amount from wallet_amount based on payment type
    if (payment_type === 'upi') {
      // Assuming upi_id is a field in the player document
      player.upi_id = upi_id;
      // You may want to perform additional validation for UPI payments
    } else if (payment_type === 'bank') {
      // Assuming bank_account and bank_ifsc are fields in the player document
      player.bank_account = bank_account;
      player.bank_ifsc = bank_ifsc;
      // You may want to perform additional validation for bank payments
    } else {
      // Handle other payment types if needed
    }

    // Save the changes to the player's documents
    await player.save();

    // Create a new withdrawal request entry
    const newWithdrawalRequest = new WithdrawDetails({
      player_id,
      amt_withdraw,
      bank_account: payment_type === 'bank' ? bank_account : null,
      bank_ifsc: payment_type === 'bank' ? bank_ifsc : null,
      upi_id: payment_type === 'upi' ? upi_id : null,
    });

    await newWithdrawalRequest.save();

    res.status(200).json({
      success: true,
      message: 'Requested amount withdrawn successfully.',
      // data: newWithdrawalRequest
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
    const { player_id } = req.body;

    // Validate if player_id is a valid ObjectId
    if (!ObjectId.isValid(player_id)) {
      return res.status(400).json({
        success: false,
        message: 'player_id is not valid',
      });
    }

    // Find all withdrawal records for the given player_id
    const withdrawHistory = await WithdrawDetails.find({ player_id });

    if (!withdrawHistory || withdrawHistory.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'Withdrawal History not found.',
      });
    }

    res.status(200).json({
      success: true,
      withdrawHistory,
    });
  } catch (error) {
    console.error('Error fetching withdrawal history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch withdrawal history.',
      error: error.message,
    });
  }
};

// get player's wallet history

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

// exports.getPlayerWalletHistory = async function (req, res) {
//   try {
//     const { player_id } = req.body;

//     if (!ObjectId.isValid(player_id)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Player ID is not valid.'
//       });
//     }

//     // Check if player_id exists in WalletHistory
//     const walletHistory = await WalletHistory.find({
//       player_id: player_id
//     });

//     if (!walletHistory || walletHistory.length === 0) {
//       return res.status(200).json({
//         success: false,
//         message: 'No wallet history for the specified user.'
//       });
//     }

//     // Separate entries for amount and bonus_amount if both are present
//     const separatedWalletHistory = [];

//     walletHistory.forEach((transaction) => {
//       const { amount, bonus_amount, ...rest } = transaction;

//       // Check if both amount and bonus_amount have values
//       if (amount !== undefined && amount !== null && bonus_amount !== undefined && bonus_amount !== null) {
//         // Create separate entries for amount and bonus_amount
//         separatedWalletHistory.push({
//           player_id,
//           type: 'debit',
//           wallet_type: 'play_balance',
//           amount,
//           ...rest
//         });

//         separatedWalletHistory.push({
//           player_id,
//           type: 'debit',
//           wallet_type: 'bonus_balance',
//           amount: bonus_amount,
//           ...rest
//         });
//       } else {
//         // Add the original entry to the response
//         separatedWalletHistory.push(transaction);
//       }
//     });

//     res.status(200).json({
//       success: true,
//       history: separatedWalletHistory
//     });
//   } catch (error) {
//     console.error('Error fetching wallet history:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch wallet history.',
//       error: error.message
//     });
//   }
// };

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



// exports.getleaderboard = async function (req, res) {
//   try {
//     const filter = {
//       type: 'credit',
//       wallet_type: 'winning_amount'
//     };

//     const aggregatedResults = await WalletHistory.aggregate([
//       { $match: filter },
//       {
//         $group: {
//           _id: '$player_id',
//           totalAmount: { $sum: { $toDouble: '$amount' } } // Convert amount to number
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           player_id: '$_id',
//           totalAmount: 1
//         }
//       }
//     ]);

//     return res.status(200).json({
//       success: true,
//       playerHistory: aggregatedResults
//     });
//   } catch (error) {
//     console.error('Error fetching player history:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to fetch player history',
//       error: error.message
//     });
//   }
// };

exports.getleaderboard = async function (req, res) {
  try {
    const filter = {
      type: 'credit',
      wallet_type: 'winning_amount'
    };

    const aggregatedResults = await WalletHistory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$player_id',
          totalAmount: { $sum: { $toDouble: '$amount' } } // Convert amount to number
        }
      },
      {
        $project: {
          _id: 0,
          player_id: '$_id',
          totalAmount: 1
        }
      }
    ]);

    const playerIds = aggregatedResults.map(result => result.player_id);

    // Fetch player names from the Player collection
    const players = await Players.find({ _id: { $in: playerIds } }, { _id: 1, first_name: 1, mobile: 1 });

    // Map player names to the aggregated results
    const leaderboardWithNames = aggregatedResults.map(result => {
      const playerInfo = players.find(player => player._id.equals(result.player_id));
      return {
        player_id: result.player_id,
        totalAmount: result.totalAmount,
        player_name: playerInfo ? playerInfo.first_name : 'Unknown',
        mobile_no: playerInfo ? playerInfo.mobile : 'not provided'
      };
    });

    return res.status(200).json({
      success: true,
      playerHistory: leaderboardWithNames
    });
  } catch (error) {
    console.error('Error fetching player history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch player history',
      error: error.message
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

    const newBankDetails = new SaveBankDetails({
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
    const { player_id } = req.body;

    if (!player_id) {
      return res.status(400).json({
        success: false,
        message: 'Player ID is required.'
      });
    }

    const notificationList = await Notification.find({
      player_Ids: { $in: [player_id] }
    });

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

// exports.registerTournament = async function (req, res) {
//   try {
//     // Extract data from the request body
//     const {
//       tournament_id,
//       player_id,
//       play_amount,
//       bonus_amount,
//       players_count
//     } = req.body;

//     // Check if the tournament exists
//     const tournament = await Tournament.findById(tournament_id);
//     if (!tournament) {
//       return res.status(400).json({ success: false, message: 'Tournament not found.' });
//     }

//     // Check if the player exists
//     const player = await Players.findById(player_id);
//     if (!player) {
//       return res.status(400).json({ success: false, message: 'Player not found.' });
//     }

//     // Create a new record in the registeredTournament table
//     const registeredTournament = new RegisteredTournament({
//       tournament_id,
//       player_id,
//       play_amount,
//       bonus_amount,
//       players_count
//     });

//     // Save the record
//     await registeredTournament.save();

//     // Respond with success message
//     return res.status(200).json({
//       "success": true,
//       "operator": "creator", 
//       "room_no": "736453"
//   });
//   } catch (error) {
//     console.error('Error registering player for tournament:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to register player for tournament.',
//       error: error.message
//     });
//   }
// };


// exports.registerTournament = async function (req, res) {
//   try {
//     // Extract data from the request body
//     const {
//       tournament_id,
//       player_id,
//       play_amount,
//       bonus_amount,
//       players_count
//     } = req.body;

//     // Check if the tournament exists
//     const tournament = await Tournament.findById(tournament_id);
//     if (!tournament) {
//       return res.status(400).json({
//         success: false,
//         message: 'Tournament not found.'
//       });
//     }

//     const tournamentIntervalInSeconds = parseInt(tournament.tournamentInterval) * 60;

//     const tournamentStartTime = new Date(tournament.createdAt);

//     const currentTime = new Date().getTime();
//     const timeDifference = currentTime - tournamentStartTime.getTime();
//     const elapsedSeconds = timeDifference / 1000;

//     // Calculate the current interval boundary
//     const currentIntervalStart = Math.floor(elapsedSeconds / tournamentIntervalInSeconds) * tournamentIntervalInSeconds;

//     // Calculate the next interval boundary
//     const nextIntervalStart = currentIntervalStart + tournamentIntervalInSeconds;

//     const remainingSeconds = nextIntervalStart - elapsedSeconds;

//     if (remainingSeconds <= 0) {
//       // Update is_registered to 0 if the remaining time is less than or equal to the tournament interval
//       await RegisteredTournament.findOneAndUpdate({ tournament_id, player_id }, { is_registered: 0 });
//     } else {
//       // Create a new record in the registeredTournament table
//       const registeredTournament = new RegisteredTournament({
//         tournament_id,
//         player_id,
//         play_amount,
//         bonus_amount,
//         players_count,
//         is_registered: 1
//       });

//       // Save the record
//       await registeredTournament.save();
//     }

//     // Respond with success message
//     return res.status(200).json({
//       success: true,
//       operator: "creator",
//       room_no: "736453"
//     });
//   } catch (error) {
//     console.error('Error registering player for tournament:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to register player for tournament.',
//       error: error.message
//     });
//   }
// };

// exports.registerTournament = async function (req, res) {
//   try {
//     // Extract data from the request body
//     const {
//       tournament_id,
//       player_id,
//       play_amount,
//       bonus_amount,
//       players_count
//     } = req.body;

//     // Check if the tournament exists
//     const tournament = await Tournament.findById(tournament_id);
//     if (!tournament) {
//       return res.status(400).json({
//         success: false,
//         message: 'Tournament not found.'
//       });
//     }

//     const tournamentIntervalInSeconds = parseInt(tournament.tournamentInterval) * 60;

//     const tournamentStartTime = new Date(tournament.createdAt);

//     const currentTime = new Date().getTime();
//     const timeDifference = currentTime - tournamentStartTime.getTime();
//     const elapsedSeconds = timeDifference / 1000;

//     // Calculate the current interval boundary
//     const currentIntervalStart = Math.floor(elapsedSeconds / tournamentIntervalInSeconds) * tournamentIntervalInSeconds;

//     // Calculate the next interval boundary
//     const nextIntervalStart = currentIntervalStart + tournamentIntervalInSeconds;
//     console.log("nextIntervalStart", new Date(nextIntervalStart * 1000))

//     const remainingSeconds = nextIntervalStart - elapsedSeconds;

//     console.log(currentTime + (remainingSeconds * 1000))

//     const valid_upto = new Date(currentTime + (remainingSeconds * 1000))
//     console.log(valid_upto);
//     if (remainingSeconds <= 0) {
//       // Update is_registered to 0 if the remaining time is less than or equal to the tournament interval
//       await RegisteredTournament.findOneAndUpdate({
//         tournament_id,
//         player_id
//       }, {
//         is_registered: 0
//       });
//     } else {
//       // Check if the player registered within the current interval
//       if (remainingSeconds < tournamentIntervalInSeconds) {
//         // Create a new record in the registeredTournament table
//         const registeredTournament = new RegisteredTournament({
//           tournament_id,
//           player_id,
//           play_amount,
//           bonus_amount,
//           players_count,
//           is_registered: 1
//         });

//         // Save the record
//         await registeredTournament.save();
//       } else {
//         // Update is_registered to 0 if the player registered in the next interval
//         await RegisteredTournament.findOneAndUpdate({ tournament_id, player_id }, { is_registered: 0 });
//       }
//     }

//     // Respond with success message
//     return res.status(200).json({
//       success: true,
//       operator: "creator",
//       room_no: "736453"
//     });
//   } catch (error) {
//     console.error('Error registering player for tournament:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to register player for tournament.',
//       error: error.message
//     });
//   }
// };

exports.registerTournament = async function (req, res) {
  try {
    // Extract data from the request body
    const {
      tournament_id,
      player_id,
      play_amount,
      bonus_amount,
      players_count,
      notes
    } = req.body;

    // Check if the tournament exists
    const tournament = await Tournament.findById(tournament_id);
    if (!tournament) {
      return res.status(400).json({
        success: false,
        message: 'Tournament not found.'
      });
    }

    const tournamentIntervalInSeconds = parseInt(tournament.tournamentInterval) * 60;

    const tournamentStartTime = new Date(tournament.createdAt);

    const currentTime = new Date().getTime();
    const timeDifference = currentTime - tournamentStartTime.getTime();
    const elapsedSeconds = timeDifference / 1000;

    // Calculate the current interval boundary
    const currentIntervalStart = Math.floor(elapsedSeconds / tournamentIntervalInSeconds) * tournamentIntervalInSeconds;

    // Calculate the next interval boundary
    const nextIntervalStart = currentIntervalStart + tournamentIntervalInSeconds;

    const remainingSeconds = nextIntervalStart - elapsedSeconds;

    const valid_upto = new Date(currentTime + (remainingSeconds * 1000));

    if (remainingSeconds <= 0) {
      // Update is_registered to 0 if the remaining time is less than or equal to the tournament interval
      await RegisteredTournament.findOneAndUpdate({
        tournament_id,
        player_id
      }, {
        is_registered: 0
      });
    } else {
      // Check if the player registered within the current interval
      if (remainingSeconds < tournamentIntervalInSeconds) {

        const player = await Players.findById(player_id);
        if (player) {
          // Deduct play_amount from wallet_amount
          player.wallet_amount -= play_amount;

          // Deduct bonus_amount from bonus_amount
          player.bonus_ammount -= bonus_amount;

          // Save the changes to the player's wallet_amount and bonus_amount
          await player.save();

          const playAmountTransaction = new WalletHistory({
            player_id: player._id,
            tournament: tournament_id,
            type: "debit",
            amount: play_amount,
            wallet_type: 'tournament_registration',
            notes: notes
            // Add other relevant fields as needed
          });

          // Save the wallet transaction
          await playAmountTransaction.save();

          if (bonus_amount !== "0") {
            const bonusAmountTransaction = new WalletHistory({
              player_id: player._id,
              tournament: tournament_id,
              type: "debit",
              amount: bonus_amount,
              wallet_type: 'tournament_registration',
              notes: notes
              // Add other relevant fields as needed
            });

            // Save the wallet transaction for bonus_amount
            await bonusAmountTransaction.save();
    }
        } else {
          return res.status(400).json({
            success: false,
            message: 'Player not found.'
          });
        }

        // Create a new record in the registeredTournament table
        const registeredTournament = new RegisteredTournament({
          tournament_id,
          player_id,
          play_amount,
          bonus_amount,
          players_count,
          is_registered: 1,
          valid_upto: valid_upto  // Set valid_upto to the calculated time
        });

        // Save the record
        await registeredTournament.save();

        // Schedule a job to update is_registered to 0 at valid_upto time for the newly registered player
        scheduleJobToUpdateIsRegistered(registeredTournament._id, valid_upto);
      } else {
        // Schedule a job to update is_registered to 0 at valid_upto time for an existing player
        scheduleJobToUpdateIsRegisteredForExistingPlayer(tournament_id, player_id, valid_upto);
      }
    }

    // Respond with success message
    return res.status(200).json({
      success: true,
      operator: "creator",
      room_no: "736453"
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

// Function to schedule a job to update is_registered to 0 at valid_upto time
function scheduleJobToUpdateIsRegistered(recordId, valid_upto) {
  const currentTime = new Date().getTime();
  const timeUntilUpdate = valid_upto.getTime() - currentTime;

  if (timeUntilUpdate > 0) {
    setTimeout(async () => {
      try {
        await RegisteredTournament.findByIdAndUpdate(recordId, { is_registered: 0 });
        console.log(`Updated is_registered to 0 for record with ID ${recordId} at ${new Date()}`);
      } catch (error) {
        console.error('Error updating is_registered:', error);
      }
    }, timeUntilUpdate);
  }
}

// Function to schedule a job to update is_registered to 0 at valid_upto time for an existing player
function scheduleJobToUpdateIsRegisteredForExistingPlayer(tournament_id, player_id, valid_upto) {
  const currentTime = new Date().getTime();
  const timeUntilUpdate = valid_upto.getTime() - currentTime;

  if (timeUntilUpdate > 0) {
    setTimeout(async () => {
      try {
        await RegisteredTournament.findOneAndUpdate({ tournament_id, player_id }, { is_registered: 0 });
        console.log(`Updated is_registered to 0 for player ${player_id} in tournament ${tournament_id} at ${new Date()}`);
      } catch (error) {
        console.error('Error updating is_registered:', error);
      }
    }, timeUntilUpdate);
  }
}


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

exports.unregisterPlayerForTournament = async function (req, res) {
  try {
    // Extract data from the request body
    const {
      tournament_id,
      player_id,
      refund,
      is_registered
    } = req.body;

    // Check if the tournament exists
    const tournament = await Tournament.findById(tournament_id);
    if (!tournament) {
      return res.status(400).json({
        success: false,
        message: 'Tournament not found.'
      });
    }

    // Check if the player exists
    const player = await Players.findById(player_id);
    if (!player) {
      return res.status(400).json({
        success: false,
        message: 'Player not found.'
      });
    }

    // Update is_registered field in the RegisteredTournament table
    await RegisteredTournament.findOneAndUpdate({
      tournament_id,
      player_id
    }, {
      is_registered
    });

    // If refund is provided, add the refund amount to the player's wallet_amount
    if (refund && refund > 0) {
      // Update wallet_amount in the Players table
      await Players.findByIdAndUpdate(player_id, {
        $inc: {
          wallet_amount: refund
        }
      });
    }

    // Respond with success message
    return res.status(200).json({
      success: true,
      message: "Player unregistered successfully"
    });
  } catch (error) {
    console.error('Error unregistering player for tournament:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unregister player for tournament.',
      error: error.message
    });
  }
};


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
    const { notification_id } = req.body;

    if (!notification_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide notification_id.',
      });
    }

    // Find the notice by ID and remove it
    const deletedNotification = await Notification.findByIdAndDelete(notification_id);

    if (!deletedNotification) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notice deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting notice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notice.',
      error: error.message,
    });
  }
};


const uploadAdharImage = configMulter('playerAdahrImage/', [{
    name: 'aadhar_front_image',
    maxCount: 1
  },
  {
    name: 'aadhar_back_image',
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
      const {
        player_id,
        aadhar_no
      } = req.body;

      // Check if player_id is provided
      if (!player_id) {
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
      const aadhar_front_image = req.files['aadhar_front_image'] ? req.files['aadhar_front_image'][0].path.replace(/^.*playerAdahrImage[\\/]/, 'playerAdahrImage/') : '';
      const aadhar_back_image = req.files['aadhar_back_image'] ? req.files['aadhar_back_image'][0].path.replace(/^.*playerAdahrImage[\\/]/, 'playerAdahrImage/') : '';

      const adharKYC = new AdharKYC({
        player_id: player_id,
        aadhar_no: aadhar_no,
        aadhar_front_image: aadhar_front_image,
        aadhar_back_image: aadhar_back_image
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

// exports.getTournamentDetails = async function (req, res) {
//   try {
//     const {
//       player_id,
//       tournament_id
//     } = req.body;

//     // Check if tournament_id is present in the Tournament table
//     const tournamentData = await Tournament.findOne({
//       _id: tournament_id
//     });

//     let responseData;

//     if (tournamentData) {
//       // Calculate remaining time for the tournament based on repeating intervals
//       const currentTime = new Date().getTime();
//       // If tournament_id is present, update the response with tournament details
//       const playerData = await RegisteredTournament.findOne({
//         $and: [{
//           player_id: player_id
//         }, {
//           tournament_id: tournament_id
//         }]
//       }).sort({
//         createdAt: -1
//       });
//       const playerCount = await RegisteredTournament.countDocuments({
//         tournament_id
//       });

//       let registered = 0;

//       registered = (playerData && playerData.valid_upto < currentTime) ? 1 : 0;

//       responseData = {
//         success: true,
//         count: playerCount.toString(),
//         registered: registered,
//         operator: "creator",
//         tournament_id,
//         player_id,
//       };

//       // Fetch betAmount from tournamentData
//       const betAmount = parseFloat(tournamentData.betAmount) || 0; // Convert to float and set a default value if betAmount is undefined
//       const playMoneyPercentage = 98;
//       const bonusMoneyPercentage = 2;

//       responseData.playmoney = (playMoneyPercentage / 100) * betAmount;
//       responseData.bonusmoney = (bonusMoneyPercentage / 100) * betAmount;

//       // Convert tournamentInterval to a numerical value (in seconds)
//       const tournamentIntervalInSeconds = parseInt(tournamentData.tournamentInterval) * 60;

//       // Convert createdAt to a formatted time string
//       const tournamentStartTime = new Date(tournamentData.createdAt);

//       const timeDifference = currentTime - tournamentStartTime.getTime();
//       const elapsedSeconds = timeDifference / 1000;

//       // Calculate the current interval boundary
//       const currentIntervalStart = Math.floor(elapsedSeconds / tournamentIntervalInSeconds) * tournamentIntervalInSeconds;

//       // Calculate the next interval boundary
//       const nextIntervalStart = currentIntervalStart + tournamentIntervalInSeconds;

//       const remainingSeconds = nextIntervalStart - elapsedSeconds;

//       responseData.remainingtime = remainingSeconds;

//       responseData.remainingtime
//     } else {
//       // If tournament_id does not exist, set default values
//       responseData = {
//         success: true,
//         count: "5",
//         registered: 0,
//         operator: "creator",
//         playmoney: 9.8,
//         bonusmoney: 0.2,
//         tournament_id,
//         player_id,
//         remainingtime: 60,
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
    const {
      player_id,
      tournament_id
    } = req.body;

    // Check if tournament_id is present in the Tournament table
    const tournamentData = await Tournament.findOne({
      _id: tournament_id
    });

    let responseData;

    if (tournamentData) {
      // If tournament_id is present, update the response with tournament details
      const playerData = await RegisteredTournament.findOne({
        player_id,
        tournament_id
      }).sort({
        createdAt: -1
      });

      const playerCount = await RegisteredTournament.countDocuments({
        tournament_id
      });

      let is_registered = 0;

      if (playerData) {
        // Fetch the is_registered field from the document
        is_registered = playerData.is_registered;
      }

      responseData = {
        success: true,
        count: playerCount.toString(),
        is_registered,
        operator: "creator",
        tournament_id,
        player_id,
      };

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
        is_registered: 0,
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

exports.getTournamentList = async function (req, res) {
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
    const {
      player_id,
      tournament_id,
      bonusmoney,
      playmoney
    } = req.body;

    const playmoneyNumeric = parseFloat(playmoney);
    const bonusmoneyNumeric = parseFloat(bonusmoney);

    const player = await Players.findOneAndUpdate({
      _id: player_id
    }, {
      $inc: {
        wallet_amount: playmoneyNumeric,
        bonus_ammount: bonusmoneyNumeric
      }
    }, {
      new: true
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found.',
      });
    }

    // Update registered field in registeredTournament table
    const updatedRegistration = await RegisteredTournament.findOneAndUpdate({
      player_id,
      tournament_id
    }, {
      is_registered: 0
    }, {
      new: true
    });

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
  } catch (error) {
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
    const {
      user_id,
      game_name,
      bet_amount,
      win_amount,
      game_result,
      no_ofplayers,
      time
    } = req.body;

    // // Check if the player_id exists in the Players table
    // const player = await Players.findById(user_id);
    // if (!player) {
    //   return res.status(400).json({
    //     status: 'error',
    //     message: 'Player not found with the provided player_id.'
    //   });
    // }

    const newGameHistory = new GameHistory({
      player_id: user_id,
      game_name,
      bet_amount,
      win_amount,
      game_result,
      no_ofplayers,
      time
    });

    const savedGameHistory = await newGameHistory.save();

    res.status(201).json({
      status: 'success',
      message: 'Game History data stored successfully',
      savedGameHistory
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error'
    });
  }
};
// Game History List
exports.getGameHistoryList = async function (req, res) {
  try {
    const {
      player_id
    } = req.body;

    // Check if player_id is provided
    if (!player_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a player_id.'
      });
    }

    const gameHistoryList = await GameHistory.find({
      player_id
    });

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


// ************************* start pan card upload and verification ************************* 

const uploadPanImage = configMulter('playerPanImage/', [{
  name: 'pan_image',
  maxCount: 1
}]);

exports.playerPanImage = async function (req, res) {
  uploadPanImage(req, res, async function (err) {
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
        pan_no
      } = req.body;

      // Check if player_id is provided
      if (!player_id) {
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

      // Save the details in the pan KYC table
      const pan_image = req.files['pan_image'] ? req.files['pan_image'][0].path.replace(/^.*playerPanImage[\\/]/, 'playerPanImage/') : '';

      // Save the pan_image path in the players table
      existingPlayer.pan_image = pan_image;
      await existingPlayer.save();

      const panKYC = new PanKYC({
        player_id: player_id,
        pan_no: pan_no,
        pan_image: pan_image,
        // pan_ocr_data: text // Store the extracted text from OCR
      });

      await panKYC.save();

      res.status(200).json({
        success: true,
        message: 'panKYC details saved successfully.',
        data: panKYC,
        panImagePath: pan_image
      });
    } catch (error) {
      console.error('Error saving panKYC details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save panKYC details.',
        error: error.message
      });
    }
  });
};

// Function to obtain an authentication token
// exports.generatePanVerificationToken = async function (req, res) {
  
//   try {
//     const { clientId, clientSecret } = req.body;
//   // console.log(clientId, clientSecret);

//   const tokenEndpoint = 'https://paytelverify.com/PaytelVerifySuite/verification/api/v1/pan/authorize/panocr';

//     const response = await axios.post(tokenEndpoint, {
//       clientId: clientId,
//       clientSecret: clientSecret,
//     });
//     const responseData = response.data;

//     console.log(responseData);
//     if (responseData.Status === 'SUCCESS' && responseData.Subcode === '200') {
//       res.json({
//         success: true,
//         message: responseData.Message,
//         token: responseData.Token,
//         expiry: responseData.Expiry,
//       });
//     } else {
//       console.error('Token generation failed:', responseData);
//       res.status(400).json({
//         success: false,
//         message: 'Token generation failed',
//         details: responseData,
//       });
//     }
//   } catch (error) {
//     console.error('Error generating PAN verification token:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Internal Server Error',
//       error: error.message,
//     });
//   }
// };


const generateUniqueVerificationId = () => {
  const randomNumber = Math.floor(Math.random() * 100) + 1; // Generate a random number between 1 and 100
  return 'v' + randomNumber;
};


exports.generatePanVerificationToken = async function (req, res) {
  try {
    const { clientId, clientSecret } = req.body;

    const tokenEndpoint = 'https://paytelverify.com/PaytelVerifySuite/verification/api/v1/pan/authorize/panocr';

    // Generate verification_id
    const verification_id = generateUniqueVerificationId();

    const response = await axios.post(tokenEndpoint, {
      clientId: clientId,
      clientSecret: clientSecret,
      verification_id: verification_id, // Include verification_id in the request
    });

    const responseData = response.data;

    console.log(responseData);
    if (responseData.Status === 'SUCCESS' && responseData.Subcode === '200') {
      res.json({
        success: true,
        message: responseData.Message,
        token: responseData.Token,
        expiry: responseData.Expiry,
        verification_id: verification_id, // Include verification_id in the response
      });
    } else {
      console.error('Token generation failed:', responseData);
      res.status(400).json({
        success: false,
        message: 'Token generation failed',
        details: responseData,
      });
    }
  } catch (error) {
    console.error('Error generating PAN verification token:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};


// const generateUniqueVerificationId = () => {
//   const randomNumber = Math.floor(Math.random() * 100) + 1; // Generate a random number between 1 and 100
//   return 'v' + randomNumber;
// };

// const generatePanVerificationToken = async (verificationId, clientId, clientSecret) => {
//   try {
//     const tokenEndpoint = 'https://paytelverify.com/PaytelVerifySuite/verification/api/v1/pan/authorize/panocr';
//     const response = await axios.post(tokenEndpoint, {
//       clientId: clientId,
//       clientSecret: clientSecret,
//       verification_id: verificationId,
//     });

//     const responseData = response.data;

//     if (responseData.Status === 'SUCCESS' && responseData.Subcode === '200') {
//       return {
//         success: true,
//         message: responseData.Message,
//         token: responseData.Token,
//         expiry: responseData.Expiry,
//         verification_id: verificationId,
//       };
//     } else {
//       console.error('Token generation failed:', responseData);
//       return {
//         success: false,
//         message: 'Token generation failed',
//         details: responseData,
//       };
//     }
//   } catch (error) {
//     console.error('Error generating PAN verification token:', error.message);
//     return {
//       success: false,
//       message: 'Internal Server Error',
//       error: error.message,
//     };
//   }
// };

// const uploadPan = configMulter('playerPanImage/', [{
//   name: 'front_image',
//   maxCount: 1
// }]);

// exports.verifyPanWithOCR = async function (req, res) {
//   try {
//     uploadPan(req, res, async function (err) {
//       if (err instanceof multer.MulterError) {
//         return res.status(500).json({
//           success: false,
//           message: 'Multer error',
//           error: err
//         });
//       } else if (err) {
//         return res.status(500).json({
//           success: false,
//           message: 'Error uploading file',
//           error: err
//         });
//       }

//       const {
//         verification_id,
//         clientid,
//         token,
//         pipe
//       } = req.body;

//       // Check if necessary parameters are provided
//       if (!verification_id || !clientid || !token || !pipe) {
//         return res.status(400).json({
//           success: false,
//           message: 'Verification ID, Client ID, Token, and Pipe are required.'
//         });
//       }

//       // Verify PAN using OCR
//       const front_image = req.files['front_image'] ? req.files['front_image'][0].path.replace(/^.*playerPanImage[\\/]/, 'playerPanImage/') : '';

//       const panVerifyEndpoint = 'https://paytelverify.com/PaytelVerifySuite/verification/api/v1/pan/panocr';

//       const formData = new FormData();
//       // Correct the field name here
//       formData.append('front_image', fs.createReadStream(front_image));
//       formData.append('verification_id', verification_id);
//       formData.append('clientid', clientid);
//       formData.append('token', token);
//       formData.append('pipe', pipe);

//       try {
//         const response = await axios.post(panVerifyEndpoint, formData, {
//           headers: {
//             ...formData.getHeaders(),
//           },
//         });

//         const responseData = response.data;

//         if (responseData.status === 'Success' && responseData.respCode === '00') {
//           const {
//             valid,
//             reference_id,
//             dob,
//             father,
//             name,
//             pan_type,
//             message,
//             pan,
//             respCode,
//             age,
//             status,
//             verification_id,
//           } = responseData;

//           // Process the successful response as needed
//           res.status(200).json({
//             success: true,
//             message: 'PAN verification successful.',
//             data: {
//               valid,
//               reference_id,
//               dob,
//               father,
//               name,
//               pan_type,
//               message,
//               pan,
//               respCode,
//               age,
//               status,
//               verification_id,
//             },
//           });
//         } else {
//           // Handle the case where PAN verification fails
//           res.status(400).json({
//             success: false,
//             message: 'PAN verification failed',
//             details: responseData,
//           });
//         }
//       } catch (error) {
//         // Handle API request errors
//         res.status(500).json({
//           success: false,
//           message: 'Internal Server Error',
//           error: error.message,
//         });
//       }
//     });
//   } catch (error) {
//     console.error('Error in PAN verification:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Internal Server Error',
//       error: error.message,
//     });
//   }
// };

const verifyPanImage = multer({
  storage: multer.memoryStorage(),
}).single('front_image');

exports.verifyPanWithOCR = async function (req, res) {
  try {
    verifyPanImage(req, res, async function (err) {
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

      // Check if req.file is defined and has a buffer property
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or missing file in the request.',
        });
      }

      // const verificationId = generateUniqueVerificationId();
      // const clientId = 'PAYTEL123456';
      // const clientSecret = '4444'; // Replace with your actual client secret

      // Generate PAN verification token
      // const tokenResult = await generatePanVerificationToken(verificationId, clientId, clientSecret);

      // if (!tokenResult.success) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'Failed to generate PAN verification token',
      //     details: tokenResult.details,
      //   });
      // }

      // Create form data for the third-party API
      const formData = new FormData();
      formData.append('front_image', req.file.buffer);
      formData.append('verification_id', verificationId);
      formData.append('clientid', clientId);
      formData.append('token', token);
      formData.append('pipe', '2');

      // Make the HTTP POST request to the third-party API
      const response = await axios.post('https://paytelverify.com/PaytelVerifySuite/verification/api/v1/pan/panocr', formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });

      // Handle the response
      if (response.status === 200 && response.data.valid === 'true') {
        console.log('PAN verification successful');
        console.log('Response Data:', response.data);

        // You can send a success response to the client
        res.status(200).json({
          success: true,
          message: 'PAN verification successful',
          data: {
            valid: response.data.valid,
            reference_id: response.data.reference_id,
            dob: response.data.dob,
            father: response.data.father,
            name: response.data.name,
            pan_type: response.data.pan_type,
            message: response.data.message,
            pan: response.data.pan,
            respCode: response.data.respCode,
            age: response.data.age,
            status: response.data.status,
            verification_id: response.data.verification_id,
          },
        });
      } else {
        console.log('PAN verification failed');
        console.log('Response Data:', response.data);

        // You can send a failed response to the client
        res.status(400).json({
          success: false,
          message: 'PAN verification failed',
          data: response.data,
        });
      }
    });
  } catch (error) {
    console.error('Error verifying PAN with third-party API:', error.message);

    // Send an error response to the client
    res.status(500).json({
      success: false,
      message: 'Error verifying PAN with third-party API',
      error: error.message,
    });
  }
};


// ************************* end of pan card upload and verification ************************* 

// ************************* start of Aadhar card upload and verification ************************* 


exports.generateAdharVerificationToken = async function (req, res) {
  
  try {
    const { clientId, clientSecret } = req.body;
  // console.log(clientId, clientSecret);

  const tokenEndpoint = 'https://paytelverify.com/PaytelVerifySuite/verification/api/v1/adhaarocr/authorize'
  ;

    const response = await axios.post(tokenEndpoint, {
      clientId: clientId,
      clientSecret: clientSecret,
    });
    const responseData = response.data;

    console.log(responseData);
    if (responseData.Status === 'SUCCESS' && responseData.Subcode === '200') {
      res.json({
        success: true,
        message: responseData.Message,
        token: responseData.Token,
        expiry: responseData.Expiry,
      });
    } else {
      console.error('Token generation failed:', responseData);
      res.status(400).json({
        success: false,
        message: 'Token generation failed',
        details: responseData,
      });
    }
  } catch (error) {
    console.error('Error generating PAN verification token:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// const uploadAadharImage = configMulter('playerAadharImage/', [
//   { name: 'aadhar_front_image', maxCount: 1 },
//   { name: 'aadhar_back_image', maxCount: 1 }
// ]);

// exports.verifyAadharWithOCR = async function (req, res) {
//   try {
//     uploadAadharImage(req, res, async function (err) {
//       if (err instanceof multer.MulterError) {
//         return res.status(500).json({
//           success: false,
//           message: 'Multer error',
//           error: {
//             name: err.name,
//             message: err.message,
//             code: err.code,
//             field: err.field,
//             storageErrors: err.storageErrors
//           }
//         });
//       } else if (err) {
//         return res.status(500).json({
//           success: false,
//           message: 'Error uploading file',
//           error: err
//         });
//       }

//       const { verification_id, clientid, token, pipe } = req.body;

//       // Check if necessary parameters are provided
//       if (!verification_id || !clientid || !token || !pipe) {
//         return res.status(400).json({
//           success: false,
//           message: 'Verification ID, Client ID, Token, and Pipe are required.'
//         });
//       }

//       // Verify Aadhaar using OCR
//       const aadhar_front_image = req.files['aadhar_front_image'] ? req.files['aadhar_front_image'][0].path : '';
//       const aadhar_back_image = req.files['aadhar_back_image'] ? req.files['aadhar_back_image'][0].path : '';

//       if (!fs.existsSync(aadhar_front_image) || !fs.existsSync(aadhar_back_image)) {
//         return res.status(400).json({
//           success: false,
//           message: 'Aadhaar image file not found.'
//         });
//       }

//       const aadharVerifyEndpoint = 'https://paytelverify.com/PaytelVerifySuite/verification/api/v1/adhaarocr';

//       const formData = new FormData();
//       formData.append('aadhar_front_image', fs.createReadStream(aadhar_front_image));
//       formData.append('aadhar_back_image', fs.createReadStream(aadhar_back_image));
//       formData.append('verification_id', verification_id);
//       formData.append('clientid', clientid);
//       formData.append('token', token);
//       formData.append('pipe', pipe);

//       try {
//         const response = await axios.post(aadharVerifyEndpoint, formData, {
//           headers: { ...formData.getHeaders() },
//         });

//         const responseData = response.data;

//         if (responseData.status === 'VALID' && responseData.respCode === '00') {
//           const {
//             pincode, address, gender, reference_id, father,
//             message, adhaar_no, year_of_birth, verification_id,
//             valid, name, state, respCode, status
//           } = responseData;

//           // Process the successful response as needed
//           res.status(200).json({
//             success: true,
//             message: 'Aadhaar verification successful.',
//             data: {
//               pincode, address, gender, reference_id, father,
//               message, adhaar_no, year_of_birth, verification_id,
//               valid, name, state, respCode, status
//             },
//           });
//         } else {
//           // Handle the case where Aadhaar verification fails
//           res.status(400).json({
//             success: false,
//             message: 'Aadhaar verification failed',
//             details: responseData,
//           });
//         }
//       } catch (error) {
//         // Handle API request errors
//         res.status(500).json({
//           success: false,
//           message: 'Internal Server Error',
//           error: error.message,
//         });
//       }
//     });
//   } catch (error) {
//     console.error('Error in Aadhaar verification:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Internal Server Error',
//       error: error.message,
//     });
//   }
// };
const uploadAadharImage = configMulter('playerAadharImage/', [
  { name: 'aadhar_front_image', maxCount: 1 },
  { name: 'aadhar_back_image', maxCount: 1 }
]);

exports.verifyAadharWithOCR = async function (req, res) {
  try {
    uploadAadharImage(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(500).json({
          success: false,
          message: 'Multer error',
          error: {
            name: err.name,
            message: err.message,
            code: err.code,
            field: err.field,
            storageErrors: err.storageErrors
          }
        });
      } else if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error uploading file',
          error: err
        });
      }

      const { verification_id, clientid, token, pipe } = req.body;

      // Check if necessary parameters are provided
      if (!verification_id || !clientid || !token || !pipe) {
        return res.status(400).json({
          success: false,
          message: 'Verification ID, Client ID, Token, and Pipe are required.'
        });
      }

      // Verify Aadhaar using OCR
      const aadhar_front_image = req.files['aadhar_front_image'] ? req.files['aadhar_front_image'][0].path : '';
      const aadhar_back_image = req.files['aadhar_back_image'] ? req.files['aadhar_back_image'][0].path : '';

      if (!fs.existsSync(aadhar_front_image) || !fs.existsSync(aadhar_back_image)) {
        return res.status(400).json({
          success: false,
          message: 'Aadhaar image file not found.'
        });
      }

      const aadharVerifyEndpoint = 'https://paytelverify.com/PaytelVerifySuite/verification/api/v1/adhaarocr';

      const formData = new FormData();
      formData.append('aadhar_front_image', fs.createReadStream(aadhar_front_image));
      formData.append('aadhar_back_image', fs.createReadStream(aadhar_back_image));
      formData.append('verification_id', verification_id);
      formData.append('clientid', clientid);
      formData.append('token', token);
      formData.append('pipe', pipe);

      try {
        const response = await axios.post(aadharVerifyEndpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data', ...formData.getHeaders() },
        });

        const responseData = response.data;

        if (responseData.status === 'VALID' && responseData.respCode === '00') {
          // Process the successful response as needed
          res.status(200).json({
            success: true,
            message: 'Aadhaar verification successful.',
            data: responseData,
          });
        } else {
          // Handle the case where Aadhaar verification fails
          res.status(400).json({
            success: false,
            message: 'Aadhaar verification failed',
            details: responseData,
          });
        }
      } catch (error) {
        // Handle API request errors
        res.status(500).json({
          success: false,
          message: 'Internal Server Error',
          error: error.message,
        });
      }
    });
  } catch (error) {
    console.error('Error in Aadhaar verification:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// ************************* start of Aadhar card upload and verification ************************* 

// send notification

// apply referral code 

exports.applyReferralCode = async function (req, res) {
  try {
    const { player_id, referral_code } = req.body;

    // Check if the provided player_id exists in the Players table
    const player = await Players.findById(player_id);

    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found.',
      });
    }

    // Check if the provided referral_code exists in the Players table
    const referredPlayer = await Players.findOne({ referral_code });

    if (!referredPlayer) {
      return res.status(400).json({
        success: false,
        message: 'Invalid referral code. Player not found.',
      });
    }

    // Check if the player is trying to use their own referral code
    if (player._id.toString() === referredPlayer._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot use your own referral code.',
      });
    }

    // Check if the player has already used a referral code
    if (player.join_code) {
      return res.status(400).json({
        success: false,
        message: 'Player has already used a referral code.',
      });
    }

    // Check if the referral code has already been used
    if (referredPlayer.join_code_used) {
      return res.status(400).json({
        success: false,
        message: 'Referral code has already been used.',
      });
    }

    // Save the referral code in the join_code field of the player
    player.join_code = referral_code;
    await player.save();

    // Mark the referred player's referral code as used
    referredPlayer.join_code_used = true;
    await referredPlayer.save();

    // Create a new entry in UsedReferralcodeList table
    const usedReferralEntry = new UsedReferralcodeList({
      used_referral_code: referral_code,
      player_id: player_id,
      friend_id: referredPlayer._id,
    });
    await usedReferralEntry.save();

    return res.status(200).json({
      success: true,
      data: {
        player_using_referral_code: player,
        referred_player: referredPlayer,
        used_referral_entry: usedReferralEntry,
      },
      message: 'Referral code saved successfully.',
    });
  } catch (error) {
    console.error('Error in applyReferralCode:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// used referral code list
exports.getUsedReferralCodeList = async function (req, res) {
  try {
    const usedReferralcodeList = await UsedReferralcodeList.find({});

    res.status(200).json({
      success: true,
      data: usedReferralcodeList
    });
  } catch (error) {
    console.error('Error fetching used Referral code List:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch used Referral code List.',
      error: error.message
    });
  }
};

// refund to player 
// exports.refundForTournament = async function (req, res) {
//   try {
//     const { player_id, tournament_id, play_amount, bonus_amount } = req.body;

//     // Update winning_amount and bonus_amount in the Players table
//     const updatedPlayer = await Players.findByIdAndUpdate(
//       player_id,
//       {
//         $inc: { winning_amount: play_amount, bonus_ammount: bonus_amount }
//       },
//       { new: true }
//     );

//     if (!updatedPlayer) {
//       return res.status(404).json({
//         success: false,
//         message: 'Player not found.'
//       });
//     }


//     return res.status(200).json({
//       success: true,
//       message: 'Tournament payment processed successfully.',
//       data: {
//         player: updatedPlayer,
//         tournament: unregisterResult
//       }
//     });
//   } catch (error) {
//     console.error('Error processing tournament payment:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// get all notification
exports.getAllNotification = async function (req, res) {
  try {
    const notification = await Notification.find();

    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error('Error fetching Notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Notification.',
      error: error.message,
    });
  }
};

