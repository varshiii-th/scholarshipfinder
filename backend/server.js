const express = require('express');
const cors = require('cors');
const User = require('./model/user');
const app = express();
const { connectToMongoDb } = require('./config/db');
const port = 8008;
const userRouter = require('./api/user');
const scholarshipdetails = require('./model/scholarshipdetails');
const bodyParser = require('express').json;
const scholarshipRoutes = require('./routes/scholarships');

app.use(bodyParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

require('dotenv').config();
const mongoUri = process.env.MONGO_URI;

connectToMongoDb(mongoUri).then(() => {
  console.log("MongoDB connected");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

app.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching user',
      error
    });
  }
});

app.get('/search', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.query.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error searching user', error });
  }
});

app.put('/user/:id/CGPA', async (req, res) => {
  try {
    const { CGPA } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { CGPA }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating CGPA', error });
  }
});

app.put('/user/:id/Course', async (req, res) => {
  try {
    const { Course } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { Course }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating Course', error });
  }
});

app.put('/user/:id/Branch', async (req, res) => {
  try {
    const { Branch } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { Branch }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating Branch', error });
  }
});

app.put('/user/:id/dateOfBirth', async (req, res) => {
  try {
    const { dateOfBirth } = req.body; // Fixed typo
    const user = await User.findByIdAndUpdate(req.params.id, { dateOfBirth }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating Date of Birth', error });
  }
});

app.put('/user/:id/country', async (req, res) => {
  try {
    const { country } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { country }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating Country', error });
  }
});

app.get('/recommendedscholarships/:username', async (req, res) => {
  try {
    const user = await User.findOne({username:req.params.username});
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build dynamic query based on courseLevel
    let eligibilityField = '';

    if (user.Course === 'Undergraduate') eligibilityField = 'undergraduate';
    else if (user.Course === 'Postgraduate') eligibilityField = 'postgraduate';
    else if (user.Course === 'Doctoral') eligibilityField = 'doctoral';
    else return res.status(400).json({ message: 'Invalid course level' });

    // Query scholarships
    if(user.country==='India'){
    const location = user.country ? user.country.replace(/\s+/g, ' ').trim() : '';
    const scholarships = await scholarshipdetails.find({
      country: ' '+location,
      [eligibilityField]: 1
    });
        res.json(scholarships);

  }else{
  const scholarships = await scholarshipdetails.find({
      country: { $ne: ' India' },
      [eligibilityField]: 1
    });
        res.json(scholarships);

  }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.use('/scdetails', scholarshipRoutes);
app.use('/user', userRouter);

app.listen(port, () => {
  console.log(`server started at port ${port}`);
});