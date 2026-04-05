const express = require('express');
const fs = require('fs');
const path = require('path');
const Video = require('../models/Video');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { simulateSensitivityAnalysis } = require('../utils/sensitivityAnalysis');

const router = express.Router();


router.use(protect);

router.post('/upload', authorize('editor', 'admin'), upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file uploaded' });
    }

    const { title, description, tags, category } = req.body;

    const video = await Video.create({
      title: title || req.file.originalname,
      description: description || '',
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
      organisation: req.user.organisation,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      category: category || 'uncategorized',
      sensitivityStatus: 'pending',
      processingProgress: 0
    });

    const io = req.app.get('io');
    processVideo(video, io, req.user._id);

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully. Processing started.',
      video: {
        id: video._id,
        title: video.title,
        sensitivityStatus: video.sensitivityStatus,
        processingProgress: video.processingProgress
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



const processVideo = async (video, io, userId) => {
  try {
    await Video.findByIdAndUpdate(video._id, {
      sensitivityStatus: 'processing',
      processingProgress: 0
    });

    if (io) {
      io.to(`user-${userId}`).emit('processing-started', {
        videoId: video._id,
        status: 'processing'
      });
    }

    const scores = await simulateSensitivityAnalysis(
      video.filePath,
      video._id,
      io,
      userId
    );

    await Video.findByIdAndUpdate(video._id, {
      sensitivityStatus: scores.overallStatus,
      sensitivityScore: scores.overallScore,
      sensitivityDetails: {
        violence: scores.violence,
        adult: scores.adult,
        hate: scores.hate,
        spam: scores.spam
      },
      processingProgress: 100
    });

  } catch (error) {
    await Video.findByIdAndUpdate(video._id, {
      sensitivityStatus: 'error',
      processingProgress: 0
    });
    console.error('Processing error:', error);
  }
};


router.get('/', async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 10 } = req.query;

    let query = {};
    if (req.user.role === 'admin') {
      query.organisation = req.user.organisation;
    } else if (req.user.role === 'viewer') {
      query.$or = [
        { uploadedBy: req.user._id },
        { accessibleBy: req.user._id },
        { isPublic: true }
      ];
    } else {
      query.uploadedBy = req.user._id;
    }

    if (status) query.sensitivityStatus = status;
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Video.countDocuments(query);
    const videos = await Video.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      videos
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('uploadedBy', 'name email');

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

  
    const canAccess =
      req.user.role === 'admin' ||
      video.uploadedBy._id.toString() === req.user._id.toString() ||
      video.accessibleBy.includes(req.user._id) ||
      video.isPublic;

    if (!canAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



router.get('/:id/stream', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

  
    const canAccess =
      req.user.role === 'admin' ||
      video.uploadedBy.toString() === req.user._id.toString() ||
      video.accessibleBy.includes(req.user._id) ||
      video.isPublic;

    if (!canAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (video.sensitivityStatus === 'processing' || video.sensitivityStatus === 'pending') {
      return res.status(425).json({
        success: false,
        message: 'Video is still being processed. Please wait.'
      });
    }

    const videoPath = path.resolve(video.filePath);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ success: false, message: 'Video file not found on server' });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const file = fs.createReadStream(videoPath, { start, end });

      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': video.mimeType || 'video/mp4',
      };

      res.writeHead(206, headers);
      file.pipe(res);
    } else {
   
      const headers = {
        'Content-Length': fileSize,
        'Content-Type': video.mimeType || 'video/mp4',
        'Accept-Ranges': 'bytes'
      };

      res.writeHead(200, headers);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.put('/:id', authorize('editor', 'admin'), async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    if (req.user.role !== 'admin' && video.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this video' });
    }

    const { title, description, tags, category, isPublic, accessibleBy } = req.body;

    const updated = await Video.findByIdAndUpdate(
      req.params.id,
      { title, description, tags, category, isPublic, accessibleBy },
      { new: true, runValidators: true }
    );

    res.json({ success: true, video: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



router.delete('/:id', authorize('editor', 'admin'), async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    
    if (req.user.role !== 'admin' && video.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this video' });
    }

  
    if (fs.existsSync(video.filePath)) {
      fs.unlinkSync(video.filePath);
    }

    await Video.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
