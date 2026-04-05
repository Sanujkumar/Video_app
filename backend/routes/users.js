const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({ organisation: req.user.organisation });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/role', authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
