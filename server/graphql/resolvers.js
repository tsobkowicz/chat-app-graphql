/* eslint-disable no-console */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError, AuthenticationError } = require('apollo-server');
const { User } = require('../models');

module.exports = {
  Query: {
    getUsers: async () => {
      try {
        const users = await User.findAll();
        return users;
      } catch (err) {
        console.log(err);
      }
    },
    login: async (_, { username, password }) => {
      const errors = {};

      try {
        if (username.trim() === '') errors.username = 'username must not be empty';
        if (password.trim() === '') errors.password = 'password must not be empty';

        if (Object.keys(errors).length > 0) {
          throw new UserInputError('bad input', { errors });
        }

        const user = await User.findOne({
          where: { username },
        });

        if (!user) {
          errors.username = 'user not found';
          throw new UserInputError('user not found', { errors });
        }

        const correctPassword = await bcrypt.compare(password, user.password);
        if (!correctPassword) {
          errors.password = 'password is incorrect';
          throw new AuthenticationError('password is incorrect', { errors });
        }

        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: 60 * 60 });

        user.token = token;

        return {
          // by default returned object is colled with the function toJSON(), if you want to modify sth in the object, you have to spread the object and call toJSON() by yourself
          ...user.toJSON(),
          createdAt: user.createdAt.toISOString(),
          token,
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },

  Mutation: {
    register: async (_, { username, email, password, confirmPassword }) => {
      const errors = {};

      try {
        // validate input data
        if (email.trim() === '') errors.email = 'email must not be empty';
        if (username.trim() === '') errors.username = 'username must not be empty';
        if (password.trim() === '') errors.password = 'password must not be empty';
        if (confirmPassword.trim() === '') errors.confirmPassword = 'repeat password must not be empty';
        if (password !== confirmPassword) errors.confirmPassword = 'password must match';

        // // Check if username /email exists
        // const userByUsername = await User.findOne({ where: { username } });
        // const userByEmail = await User.findOne({ where: { email } });

        // if (userByUsername) errors.username = 'username is taken';
        // if (userByEmail) errors.email = 'email is taken';

        if (Object.keys(errors).length > 0) {
          // throw errors through userinputerror in catch block
          throw errors;
        }

        // hash password
        const passwordHash = await bcrypt.hash(password, 6);

        // create user
        const user = await User.create({
          username,
          email,
          password: passwordHash,
        });

        // return user object
        return user;
      } catch (err) {
        console.log(err);
        // send one db request to check if username / email already exists
        if (err.name === 'SequelizeUniqueConstraintError') {
          err.errors.forEach((e) => (errors[e.path] = `${e.path} is already taken`));
        } else if (err.name === 'SequelizeValidationError') {
          // check for errors in sequalize validation errors (in models)
          err.errors.forEach((e) => (errors[e.path] = e.message));
        }
        throw new UserInputError('Bad input', { errors });
      }
    },
  },
};
