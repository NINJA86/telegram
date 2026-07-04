const { default: mongoose } = require('mongoose');
const {
  NameSpaceModel: namespaceModel,
  RoomModel: roomModel,
} = require('../Models/Chat');

exports.getAll = async (req, res, next) => {
  try {
    const namespaces = await namespaceModel.find({}, { room: 0 });
    return res.json(namespaces);
  } catch (error) {
    next(error);
  }
};
exports.create = async (req, res, next) => {
  try {
    const { title, href } = req.body;

    const namespace = await namespaceModel.findOne({
      $or: [{ title }, { href }],
    });

    if (namespace) {
      return res.status(400).json({ message: 'namespace is already existed' });
    }

    await namespaceModel.create({ title, href });
    return res.status(201).json({ message: 'namespace has created' });
  } catch (error) {
    next(error);
  }
};
