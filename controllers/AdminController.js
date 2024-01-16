const { AdminModel } = require('../models/AdminModel');
const Banners = require('../models/Banners');
const Tournament = require('../models/tournament');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const configMulter = require('../configMulter');

exports.signUp = async function (req, res) {
    const { username, email, password } = req.body

    const isUser = await AdminModel.findOne({ email })
    if(isUser) {
        res.send({ msg : "user already exits please login", isUser })
    } else {
        bcrypt.hash(password, 5, async function(err, hash) {
            if(err) {
                res.send({ msg: "something went wrong, plz try again later", err })
            } 
            else {
                const user = new AdminModel({  
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

    const user = await AdminModel.findOne({ email });
  
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

// add banners
const uploadBanners = configMulter('bannersImage/', [
    { name: 'bannerImage', maxCount: 1 }
  ]);
  
  exports.addBanners = function (req, res) {
    uploadBanners(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(500).json({ success: false, message: 'Multer error', error: err });
      } else if (err) {
        return res.status(500).json({ success: false, message: 'Error uploading file', error: err });
      }
  
      try {
        const { redirectionUrl, title, redirectTo } = req.body;
  
        const bannerImage = req.files['bannerImage'] ? req.files['bannerImage'][0].path.replace(/^.*bannersImage[\\/]/, 'bannersImage/') : '';
  
        // Create a new file entry in the Customers collection
        const newBanner = new Banners({ redirectionUrl, bannerImage, title, redirectTo });
        await newBanner.save();
  
        res.status(201).json({ success: true, message: 'Banners uploaded successfully.', data: newBanner });
      } catch (error) {
        console.error('Error uploading Banner:', error);
        res.status(500).json({ success: false, message: 'Failed to upload Baners.', error: error.message });
      }
    });
  };
  
  // get Banners
  exports.getAllBanners = async function(req,res) {
    try {
      const banners = await Banners.find();
  
      res.status(200).json({ success: true, banners });
    } catch (error) {
      console.error('Error fetching banners:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch Banners', error: error.message });
    }
  };
  
  // update Banners
  exports.updateBanners = function (req, res) {
  uploadBanners(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ success: false, message: 'Multer error', error: err });
    } else if (err) {
      return res.status(500).json({ success: false, message: 'Error uploading file', error: err });
    }
  
    try {
      // const { bannersId } = req.body;
      const { bannersId, redirectionUrl, title, redirectTo } = req.body;
  
      // Validate required fields
      if (!redirectionUrl) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a banners.'
        });
      }
  
      const existingBanners = await Banners.findById(bannersId);
  
      if (!existingBanners) {
        return res.status(404).json({ success: false, message: 'Banners not found.' });
      }
  
      existingBanners.redirectionUrl = redirectionUrl;
      existingBanners.title = title;
      existingBanners.redirectTo = redirectTo;
  
      // Update image path if a new image is uploaded
      if (req.files['bannerImage']) {
        const imagePath = req.files['bannerImage'][0].path.replace(/^.*bannersImage[\\/]/, 'bannersImage/');
        existingBanners.bannerImage = imagePath;
      }
  
      await existingBanners.save();
  
      res.status(200).json({ success: true, message: 'Banners updated successfully.', data: existingBanners });
    } catch (error) {
      console.error('Error updating Banners:', error);
      res.status(500).json({ success: false, message: 'Failed to update Banners.', error: error.message });
    }
  });
  };
  
  //delete Banners
  exports.deleteBanners = async function(req, res) {
    try {
      const bannersId = req.body.bannersId;
  
      if (!mongoose.Types.ObjectId.isValid(bannersId)) {
        return res.status(400).json({ success: false, message: 'Invalid Banners ID' });
      }
  
      const deletedBanners = await Banners.findByIdAndDelete(bannersId);
  
      if (!deletedBanners) {
        return res.status(404).json({ success: false, message: 'Banners not found.' });
      }
  
      res.status(200).json({ success: true, message: 'Banners deleted successfully', deletedBanners });
    } catch (error) {
      console.error('Error deleting Banners:', error);
      res.status(500).json({ success: false, message: 'Failed to delete Banners', error: error.message });
    }
  };
  
  // tournament list 
exports.getAllTournament = async function(req,res) {
    try {
      const tournamentList = await Tournament.find()
  
      res.status(200).json({ success: true, tournamentList });
    } catch (error) {
      console.error('Error fetching tournament:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch tournament', error: error.message });
    }
  };