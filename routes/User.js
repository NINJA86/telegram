const express = require('express');
const bcrypt = require('bcrypt');
const { UserModel: userModel } = require('../Models/Chat');
const generateToken = require('../utils/tokenGenerator');

const router = express.Router();

const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    maxAge: 2 * 24 * 60 * 60 * 1000,
    secure: false,
    sameSite: 'lax',
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 100,
    secure: false,
    sameSite: 'lax',
  });
};

router.post('/register', async (req, res) => {
  try {
    const { name, password, phone } = req.body;

    if (!name || !password || !phone) {
      return res.status(400).json({ message: 'همه فیلدها الزامی هستند' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      name,
      password: hashedPassword,
      phone,
      role: 'user',
    });

    const { accessToken, refreshToken } = generateToken({
      role: newUser.role,
      id: newUser._id,
      name: newUser.name,
    });

    await userModel.findByIdAndUpdate(newUser._id, { refreshToken });

    setTokenCookies(res, accessToken, refreshToken);
    return res.status(201).json({
      message: 'ثبت‌نام موفق',
      user: { id: newUser._id, name, phone },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: 'این شماره تلفن قبلاً ثبت شده است' });
    }
    console.error(err);
    return res.status(500).json({ message: 'خطای سرور' });
  }
});
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await userModel.findOne({ phone });

    const doesPasswordMatch = await bcrypt.compare(password, user.password);
    if ((!user, !doesPasswordMatch)) {
      return res.status(401).json({
        message: 'اطلاعات برای ورود معتبر نیست!',
      });
    }
    const { accessToken, refreshToken } = generateToken({
      role: user.role,
      id: user._id,
      name: user.name,
    });

    await userModel.findByIdAndUpdate(user._id, { refreshToken });

    setTokenCookies(res, accessToken, refreshToken);
    return res.status(200).json({
      message: 'ورود موفق',
      user: { id: user._id, name: user.name, phone, role: user.role },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'خطای سرور' });
  }
});
module.exports = router;
