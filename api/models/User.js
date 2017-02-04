//mongoose is needed to create the Schema
let mongoose = require('mongoose');
//Schema mongoose Schema
//use brypt to hash the information
let bcrypt = require('bcrypt-nodejs');
let db = require('../db.js')

//function to validate email
let validateEmail = (email) => {
  return (/\S+@\S+\.\S+/).test(email);
}
//the user schema setup, which checks if it's unique and it has forced lowercase
//as well as runs the validate process via the validate function that exists 
let userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: 'Email address is required',
    validate: [validateEmail, 'Please enter a valid email']
  },
  password: {
  	type: String,
  	required: true
  },
  saved: {
    type: Array,
    default: []  
  },
  queryInputs: {
      type: [String]
    //implement redis to find popular queries
  }, 
  quizAnswers: {
    genre: {
      action: {
        type: Number,
        default: 0
      },
      comedy: {
        type: Number,
        default: 0
      },
      romance: {
        type: Number,
        default: 0
      },
      drama: {
        type: Number,
        default: 0
      },
      indifferent: {
        type: Number,
        default: 0
      }
    },

    era: {
      new: {
        type: Number,
        default: 0
      },
      modern: {
        type: Number,
        default: 0
      },
      old: {
        type: Number,
        default: 0
      },
      indifferent: {
        type: Number,
        default: 0
      }
    },

    sort: {
      popularity: {
        type: Number,
        default: 0
      },
      rating: {
        type: Number,
        default: 0
      },
      recommended: {
        type: Number,
        default: 0
      },
      indifferent: {
        type: Number,
        default: 0
      }
    }
  },

  quizResults: {
    type: [String]
    //may refactor later
  }
})

//before the save is invoked  the user would be checked if they are new or if the password modification is being invoked
userSchema.pre('save', function(next) {
  let user = this;
  if (user.isNew || user.isModified('password')) {
    // a bcrypt will be invoked with a genSalt
    bcrypt.genSalt(10, function(err, salt) {
      if (err) { return next(err) }
      bcrypt.hash(user.password, salt, null, function(err, hash) {
        if (err) { return next(err) }
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) { return callback(err) }
    callback(null, isMatch);
  });
}

let User = mongoose.model('user', userSchema)

module.exports = User
