/* eslint-disable no-console */
const bcrypt = require('bcryptjs');
const { UserInputError } = require('apollo-server');
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
