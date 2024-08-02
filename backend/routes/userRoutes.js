import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import { isAuth, generateToken } from '../utils.js';

const userRouter = express.Router();

// Route to sign in a user
userRouter.post('/signin', async (req, res) => {
  try {
    console.log('Attempting to sign in with email:', req.body.email);
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        console.log('User signed in successfully:', user);
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        return;
      } else {
        console.log('Invalid password');
      }
    } else {
      console.log('User not found');
    }
    res.status(401).send({ message: 'Invalid email or password' });
  } catch (error) {
    console.error('Error signing in:', error.message);
    res.status(500).send({ message: error.message });
  }
});

// Route to sign up a new user
userRouter.post('/signup', async (req, res) => {
  try {
    console.log('Attempting to sign up user with email:', req.body.email);
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save();
    console.log('User signed up successfully:', user);
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    });
  } catch (error) {
    console.error('Error signing up:', error.message);
    res.status(500).send({ message: error.message });
  }
});

// Route to update user profile
userRouter.put('/profile', isAuth, async (req, res) => {
  try {
    console.log('Updating user profile for user ID:', req.user._id);
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }

      const updatedUser = await user.save();
      console.log('User profile updated successfully:', updatedUser);
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser),
      });
    } else {
      console.log('User not found');
      res.status(404).send({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    res.status(500).send({ message: error.message });
  }
});

export default userRouter;
