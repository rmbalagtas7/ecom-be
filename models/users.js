const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const Schema = mongoose.Schema
const SALT_WORK_FACTOR = 10;


const schema = new Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true,
      index: true,
      required: true,
      validate: [validator.isEmail, "Please fill in a valid email."],
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be 8-15 characters long"],
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    access_level: {
      type: Number,
      default: 1,
    },
    avatar: String,
    avatar: {
      type: String,
      default: ''
    }

  },
  {
    timestamps: true,
  }
);

schema.pre("save", function (next) {
  var user = this;
  if (!user.isModified("password")) return next();
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

schema.pre("findOneAndUpdate", async function (next) {
  const { password } = this.getUpdate();
  if (password) {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    const hash = await bcrypt.hash(password, salt);
    this.getUpdate().password = hash;
  }
  next();
});

schema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', schema)