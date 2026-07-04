const { Types } = require('mongoose');
const {
  RoomModel: roomModel,
  NameSpaceModel: namespaceModel,
} = require('../Models/Chat');
exports.createRoom = async (req, res, next) => {
  try {
    const { title, namespace: namespaceId } = req.body;

    const namespace = await namespaceModel.findById(namespaceId);
    if (!namespace) {
      return res.status(404).json({ message: 'Namespace not found' });
    }

    let image = req.file?.filename;

    const room = await roomModel.create({
      title,
      image,
      namespace: namespaceId,
    });

    await namespaceModel.findByIdAndUpdate(namespaceId, {
      $push: { rooms: room._id },
    });

    return res.status(201).json({ message: 'Room has been created', room });
  } catch (error) {
    next(error);
  }
};
