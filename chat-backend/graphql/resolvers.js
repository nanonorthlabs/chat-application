const bcrypt = require("bcrypt");
const { UserInputError } = require("apollo-server");

const { User } = require("../models");

module.exports = {
  Query: {
    getUsers: async () => {
      try {
        const users = await User.findAll();
        return users;
      } catch (error) {
        console.log(error);
        throw err;
      }
    },
  },
  Mutation: {
    register: async (parent, args) => {
      let { username, email, password, confirmPassword } = args;
      let errors = {};

      try {
        if (email.trim() === "") errors.email = "email must not be empty";
        if (username.trim() === "")
          errors.username = "username must not be empty";
        if (password.trim() === "")
          errors.password = "password must not be empty";
        if (confirmPassword.trim() === "")
          errors.confirmPassword = "repeat password must not be empty";

        if (password !== confirmPassword)
          errors.confirmPassword = "passwords must match";

        // const userByUsername = await findOne({ where: { username } });
        // const userByEmail = await findOne({ where: { email } });

        // if (userByUsername) errors.username = "username is taken";
        // if (userByEmail) errors.email = "email is taken";

        if (Object.keys(errors).length > 0) {
          throw errors;
        }

        password = await bcrypt.hash(password, 6);

        const user = await User.create({
          username,
          email,
          password,
          confirmPassword,
        });

        return user;
      } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
          err.errors.forEach(
            (e) => (errors[e.path] = `${e.path} is already taken`)
          );
        } else if (err.name === "SequelizeValidationError") {
          err.errors.forReach((e) => (errors[e.path] = e.message));
        }
        throw new UserInputError("Bad Input", { errors: err });
      }
    },
  },
};
