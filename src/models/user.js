const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, 

      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email Address");
        }
      },
    },

    password: {
      type: String,
      required: true,
      minlength: 6,

      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password");
        }
      },
    },

    age: {
      type: Number,
      min: 18,
      max: 100,
    },

    gender: {
      type: String,

      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender not valid");
        }
      },
    },

    photoUrl: {
      type: String,

      default:
        "https://cdn-icons-png.flaticon.com/512/149/149071.png",

      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid Photo URL");
        }
      },
    },

    about: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "Hey there! I am using DevTinder.",
    },

    skills: {
      type: [String],

      validate(value) {
        if (value.length > 10) {
          throw new Error("You can add maximum 10 skills");
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJwtToken = async function () {
  const user=this;
  const jwtSecret = process.env.JWT_SECRET;
  return await jwt.sign({ _id: this._id }, jwtSecret, {
    expiresIn: "7d",
  });
};

userSchema.methods.validatePassword = async function (passowrdInputByUser) {
  const user=this;
  const passwordHash=user.password;
  const isPasswordValid = await bcrypt.compare(passowrdInputByUser, passwordHash); 
  return isPasswordValid; 
};


const User = mongoose.model("User", userSchema);

module.exports = User;