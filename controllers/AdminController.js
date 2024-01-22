const Admin = require('../models/Admin');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const Tournament = require("../models/tournament");
const Disclamer = require('../models/Disclaimer');
const Notification = require('../models/Notification');
const configMulter = require('../configMulter')
const multer = require('multer');
const Players = require('../models/Players');
const Withdraw = require('../models/Withdraw');
const Transaction  = require('../models/Transaction')
const WithdrawDetails = require('../models/WithdrawDetails');
const Wallet = require('../models/Wallet');
const cron = require('node-cron');
const RegisteredTournament = require('../models/RegisteredTournament')
const AdharKYC = require('../models/AdharKYC');



// Admin module <----------------------->
exports.signUp = async function (req, res) {
    const { username, email, password } = req.body

    const isUser = await Admin.findOne({ email })
    if(isUser) {
        res.send({ msg : "user already exits please login", isUser })
    } else {
        bcrypt.hash(password, 5, async function(err, hash) {
            if(err) {
                res.send({ msg: "something went wrong, plz try again later", err })
            } 
            else {
                const user = new Admin({  
                    username,  
                    email,  
                    password: hash
                })
                try {          
                    await user.save()
                    res.status(200).send({ msg: "signUp Successful", user })
                } catch (err) {
                    console.log(err)
                    res.send({ msg: "something went wrong, plz try again", err })
                }
            }   
        });
    }   
}
exports.login = async function (req, res) {
    const { email, password } = req.body;

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
};
exports.resetPassword = async function (req, res) {
    const { userId, newPassword, confirmPassword } = req.body;

    try {
        // Validate new password and confirm password
        if(newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'New password and confirm password do not match' });
        }
        console.log(newPassword)
        // Update user's password in the database
        const hashedPassword = await bcrypt.hash(newPassword, 5);
        await Admin.updateOne({ _id: userId }, { password: hashedPassword });

        console.log('Password reset successfully', hashedPassword);
        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred during password reset' });
    }
};


// Tournament Module
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
        res.status(201).json({msg: "add tournament data successfuly", savedTournament, status: "success"});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// // this api match with player controller
// exports.getTournamentList = async function (req, res) {
//     try {
//         // Fetch all tournament from the database
//         const tournament = await Tournament.find({});

//         // Respond with the list of tournament
//         res.status(200).json({ msg: 'sucessfull', tournament });  
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error', error });
//     }
// }

exports.getTournamentList =async function (req,res) {
    try {
        const tournaments = await Tournament.find({});
    
        const formattedTournaments = tournaments.map(tournament => ({
            id: tournament._id,
            tournament_name: tournament.tournamentName,
            bet_amount: tournament.betAmount,
            no_players: tournament.noPlayers,
            no_of_winners: tournament.winnerCount,
            tournament_interval: tournament.tournamentInterval,
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

exports.updateTournament = async function(req, res){
    try {
        const  tournamentId  = req.body.tournamentId;
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
        if(parsedNoPlayers === 2 || parsedNoPlayers === 3) {
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

        if(tournament) {
            // Prepare update object based on provided fields
            const updateFields = {};
            if(tournamentName) updateFields.tournamentName = tournamentName;
            if(betAmount) updateFields.betAmount = betAmount;
            if(noPlayers) updateFields.noPlayers = noPlayers;
            if(winningAmount) updateFields.winningAmount = winningAmount;
            if(winnerCount) updateFields.winnerCount = winnerCount;
            if(winningAmount1) updateFields.winningAmount1 = winningAmount1;
            if(winningAmount2) updateFields.winningAmount2 = winningAmount2;
            if(winningAmount3) updateFields.winningAmount3 = winningAmount3;
            if(tournamentInterval) updateFields.tournamentInterval = tournamentInterval;
            if(tournamentType) updateFields.tournamentType = tournamentType;
            if(tournamentStatus) updateFields.tournamentStatus = tournamentStatus;

            // Update only the specified fields using $set operator
            await Tournament.updateOne({ _id: tournamentId }, { $set: updateFields });

            return res.status(200).json({ success: true, message: 'Tournament updated successfully.', tournamentId: tournament._id, status: 'success' });
        } else {
            return res.status(400).json({ success: false, message: 'Tournament not found.' });
        }
    } catch (error) {
        console.error('Error updating tournament details:', error);
        res.status(500).json({ success: false, message: 'Failed to update tournament details.', error: error.message });
    }
};
exports.deleteTorunment = async function (req, res) {
    
    try {
        const tournamentId = req.body.tournamentId

        const deletedTournaments = await Tournament.findByIdAndDelete(tournamentId);     

        if(!deletedTournaments) {
            return res.status(404).json({ status: 'error', msg: 'tournaments not found' });
        }

        return res.status(200).json({ status: 'success', msg: 'tournaments deleted successfully', deletedTournaments });
    } catch (error) {  
        console.error(error);
        return res.status(500).json({ status: 'error', msg: 'Internal server error', error });
    }
}
exports.addDisclamer = async function (req, res) {
    try {
        const { addDisclamer } = req.body;

        // Create a new instance of the Disclamer
        const newDisclamer = new Disclamer({
            addDisclamer 
        });

        // Save the new disclamer to the database
        const savedDisclamer = await newDisclamer.save();
        console.log("savedDisclamer", savedDisclamer)
        // Respond with the saved disclamer data
        res.status(201).json({msg: "add disclamer data successfuly", savedDisclamer, status: "success"});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


// Player module <----------------------->


exports.getPlayer = async function (rea, res) {
    try {
        // Fetch all tournament from the database
        const player = await Players.find({});

        // Respond with the list of player
        res.status(200).json({ msg: 'successfull', player });  
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
}
exports.updatePlayer = async function (req, res) {

    try {
        const playerId = req.body.playerId;
        const { first_name, email, 
            // player_image, 
            mobile } = req.body;
    
        // Find the player by ID
        let player = await Players.findById(playerId);
    
        if(player) {
            // Update the player field
            // player.playId = playId;   
            player.first_name = first_name;
            player.email = email;
            // player.player_image = player_image;
            player.mobile = mobile
            await player.save();
    
            return res.status(200).json({ success: true, message: 'player updated successfully.', playerId: player._id, status: 'success' });
        } else {
            return res.status(400).json({ success: false, message: 'player not found.' });
        }
    } catch (error) {
        console.error('Error updating player details:', error);
        res.status(500).json({ success: false, message: 'Failed to update player details .', error: error.message });
    }
}
exports.deletePlayer = async function (req, res) {
    try {
        const playerId = req.body.playerId
    
        const deletedPlayers = await Players.findByIdAndDelete(playerId);     
    
        if(!deletedPlayers) {
            return res.status(404).json({ status: 'error', msg: 'Players not found' });
        }
    
        return res.status(200).json({ status: 'success', msg: 'Players deleted successfully', deletedPlayers });
    } catch (error) {  
        console.error(error);
        return res.status(500).json({ status: 'error', msg: 'Internal server error', error });
    }
}

exports.getDetailPlayerReport = async (req, res) => {
    try {
        // Fetch player reports and populate tournament and withdraw details
        const playerReports = await RegisteredTournament.find()
            .populate({
                path: 'player_id',
                select: 'first_name join_code wallet_amount no_of_total_win no_of_loose bonus_ammount amt_withdraw',
            })
            .populate({
                path: 'tournament_id',
                select: 'winnerCount',
            })
            // .populate({
            //     path: 'withdrawDetails', // Specify the path to populate
            //     model: 'WithdrawDetails', // Specify the model to use for populating
            //     select: 'amt_withdraw trans_id status', // Specify the fields to select from the WithdrawDetails collection
            // })
            .exec();

        // Your logic to filter, process, or modify the player reports goes here
        // const modifiedPlayerReports = playerReports.map((playerReport) => {
        //     // Example: Add a new field 'totalAmount' by summing 'wallet_amount' and 'winning_amount'
        //     playerReport.totalAmount = playerReport.wallet_amount + playerReport.winning_amount;
        //     return playerReport;
        // });
          // Parse noPlayers as an integer before comparison
        //   const noPlayers = /* define or get the value of noPlayers */;
        //   const parsedNoPlayers = parseInt(winnerCount);
  
        //   // Set winnerCount based on noPlayers
        //   let winnerCount;
        //   if (parsedNoPlayers === 2 || parsedNoPlayers === 3) {
        //       winnerCount = 1;
        //   } else if (parsedNoPlayers === 4) {
        //       winnerCount = 3;
        //   } else {
        //       // Handle other values if needed
        //       winnerCount = 0; // Default value
        //   }
  
        //   console.log("noPlayers:", parsedNoPlayers);
        //   console.log("winnerCount:", winnerCount);

        // Respond with the list of player reports and details
        res.status(200).json({
            success: true,
            playerReports,
        });
    } catch (error) {
        console.error('Error fetching and processing player reports:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch player reports.',
            error: error.message,
        });
    }
};

// exports.getleaderboard = async function (req, res) {
//     try {
//         // Fetch users from the database, sorted by a relevant metric (e.g., amount)
//         const leaderboard = await Player.find().sort({ amount: -1 }).limit(4);
    
//         // You can customize the sorting and limit based on your application's requirements
    
//         return res.status(200).json({ success: true, leaderboard });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };

exports.getleaderboard = async function (req, res) {
    try {
        // Fetch users from the database, sorted by a relevant metric (e.g., amount)
        const leaderboard = await Player.find().sort({
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

exports.getactivePlayer = async function (req, res) {
    try {
        const activePlayers = await Players.find({ is_active: true });

        return res.status(200).json({
            success: true,
            message: 'Active players retrieved successfully.',
            activePlayers,
        });
    } catch (error) {
        console.error('Error fetching active players:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch active players.',
            error: error.message,
        });
    }
}
// Update player status endpoint
exports.updateBanned = async function (req, res) {
    try {
        const { playerId, is_banned } = req.body;
        console.log('Request Body:', req.body);

        // Validate input
        if (!playerId || is_banned === undefined) {
            return res.status(400).json({ error: 'Invalid request. playerId and is_banned are required.' });
        }

      // Update player status in the database
        const updatedPlayer = await Players.findByIdAndUpdate(
            playerId,
            { is_banned },
            { new: true }
        );

        if (!updatedPlayer) {
            return res.status(404).json({ error: 'Player not found.' });
        }

        return res.status(200).json(updatedPlayer);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

//report
// banned player
exports.getBannedPlayers = async function (req, res) {
    try {
        const bannedPlayers = await Players.find({ is_banned: true }); // Fetch players where isBanned is 1 (true).

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
exports.getNotification = async function (rea, res) {
    try {
        // Fetch all tournament from the database
        const notification = await Notification.find();
        // Respond with the list of tournament
        res.status(200).json({ msg: 'sucessfull', notification });  
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
}
// Use Multer middleware for file uploads
const uploadImage = configMulter('notificationImage/', [
    { name: 'notificationImg', maxCount: 1 }
]);

// Add the following lines at the top of your file
const admin = require('firebase-admin');
// const RegisteredTournament = require('../models/RegisteredTournament');
// const serviceAccount = require('./path/to/your/firebase/serviceAccountKey.json');
// const serviceAccount = require('../serviceAccountKey.json');
// console.log('Service Account:', serviceAccount);


admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-firebase-project-id.firebaseio.com', // Replace with your Firebase project URL
});


exports.addNotification = async function (req, res) {
  uploadImage(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ success: false, message: 'Multer error', error: err });
    } else if (err) {
      return res.status(500).json({ success: false, message: 'Error uploading file', error: err });
    }

    try {
      console.log('After Multer:', req.files);
      const { list_id, notificationTitle, notificationMessage } = req.body;

      const notificationImg = req.files && req.files['notificationImg']
        ? req.files['notificationImg'][0].path.replace(/^.*notificationImage[\\/]/, 'notificationImage/')
        : '';

      console.log('notificationImg:', notificationImg);

      const newNotification = new Notification({
        list_id,
        notificationTitle,
        notificationMessage,
        notificationImg: notificationImg,
      });

      const savedNotification = await newNotification.save();

      // Send push notification
      const message = {
        data: {
          title: notificationTitle,
          body: notificationMessage,
          image: notificationImg, // Optional: You can send an image URL
        },
        topic: 'allDevices', // Replace with your FCM topic or device token
      };

      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);

      res.status(201).json({ status: 'success', savedNotification });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
};

// // add_notification
// exports.addNotification = async function (req, res) {
//     uploadImage(req, res, async function (err) {
//         if (err instanceof multer.MulterError) {
//             return res.status(500).json({ success: false, message: 'Multer error', error: err });
//         } else if (err) {
//             return res.status(500).json({ success: false, message: 'Error uploading file', error: err });
//         }

//         try {
//             console.log('After Multer:', req.files);
//             const { list_id, notificationTitle, notificationMessage } = req.body;

//             const notificationImg = req.files && req.files['notificationImg']
//                 ? req.files['notificationImg'][0].path.replace(/^.*notificationImage[\\/]/, 'notificationImage/')
//                 : '';

//             console.log('notificationImg:', notificationImg);

//             const newNotification = new Notification({
//                 list_id,
//                 notificationTitle,
//                 notificationMessage,
//                 notificationImg: notificationImg,
//             });

//             const savedNotification = await newNotification.save();
//             res.status(201).json({ status: 'success', savedNotification });
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ message: 'Internal Server Error' });
//         }
//     });
// };

// Transaction module <----------------------->
exports.getTransaction = async function (rea, res) {
    try {
        // Fetch all tournament from the database
        const transaction = await Transaction.find();
        // Respond with the list of tournament
        res.status(200).json({ msg: 'sucessfull', transaction });  
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
}

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
        res.status(201).json({ status: 'success', savedWallet });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// withdraw module <----------------------->

exports.addWithdrawRequestList = async function (req, res) {
    try {
        const { playerId, amount } = req.params;

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
        // Fetch withdrawal requests and populate player details
        const withdrawalRequests = await WithdrawDetails.find()
            .populate({
                path: 'player_id',
                select: 'first_name wallet_amount',
            })
            .exec();   
        // Respond with the list of withdrawal requests and player details
        res.status(200).json({
            success: true,
            withdrawalRequests,
        });
    } catch (error) {
        console.error('Error fetching and processing withdrawal requests:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch withdrawal requests.',
            error: error.message,
        });
    }
};

// updateWithdrawStatus
// Update player status endpoint
exports.updateWithdrawStatus = async function (req, res) {
    try {
        const { playerId, status } = req.body;
        console.log('Request Body:', req.body);

        // Validate input
        if (!playerId || status === undefined) {
            return res.status(400).json({ error: 'Invalid request. playerId and status are required.' });
        }

      // Update player status in the database
        const updatedPlayer = await Players.findByIdAndUpdate(
            playerId,
            { status },
            { new: true }
        );

        if(!updatedPlayer) {
            return res.status(404).json({ error: 'Player not found.' });
        }

        return res.status(200).json(updatedPlayer);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}


exports.getapproveWithdraw = async function (req, res) {
    try {
        const approveWithdraw = await Player.find({ isApprove: true });

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
        const rejectedWithdraw = await Player.find({ isApprove: false });

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
exports.updateWithdrawStatus = async function (req, res) {
    try {
        const { playerId, action } = req.body;

        let updateFields;

        switch (action) {
            case 'approve':
                updateFields = { isApprove: true, approveAt: new Date() };
                break;
            case 'withdraw':
                updateFields = { isWithdrawn: true, withdrawAt: new Date() };
                break;
            case 'reject':
                updateFields = { isApprove: false, isWithdrawn: false, rejectAt: new Date() };
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid action specified.',
                });
        }

        // Update the player's status based on the action
        const updatedPlayer = await Player.findByIdAndUpdate(playerId, updateFields, { new: true });

        return res.status(200).json({
            success: true,
            message: 'Player status updated successfully.',
            updatedPlayer,
        });
    } catch (error) {
        console.error('Error updating player status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update player status.',
            error: error.message,
        });
    }
};



// const mongoose = require('mongoose');
// const WithdrawDetails = require('../models/WithdrawDetails'); // Import your model

// exports.getWithdrawHistory = async function (req, res) {
//   try {
//     const { player_id } = req.body;

//     // Find player by player_id
//     if (!mongoose.Types.ObjectId.isValid(player_id)) {
//       return res.status(400).json({
//         success: false,
//         message: 'player_id is not valid',
//       });
//     }

//     const withdrawHistory = await WithdrawDetails.find({ player_id: player_id });

//     if (!withdrawHistory || withdrawHistory.length === 0) {
//       return res.status(200).json({
//         success: false,
//         message: 'Withdrawal History not found.',
//       });
//     }

//     res.status(200).json({
//       success: true,
//       withdrawHistory,
//     });
//   } catch (error) {
//     console.error('Error fetching withdrawal history:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch withdrawal history.',
//       error: error.message,
//     });
//   }
// };


// Aadhar Kyc api

// Assuming you have already set up your Express app and imported necessary modules
// const AdharKYC = require('../models/AdharKYC');
const PanKYC = require('../models/PanKYC');

// Assuming you have already set up your Express app and imported necessary modules

// Endpoint to get Aadhar KYC and Pan KYC data for a specific player
exports.getKYCData = async function (req, res) {
    try {
        const playerId = req.body.playerId;

        // Fetch Aadhar KYC data
        const adharKYCData = await AdharKYC.find({ player_id: playerId });

        // Fetch Pan KYC data
        const panKYCData = await PanKYC.find({ player_id: playerId });

        // Combine both datasets or send them separately based on your requirement
        const combinedData = {
            adharKYCData: adharKYCData,
            panKYCData: panKYCData
        };

        res.json({ success: true, combinedData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// // Endpoint to update Aadhar KYC status
// router.post('/adhar-kyc/:id', async (req, res) => {
//     try {
//         const adharKYC = await AdharKYC.findById(req.params.id);
//         if (!adharKYC) return res.status(404).json({ message: 'Aadhar KYC not found' });

//         // Assuming 'false' is the default status and 'true' indicates approval
//         if (!adharKYC.status) {
//             // If the status is 'false', update it to 'true'
//             adharKYC.status = true;
//             await adharKYC.save();
//             res.json({ message: 'Aadhar KYC approved successfully' });
//         } else {
//             // If the status is already 'true', send a message indicating it's already approved
//             res.json({ message: 'Aadhar KYC is already approved' });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });


// Assuming you have already set up your Express app and imported necessary modules
// const PanKYC = require('../models/PanKYC');

// // Endpoint to get all Pan KYC data
// router.get('/pan-kyc', async (req, res) => {
//     try {
//         const panKYCData = await PanKYC.find();
//         res.json(panKYCData);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Endpoint to update Pan KYC status
// router.patch('/pan-kyc/:id', async (req, res) => {
//     try {
//         const panKYC = await PanKYC.findById(req.params.id);
//         if (!panKYC) return res.status(404).json({ message: 'Pan KYC not found' });

//         panKYC.status = req.body.status;
//         await panKYC.save();

//         res.json(panKYC);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// Pan kyc api