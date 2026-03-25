const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const notificationChannelSchema = new mongoose.Schema(
  {
    followers: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    likes: { type: Boolean, default: true },
    tips: { type: Boolean, default: true },
  },
  { _id: false }
);

const notificationPreferencesSchema = new mongoose.Schema(
  {
    inApp: { type: notificationChannelSchema, default: () => ({}) },
    email: { type: notificationChannelSchema, default: () => ({}) },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    avatarKey: {
      type: String,
      trim: true,
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
    },
    accountStatus: {
      type: String,
      enum: ['active', 'pending', 'suspended', 'deactivated'],
      required: true,
      default: 'active',
    },
    notificationPreferences: {
      type: notificationPreferencesSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

userSchema.pre('save', async function preSave() {
  if (!this.isModified('password')) {
    return;
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
