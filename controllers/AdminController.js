const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Tournament = require("../models/tournament");
const Disclaimer = require('../models/Disclaimer');
const Notification = require('../models/Notification');
const configMulter = require('../configMulter')
const multer = require('multer');
const Players = require('../models/Players');
const WithdrawDetails = require('../models/WithdrawDetails');
// const Transaction = require('../models/TransactionModel');
const WalletHistory = require('../models/WalletHistory');
const Notice = require('../models/Notice');
const AdharKYC = require('../models/AdharKYC');
const PanKYC = require('../models/PanKYC');
const notificationService = require('../notificationService');


// Admin module <----------------------->
exports.signUp = async function (req, res) {
  const {
    username,
    email,
    password
  } = req.body

  const isUser = await Admin.findOne({
    email
  })
  if (isUser) {
    res.send({
      msg: "user already exits please login",
      isUser
    })
  } else {
    bcrypt.hash(password, 5, async function (err, hash) {
      if (err) {
        res.send({
          msg: "something went wrong, plz try again later",
          err
        })
      } else {
        const user = new Admin({
          username,
          email,
          password: hash
        })
        try {
          await user.save()
          res.status(200).send({
            msg: "signUp Successful",
            user
          })
        } catch (err) {
          console.log(err)
          res.send({
            msg: "something went wrong, plz try again",
            err
          })
        }
      }
    });
  }
}

// exports.login = async function (req, res) {
//   const {
//     email,
//     password
//   } = req.body;

//   const user = await Admin.findOne({
//     email
//   });

//   if (!user) {
//     return res.status(401).json({
//       msg: 'Invalid credentials'
//     });
//   }

//   const isPasswordValid = await bcrypt.compare(password, user.password);

//   if (isPasswordValid) {
//     const token = jwt.sign({
//       userId: user._id
//     }, process.env.JWT_SECRET);
//     return res.json({
//       msg: 'Login successful',
//       token,
//       userId: user._id
//     });
//   } else {
//     return res.status(401).json({
//       msg: 'Invalid credentials'
//     });
//   }
// };


exports.login = async function (req, res) {
  const { email, password } = req.body;

  try {
    const user = await Admin.findOne({ email });

    if (!user) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      return res.json({ msg: 'Login successful', token, userId: user._id });
    } else {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Internal server error' });
  }
};

exports.resetPassword = async function (req, res) {
  const {
    userId,
    newPassword,
    confirmPassword
  } = req.body;

  try {
    // Validate new password and confirm password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match'
      });
    }
    console.log(newPassword)
    // Update user's password in the database
    const hashedPassword = await bcrypt.hash(newPassword, 5);
    await Admin.updateOne({
      _id: userId
    }, {
      password: hashedPassword
    });

    console.log('Password reset successfully', hashedPassword);
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during password reset'
    });
  }
};


exports.addTorunment = async function (req, res) {
  try {
    const {
      tournamentName,
      betAmount,
      noPlayers,
      winningAmount,
      winningAmount1,
      winningAmount2,
      winningAmount3,
      tournamentInterval,
      tournamentType,
      tournamentStatus
    } = req.body;

    // Parse noPlayers as an integer before comparison
    const parsedNoPlayers = parseInt(noPlayers);

    // Set winnerCount based on noPlayers
    let winnerCount;
    if (parsedNoPlayers === 2 || parsedNoPlayers === 3) {
      winnerCount = 1;
    } else if (parsedNoPlayers === 4) {
      winnerCount = 3;
    } else {
      // Handle other values if needed
      winnerCount = 0; // Default value
    }

    console.log("noPlayers:", parsedNoPlayers);
    console.log("winnerCount:", winnerCount);

    // Create a new instance of the TournamentModel
    const newTournament = new Tournament({
      tournamentName,
      betAmount,
      noPlayers,
      winningAmount,
      winnerCount,
      winningAmount1,
      winningAmount2,
      winningAmount3,
      tournamentInterval,
      tournamentType,
      tournamentStatus
    });

    // Save the new tournament to the database
    const savedTournament = await newTournament.save();

    // Respond with the saved tournament data
    res.status(201).json({
      msg: "add tournament data successfuly",
      savedTournament,
      status: "success"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

exports.getTorunment = async function (req, res) {
  try {
    // Fetch all tournament from the database
    const tournament = await Tournament.find();

    // Respond with the list of tournament
    res.status(200).json({
      msg: 'sucessfull',
      tournament
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error',
      error
    });
  }
}

exports.updateTournament = async function (req, res) {
  try {
    const tournamentId = req.body.tournamentId;
    const {
      tournamentName,
      betAmount,
      noPlayers,
      winningAmount,
      // winnerCount,
      winningAmount1,
      winningAmount2,
      winningAmount3,
      tournamentInterval,
      tournamentType,
      tournamentStatus
    } = req.body;

    // Parse noPlayers as an integer before comparison
    const parsedNoPlayers = parseInt(noPlayers);

    // Set winnerCount based on noPlayers
    let winnerCount;
    if (parsedNoPlayers === 2 || parsedNoPlayers === 3) {
      winnerCount = 1;
    } else if (parsedNoPlayers === 4) {
      winnerCount = 3;
    } else {
      // Handle other values if needed
      winnerCount = 0; // Default value
    }

    console.log("noPlayers:", noPlayers);
    console.log("winnerCount:", winnerCount);
    // Find the tournament by ID
    let tournament = await Tournament.findById(tournamentId);

    if (tournament) {
      // Prepare update object based on provided fields
      const updateFields = {};
      if (tournamentName) updateFields.tournamentName = tournamentName;
      if (betAmount) updateFields.betAmount = betAmount;
      if (noPlayers) updateFields.noPlayers = noPlayers;
      if (winningAmount) updateFields.winningAmount = winningAmount;
      if (winnerCount) updateFields.winnerCount = winnerCount;
      if (winningAmount1) updateFields.winningAmount1 = winningAmount1;
      if (winningAmount2) updateFields.winningAmount2 = winningAmount2;
      if (winningAmount3) updateFields.winningAmount3 = winningAmount3;
      if (tournamentInterval) updateFields.tournamentInterval = tournamentInterval;
      if (tournamentType) updateFields.tournamentType = tournamentType;
      if (tournamentStatus) updateFields.tournamentStatus = tournamentStatus;

      // Update only the specified fields using $set operator
      await Tournament.updateOne({
        _id: tournamentId
      }, {
        $set: updateFields
      });

      return res.status(200).json({
        success: true,
        message: 'Tournament updated successfully.',
        tournamentId: tournament._id,
        status: 'success'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Tournament not found.'
      });
    }
  } catch (error) {
    console.error('Error updating tournament details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tournament details.',
      error: error.message
    });
  }
};
exports.deleteTorunment = async function (req, res) {

  try {
    const tournamentId = req.body.tournamentId

    const deletedTournaments = await Tournament.findByIdAndDelete(tournamentId);

    if (!deletedTournaments) {
      return res.status(404).json({
        status: 'error',
        msg: 'tournaments not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      msg: 'tournaments deleted successfully',
      deletedTournaments
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      msg: 'Internal server error',
      error
    });
  }
}

exports.addDisclaimer = async function (req, res) {
  try {
    const {
      disclaimer
    } = req.body;

    // Create a new instance of the Disclamer
    const newDisclaimer = new Disclaimer({
      disclaimer
    });

    // Save the new disclamer to the database
    const savedDisclaimer = await newDisclaimer.save();
    console.log("savedDisclaimer", savedDisclaimer)
    // Respond with the saved disclamer data
    res.status(201).json({
      msg: "add disclamer data successfuly",
      savedDisclaimer,
      status: "success"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}


// Player module <----------------------->
exports.addPlayer = async function (req, res) {
  try {
    const {
      player_image,
      name,
      email,
      mobileNo
    } = req.body;
    // email: { type: String }, 
    // first_name: { type: String}, 
    // device_type: { type: String}, 
    // device_token: { type: String }, 
    // user_type: { type: Number },
    // image: { type: String }, 
    // mobile: { type: String },
    // amount: { type: String },
    // winningAmount: { type: String },
    // const { player_image } = req.file;
    // Create a new instance of the Player
    // const base64Data = req.file.buffer.toString('base64');

    const newPlayer = new Players({
      // playerId, 
      name,
      email,
      player_image,
      mobileNo,
      created_at: new Date(),
    });

    // Save the new Player to the database
    const savedPlayer = await newPlayer.save();
    console.log(savedPlayer);
    // Respond with the saved Player data
    res.status(201).json({
      status: 'success',
      savedPlayer
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error'
    });
  }
}

exports.getPlayer = async function (req, res) {
  try {
    // Fetch all tournament from the database
    const player = await Players.find();

    // Respond with the list of player
    res.status(200).json({
      msg: 'sucessfull',
      player
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error',
      error
    });
  }
}

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

exports.deletePlayer = async function (req, res) {
  try {
    const playerId = req.body.playerId

    const deletedPlayers = await Players.findByIdAndDelete(playerId);

    if (!deletedPlayers) {
      return res.status(404).json({
        status: 'error',
        msg: 'Players not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      msg: 'Players deleted successfully',
      deletedPlayers
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      msg: 'Internal server error',
      error
    });
  }
}

// exports.getleaderboard = async function (req, res) {
//   try {
//     // Fetch users from the database, sorted by a relevant metric (e.g., amount)
//     const leaderboard = await Player.find().sort({
//       amount: -1
//     }).limit(4);

//     // You can customize the sorting and limit based on your application's requirements

//     return res.status(200).json({
//       success: true,
//       leaderboard
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error"
//     });
//   }
// };

// Update player status endpoint
exports.updateBanned = async function (req, res) {
  try {
    const {
      player_id,
      is_banned
    } = req.body;
    console.log('Request Body:', req.body);

    // Validate input
    if (!player_id || is_banned === undefined) {
      return res.status(400).json({
        error: 'Invalid request. playerId and isBanned are required.'
      });
    }

    // Update player status in the database
    const updatedPlayer = await Players.findByIdAndUpdate(
      player_id, {
        is_banned
      }, {
        new: true
      }
    );

    if (!updatedPlayer) {
      return res.status(404).json({
        error: 'Player not found.'
      });
    }

    return res.status(200).json(updatedPlayer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error'
    });
  }

}
//report
// banned player
exports.getBannedPlayers = async function (req, res) {
  try {
    const bannedPlayers = await Players.find({ is_banned: true }).select('first_name email mobile player_image'); // Fetch players where isBanned is 1 (true) and select only the specified fields.

    return res.status(200).json({
      success: true,
      message: 'Banned players retrieved successfully.',
      bannedPlayers,
    });
  } catch (error) {
    console.error('Error fetching banned players:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch banned players.',
      error: error.message,
    });
  }
}



// notification module <----------------------->
exports.getNotification = async function (req, res) {
  try {
    // Fetch all tournament from the database
    const notification = await Notification.find();
    // Respond with the list of tournament
    res.status(200).json({
      msg: 'sucessfull',
      notification
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error',
      error
    });
  }
}

// Use Multer middleware for file uploads
const uploadImage = configMulter('notificationImage/', [{
  name: 'notificationImg',
  maxCount: 1
}]);

exports.addNotification = async function (req, res) {
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
      console.log('After Multer:', req.files);
      const {
        list_id,
        notificationTitle,
        notificationMessage
      } = req.body;

      // Use the correct field name 'notificationImg'
      const notificationImg = req.files && req.files['notificationImg'] ?
        req.files['notificationImg'][0].path.replace(/^.*notificationImage[\\/]/, 'notificationImage/') :
        '';

      // console.log('notificationImg:', notificationImg);

      const newNotification = new Notification({
        player_Ids:list_id,
        notificationTitle,
        notificationMessage,
        notificationImg: notificationImg,
      });

      const savedNotification = await newNotification.save();
      res.status(201).json({
        status: 'success',
        savedNotification
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Internal Server Error'
      });
    }
  });
};



// Transaction module <----------------------->
// exports.getTransaction = async function (req, res) {
//   try {
//     // Fetch all tournament from the database
//     const transaction = await Transaction.find();
//     // Respond with the list of tournament
//     res.status(200).json({
//       msg: 'sucessfull',
//       transaction
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: 'Internal Server Error',
//       error
//     });
//   }
// }

// wallet module <----------------------->
// add_amount
exports.addAmount = async function (req, res) {

  // transactionType: { type: String },
  // walletType: { type: String },
  // addAmount: { type: String },
  // notes: { type: String }

  try {
    const {
      list_id,
      transactionType,
      addAmount,
      notes
    } = req.body;

    const newWallet = new Wallet({
      player_id: list_id,
      transactionType,
      addAmount,
      notes
    });

    const savedWallet = await newWallet.save();
    res.status(201).json({
      status: 'success',
      savedWallet
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error'
    });
  }
};


//**************** get player detailed report *****************
exports.playersDetailedReport = async function (req, res) {
  try {
    const detailedReport = await Players.find().select('first_name email mobile player_image wallet_amount winning_amount bonus_ammountjoin_code referral_code is_pan_kyc is_adhar_kyc'); 

    return res.status(200).json({
      success: true,
      message: 'players detailed report retrieved successfully.',
      detailedReport,
    });
  } catch (error) {
    console.error('Error fetching players detailed report:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch players detailed report.',
      error: error.message,
    });
  }
}


// withdraw module <----------------------->

exports.addWithdrawRequestList = async function (req, res) {
  try {
    const {
      playerId,
      amount
    } = req.params;

    // Validate and process the playerId and amount as needed

    // Example: Find the player by playerId to associate with the withdrawal request
    const player = await Players.findById(playerId);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found.',
      });
    }

    // Create a new withdrawal request
    const withdrawalRequest = new Withdraw({
      player_id: playerId,
      amount: amount,
      status: 'pending',
      // Add other fields as needed
    });

    // Save the withdrawal request to the database
    await withdrawalRequest.save();

    // Respond with success message
    res.status(201).json({
      success: true,
      message: 'Withdrawal request added successfully.',
      withdrawalRequest: withdrawalRequest,
    });
  } catch (error) {
    console.error('Error adding withdrawal request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add withdrawal request.',
      error: error.message,
    });
  }
};
// const WithdrawalRequest = require('../models/WithdrawalRequest');
// const Player = require('../models/Player');

exports.getWithdrawRequestList = async function (req, res) {
  try {
    // Fetch all WithdrawDetails from the database
    const withdrawDetails = await WithdrawDetails.find().populate({
      path: 'player_id',
      select: 'first_name wallet_amount' // Specify the fields you want to select from the Players collection
    });
    // Respond with the list of WithdrawDetails
    res.status(200).json({
      success: true,
      message: 'Successfully fetched withdrawal requests',
      data: withdrawDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
}


exports.getPlayersAllTransaction = async function (req, res) {
  try {
    const { player_id } = req.body; // Assuming player_id is provided in the request body

    // Fetch WithdrawDetails for the provided player_id and populate the player details
    const walletHistory = await WalletHistory
    .find({ player_id }).populate({
      path: 'player_id',
      select: 'first_name' // Specify the fields you want to select from the Players collection
    });

    // Respond with the list of WithdrawDetails
    res.status(200).json({
      success: true,
      message: 'Successfully fetched wallet History',
      data: walletHistory
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
}

exports.getapproveWithdraw = async function (req, res) {
  try {
    const approveWithdraw = await Players.find({
      status:1
    });

    return res.status(200).json({
      success: true,
      message: 'approve players retrieved successfully.',
      approveWithdraw,
    });


  } catch (error) {
    console.error('Error fetching approve players:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch approve players.',
      error: error.message,
    });
  }
}
// Change the name of the function and the success message
exports.getRejectedWithdraw = async function (req, res) {
  try {
    // Find players with isApprove set to false (rejected)
    const rejectedWithdraw = await Players.find({
      status:2
    });

    return res.status(200).json({
      success: true,
      message: 'Rejected players retrieved successfully.',
      rejectedWithdraw,
    });
  } catch (error) {
    console.error('Error fetching rejected players:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch rejected players.',
      error: error.message,
    });
  }
};

// Add a new endpoint to handle approve, withdraw, and reject actions
// exports.updateWithdrawStatus = async function (req, res) {
//   try {
//     const {
//       playerId,
//       action
//     } = req.body;

//     let updateFields;

//     switch (action) {
//       case 'approve':
//         updateFields = {
//           isApprove: true,
//           approveAt: new Date()
//         };
//         break;
//       case 'withdraw':
//         updateFields = {
//           isWithdrawn: true,
//           withdrawAt: new Date()
//         };
//         break;
//       case 'reject':
//         updateFields = {
//           isApprove: false,
//           isWithdrawn: false,
//           rejectAt: new Date()
//         };
//         break;
//       default:
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid action specified.',
//         });
//     }

//     // Update the player's status based on the action
//     const updatedPlayer = await Player.findByIdAndUpdate(playerId, updateFields, {
//       new: true
//     });

//     return res.status(200).json({
//       success: true,
//       message: 'Player status updated successfully.',
//       updatedPlayer,
//     });
//   } catch (error) {
//     console.error('Error updating player status:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to update player status.',
//       error: error.message,
//     });
//   }
// };


// new api's for admin

exports.addNotice = async function (req, res) {
try {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a message.',
    });
  }

  const newNotice = new Notice({
    message,
  });

  await newNotice.save();

  return res.status(201).json({
    success: true,
    message: 'Notice added successfully.',
  });
} catch (error) {
  console.error('Error adding notice:', error);
  return res.status(500).json({
    success: false,
    message: 'Failed to add notice.',
    error: error.message,
  });
}
};

exports.updateNotice = async function (req, res) {
  try {
    const { noticeId, updatedMessage } = req.body;

    if (!noticeId || !updatedMessage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide noticeId and updatedMessage.',
      });
    }

    // Find the notice by ID
    const notice = await Notice.findById(noticeId);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
    }

    // Update the notice message
    notice.message = updatedMessage;

    // Save the updated notice
    await notice.save();

    return res.status(200).json({
      success: true,
      message: 'Notice updated successfully.',
    });
  } catch (error) {
    console.error('Error updating notice:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notice.',
      error: error.message,
    });
  }
};

// Delete a notice by ID
exports.deleteNotice = async function (req, res) {
  try {
    const { noticeId } = req.body;

    if (!noticeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide noticeId.',
      });
    }

    // Find the notice by ID and remove it
    const deletedNotice = await Notice.findByIdAndDelete(noticeId);

    if (!deletedNotice) {
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

// Get all notices
exports.getAllNotices = async function (req, res) {
  try {
    const notices = await Notice.find();

    return res.status(200).json({
      success: true,
      notices,
    });
  } catch (error) {
    console.error('Error fetching notices:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notices.',
      error: error.message,
    });
  }
};

// update player's withdraw data
// exports.updateWithdrawStatus = async function (req, res) {
//   try {
//     const { player_id, status } = req.body;

//     if (!player_id || status === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide player_id and status.',
//       });
//     }

//     // Find the WithdrawDetails by player_id
//     const withdrawDetails = await WithdrawDetails.findOne({ player_id });

//     if (!withdrawDetails) {
//       return res.status(404).json({
//         success: false,
//         message: 'Withdraw details not found for the provided player_id.',
//       });
//     }

//     // Check if the status is already set
//     if (withdrawDetails.status !== 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Withdraw status is already set for the provided player_id.',
//       });
//     }

//     // Update the WithdrawDetails status
//     withdrawDetails.status = status;

//     // Save the changes
//     await withdrawDetails.save();

//     if (status === 1) {
//       // Deduct amt_withdraw from wallet_amount in Players table
//       const player = await Players.findById(player_id);

//       if (!player) {
//         return res.status(404).json({
//           success: false,
//           message: 'Player not found with the provided player_id.',
//         });
//       }

//       // Deduct amt_withdraw from wallet_amount
//       player.wallet_amount -= withdrawDetails.amt_withdraw;

//       // Save the changes to the player's wallet_amount
//       await player.save();
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Withdraw status updated successfully.',
//     });
//   } catch (error) {
//     console.error('Error updating withdraw status:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to update withdraw status.',
//       error: error.message,
//     });
//   }
// };


// exports.updateWithdrawStatus = async function (req, res) {
//   try {
//     const { player_id, status } = req.body;

//     if (!player_id || status === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide player_id and status.',
//       });
//     }

//     // Find the WithdrawDetails by player_id
//     const withdrawDetails = await WithdrawDetails.findOne({ player_id });

//     if (!withdrawDetails) {
//       return res.status(404).json({
//         success: false,
//         message: 'Withdraw details not found for the provided player_id.',
//       });
//     }

//     // Check if the status is already set
//     if (withdrawDetails.status !== 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Withdraw status is already set for the provided player_id.',
//       });
//     }

//     // Update the WithdrawDetails status
//     withdrawDetails.status = status;

//     // Save the changes
//     await withdrawDetails.save();

//     if (status === 1) {
//       // Deduct amt_withdraw from wallet_amount in Players table
//       const player = await Players.findById(player_id);

//       if (!player) {
//         return res.status(404).json({
//           success: false,
//           message: 'Player not found with the provided player_id.',
//         });
//       }

//       // Check if the player has sufficient balance
//       if (player.wallet_amount < withdrawDetails.amt_withdraw) {
//         // If not enough balance, reject the withdrawal
//         withdrawDetails.status = 2; // Set status to 2 (rejected)
//         await withdrawDetails.save();

//         return res.status(400).json({
//           success: false,
//           message: 'Insufficient balance in the player\'s wallet.',
//         });
//       }

//       // Deduct amt_withdraw from wallet_amount
//       player.wallet_amount -= withdrawDetails.amt_withdraw;

//       // Save the changes to the player's wallet_amount
//       await player.save();
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Withdraw status updated successfully.',
//     });
//   } catch (error) {
//     console.error('Error updating withdraw status:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to update withdraw status.',
//       error: error.message,
//     });
//   }
// };

// exports.updateWithdrawStatus = async function (req, res) {
//   try {
//     const { player_id, status } = req.body;

//     if (!player_id || status === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide player_id and status.',
//       });
//     }

//     // Find the WithdrawDetails by player_id
//     const withdrawDetails = await WithdrawDetails.findOne({ player_id });

//     if (!withdrawDetails) {
//       return res.status(404).json({
//         success: false,
//         message: 'Withdraw details not found for the provided player_id.',
//       });
//     }

//     // Check if the status is not 0
//     if (withdrawDetails.status !== 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Withdraw status is already set for the provided player_id.',
//       });
//     }

//     // Update the WithdrawDetails status
//     withdrawDetails.status = status;

//     // Save the changes
//     await withdrawDetails.save();

//     if (status === 1) {
//       // Deduct amt_withdraw from wallet_amount in Players table
//       const player = await Players.findById(player_id);

//       if (!player) {
//         return res.status(404).json({
//           success: false,
//           message: 'Player not found with the provided player_id.',
//         });
//       }

//       // Check if the player has sufficient balance
//       if (player.wallet_amount < withdrawDetails.amt_withdraw) {
//         // If not enough balance, reject the withdrawal
//         withdrawDetails.status = 2; // Set status to 2 (rejected)
//         await withdrawDetails.save();

//         return res.status(400).json({
//           success: false,
//           message: 'Insufficient balance in the player\'s wallet.',
//         });
//       }

//       // Deduct amt_withdraw from wallet_amount
//       player.wallet_amount -= withdrawDetails.amt_withdraw;

//       // Save the changes to the player's wallet_amount
//       await player.save();
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Withdraw status updated successfully.',
//     });
//   } catch (error) {
//     console.error('Error updating withdraw status:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to update withdraw status.',
//       error: error.message,
//     });
//   }
// };


// Adhar list 
exports.getPlayerAadharList = async function (req, res) {
  try {
    // Fetch all tournament from the database
    const adharList = await AdharKYC.find();

    // Respond with the list of tournament
    res.status(200).json({
      msg: 'sucessfull',
      adharList
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error',
      error
    });
  }
}

// pan list 
exports.getPlayerPanList = async function (req, res) {
  try {
    // Fetch all tournament from the database
    const panList = await PanKYC.find();

    // Respond with the list of tournament
    res.status(200).json({
      msg: 'sucessfull',
      panList
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error',
      error
    });
  }
}

// player list
exports.getPlayerList = async function (req, res) {
  try {
    // Fetch all tournament from the database
    const playerList = await Players.find();

    // Respond with the list of tournament
    res.status(200).json({
      msg: 'sucessfull',
      playerList
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error',
      error
    });
  }
}

// active player list
exports.getActivePlayers = async function (req, res) {
  try {
    // Find all players with is_active field set to true
    const activePlayers = await Players.find({ is_active: true });

    // Respond with the list of active players
    return res.status(200).json({
      success: true,
      players: activePlayers,
    });
  } catch (error) {
    console.error('Error getting active players:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get active players.',
      error: error.message,
    });
  }
};

// approve adhar KYC
exports.approveAadharKyc = async function (req, res) {
  try {
    const { player_id } = req.body;

    // Update status field in AdharKyc table
    await AdharKYC.findOneAndUpdate({ player_id }, { $set: { status: true } });

    // Update is_adhar_kyc field in Players table
    await Players.findOneAndUpdate({ _id:player_id }, { $set: { is_adhar_kyc: true } });

    // Respond with success message
    return res.status(200).json({
      success: true,
      message: 'Aadhar KYC approved successfully.',
    });
  } catch (error) {
    console.error('Error approving Aadhar KYC:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve Aadhar KYC.',
      error: error.message,
    });
  }
};

// approve pan KYC
exports.approvePanKyc = async function (req, res) {
  try {
    const { player_id } = req.body;

    // Update status field in AdharKyc table
    await PanKYC.findOneAndUpdate({ player_id }, { $set: { status: true } });

    // Update is_adhar_kyc field in Players table
    await Players.findOneAndUpdate({ _id:player_id }, { $set: { is_pan_kyc: true } });

    // Respond with success message
    return res.status(200).json({
      success: true,
      message: 'Pan KYC approved successfully.',
    });
  } catch (error) {
    console.error('Error approving Pan KYC:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve Pan KYC.',
      error: error.message,
    });
  }
};

// send notification to players 

// exports.sendNotificationToPlayers = async (req, res) => {
//   try {
//     const { player_Ids, notificationTitle, notificationMessage, notificationImg } = req.body;

//     if (!player_Ids || !Array.isArray(player_Ids) || player_Ids.length === 0) {
//       return res.status(400).json({ success: false, message: 'Invalid player IDs provided.' });
//     }

//     // Fetch players with the provided IDs
//     const players = await Players.find({ _id: { $in: player_Ids } });
    
//     // Extract FCM tokens from players
//     const playerFCMTokens = players.map(player => player?.device_token).filter(Boolean);

//     if (playerFCMTokens.length === 0) {
//       return res.status(400).json({ success: false, message: 'No valid FCM tokens found for the provided players.' });
//     }

//     const notificationPayload = {
//       notificationTitle, 
//       notificationMessage, 
//       notificationImg
//     };

//     // Send notifications to each player and store in the Notification table
//     const notificationPromises = playerFCMTokens.map(async (device_token) => {
//       await notificationService.sendNotification(device_token, notificationPayload);

//       // Save the notification in the Notification table
//       const notification = new Notification({
//         player_id: players.find(player => player.device_token === device_token)?._id,
//         notificationTitle, 
//         notificationMessage, 
//         notificationImg
//       });

//       return notification.save();
//     });

//     // Wait for all notifications to be sent and stored
//     await Promise.all(notificationPromises);

//     res.status(200).json({ success: true, message: 'Notifications sent and stored successfully.' });
//   } catch (error) {
//     console.error('Failed to send and store notifications:', error);
//     res.status(500).json({ success: false, message: 'Failed to send and store notifications.', error: error.message });
//   }
// };

exports.sendNotificationToPlayers = async (req, res) => {
  try {
    const { player_Ids, notificationTitle, notificationMessage, notificationImg } = req.body;

    if (!player_Ids || !Array.isArray(player_Ids) || player_Ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid player IDs provided.' });
    }

    // Fetch players with the provided IDs
    const players = await Players.find({ _id: { $in: player_Ids } });
    
    // Extract FCM tokens from players
    const playerFCMTokens = players.map(player => player?.device_token).filter(Boolean);

    if (playerFCMTokens.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid FCM tokens found for the provided players.' });
    }

    const notificationPayload = {
      notificationTitle, 
      notificationMessage, 
      notificationImg
    };

    // Send notifications to each player and store in the Notification table
    const notificationPromises = playerFCMTokens.map(async (device_token) => {
      await notificationService.sendNotification(device_token, notificationPayload);

      // Find the player ID based on the device token
      const player = players.find(p => p.device_token === device_token);
      const player_id = player?._id;

      // Save the notification in the Notification table
      const notification = new Notification({
        player_id,
        notificationTitle, 
        notificationMessage, 
        notificationImg
      });

      return notification.save();
    });

    // Wait for all notifications to be sent and stored
    await Promise.all(notificationPromises);

    res.status(200).json({ success: true, message: 'Notifications sent and stored successfully.' });
  } catch (error) {
    console.error('Failed to send and store notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to send and store notifications.', error: error.message });
  }
};

// get all Adhar kyc and Pan Kyc list of players
exports.getAllAdharPanKycList = async (req, res) => {
  try {
    // Fetch all PanKYC data
    const panKYCData = await PanKYC.find();
    
    // Fetch all AdharKYC data
    const adharKYCData = await AdharKYC.find();

    // Check if either PanKYC or AdharKYC data is not found
    if (!panKYCData || !adharKYCData) {
      return res.status(404).json({
        success: false,
        message: 'KYC data not found for any player.',
      });
    }

    // Prepare the response object
    const playersKYCData = panKYCData.map((panData) => {
      const adharData = adharKYCData.find((adhar) => adhar.player_id.toString() === panData.player_id.toString());
      return {
        player_id: panData.player_id,
        adhar_front_image: adharData ? adharData.aadhar_front_image : '',
        adhar_back_image: adharData ? adharData.aadhar_back_image : '',
        adhar_no: adharData ? adharData.aadhar_no : '',
        pan_image: panData.pan_image,
        pan_no: panData.pan_no,
      };
    });

    return res.status(200).json({
      success: true,
      data: playersKYCData,
      message: 'KYC data retrieved successfully for all players.',
    });
  } catch (error) {
    console.error('Error in getAllPlayersKYC:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


// accept or reject Pan Kyc 
exports.updatePanKYCStatus = async function (req, res) {
  try {
    const { pan_id, status } = req.body;

    // Check if pan_id is provided
    if (!pan_id) {
      return res.status(400).json({
        success: false,
        message: 'Pan ID is required.'
      });
    }

    // Update status in PanKYC table
    const updatedPanKYC = await PanKYC.findByIdAndUpdate({_id:pan_id},
      { status },
      { new: true }
    );

    // Check if the PanKYC entry exists
    if (!updatedPanKYC) {
      return res.status(404).json({
        success: false,
        message: 'PanKYC entry not found.'
      });
    }

    // Update is_pan_kyc in Players table
    const playerId = updatedPanKYC.player_id;

    if (playerId) {
      await Players.findByIdAndUpdate(
        playerId,
        { is_pan_kyc: status },
        // { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'PanKYC status updated successfully.',
      data: updatedPanKYC
    });
  } catch (error) {
    console.error('Error updating PanKYC status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update PanKYC status.',
      error: error.message
    });
  }
};

// accept or reject withdrawal request 
exports.processWithdrawalRequest = async function (req, res) {
  try {
    const { withdrawal_request_id, accept_request } = req.body;

    // Check if the withdrawal request exists
    const withdrawalRequest = await WithdrawDetails.findById({_id: withdrawal_request_id});
    if (!withdrawalRequest) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal request not found.',
      });
    }

    // Extract player_id from the withdrawal request
    const player_id = withdrawalRequest.player_id;

    // Check if the status is already set to 1 or 2
    if (withdrawalRequest.status === 1 || withdrawalRequest.status === 2) {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal request status has already been set and cannot be changed.',
      });
    }

    // If the request is accepted (accept_request is 1), update the withdrawal request status to accepted
    if (accept_request === 1) {
      withdrawalRequest.status = 1; // 1 for accepted
      await withdrawalRequest.save();

      res.status(200).json({
        success: true,
        message: 'Withdrawal request accepted successfully.',
      });
    } else if (accept_request === 2) {
      // If the request is rejected (accept_request is 2), return the amount to the player's wallet_amount
      const player = await Players.findById(player_id);
      if (player) {
        // Return the withdrawn amount to wallet_amount
        player.wallet_amount += withdrawalRequest.amt_withdraw;

        // Save the changes to the player's wallet_amount
        await player.save();
      } else {
        return res.status(404).json({
          success: false,
          message: 'Player not found.',
        });
      }

      // Update withdrawal request status to rejected (2)
      withdrawalRequest.status = 2; // 2 for rejected
      await withdrawalRequest.save();

      res.status(200).json({
        success: true,
        message: 'Withdrawal request rejected, amount returned to wallet_amount.',
      });
    } else {
      // Handle invalid accept_request values
      return res.status(400).json({
        success: false,
        message: 'Invalid accept_request value.',
      });
    }
  } catch (error) {
    console.error('Error processing withdrawal request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process withdrawal request.',
      error: error.message
    });
  }
};
