const { Schema, Types, model } = require('mongoose');

const messageSchema = new Schema(
  {
    sender: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },

    room: {
      type: Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);
const roomSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    namespace: {
      type: Types.ObjectId,
      ref: 'NameSpace',
      required: true,
    },
  },
  { timestamps: true },
);
const nameSpaceSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  href: {
    type: String,
    required: true,
  },
  rooms: [{ type: Types.ObjectId, ref: 'Room' }],
});

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const UserModel = model('User', userSchema);

const NameSpaceModel = model('NameSpace', nameSpaceSchema);
const MessageModel = model('Message', messageSchema);
const RoomModel = model('Room', roomSchema);

module.exports = { NameSpaceModel, MessageModel, RoomModel, UserModel };
