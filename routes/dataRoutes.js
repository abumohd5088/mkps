const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const Assignment = require('../models/Assignment');
const Message = require('../models/Message');
const Event = require('../models/Event');
const SchoolClass = require('../models/SchoolClass');
const { authRequired, allowRoles } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'public/uploads',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  },
});
const upload = multer({ storage });

router.get('/me', authRequired, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

router.get('/students', authRequired, allowRoles('teacher', 'admin'), async (req, res) => {
  const search = req.query.search || '';
  const students = await User.find({
    role: 'student',
    name: { $regex: search, $options: 'i' },
  }).select('name email className');
  res.json(students);
});

router.get('/teachers', authRequired, allowRoles('admin', 'student'), async (req, res) => {
  const teachers = await User.find({ role: 'teacher' }).select('name email subjects');
  res.json(teachers);
});

router.post('/marks', authRequired, allowRoles('teacher'), async (req, res) => {
  const mark = await Mark.create({ ...req.body, teacherId: req.user.id });
  res.status(201).json(mark);
});

router.put('/marks/:id', authRequired, allowRoles('teacher'), async (req, res) => {
  const mark = await Mark.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(mark);
});

router.get('/marks', authRequired, async (req, res) => {
  const filter = req.user.role === 'student' ? { studentId: req.user.id } : {};
  const marks = await Mark.find(filter).populate('studentId', 'name className').sort({ createdAt: -1 });
  res.json(marks);
});

router.post('/attendance', authRequired, allowRoles('teacher'), async (req, res) => {
  const attendance = await Attendance.create({ ...req.body, teacherId: req.user.id });
  res.status(201).json(attendance);
});

router.get('/attendance', authRequired, async (req, res) => {
  const filter = req.user.role === 'student' ? { studentId: req.user.id } : {};
  const data = await Attendance.find(filter).populate('studentId', 'name').sort({ date: -1 });
  res.json(data);
});

router.post('/announcements', authRequired, allowRoles('teacher', 'admin'), async (req, res) => {
  const announcement = await Announcement.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json(announcement);
});

router.get('/announcements', authRequired, async (req, res) => {
  const announcements = await Announcement.find({
    $or: [{ targetRole: 'all' }, { targetRole: req.user.role }],
  }).sort({ createdAt: -1 });
  res.json(announcements);
});

router.delete('/announcements/:id', authRequired, allowRoles('admin'), async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ message: 'Announcement removed.' });
});

router.post('/assignments', authRequired, allowRoles('teacher'), upload.single('file'), async (req, res) => {
  const assignment = await Assignment.create({
    title: req.body.title,
    className: req.body.className,
    subject: req.body.subject,
    fileUrl: `/uploads/${req.file.filename}`,
    uploadedBy: req.user.id,
  });
  res.status(201).json(assignment);
});

router.get('/assignments', authRequired, async (req, res) => {
  const assignments = await Assignment.find().sort({ createdAt: -1 });
  res.json(assignments);
});

router.post('/messages', authRequired, async (req, res) => {
  const message = await Message.create({ fromUser: req.user.id, toUser: req.body.toUser, text: req.body.text });
  res.status(201).json(message);
});

router.get('/messages/:otherUserId', authRequired, async (req, res) => {
  const otherUserId = req.params.otherUserId;
  const messages = await Message.find({
    $or: [
      { fromUser: req.user.id, toUser: otherUserId },
      { fromUser: otherUserId, toUser: req.user.id },
    ],
  })
    .populate('fromUser', 'name role')
    .sort({ createdAt: 1 });
  res.json(messages);
});

router.post('/events', authRequired, allowRoles('teacher', 'admin'), async (req, res) => {
  const event = await Event.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json(event);
});

router.get('/events', authRequired, async (req, res) => {
  const events = await Event.find().sort({ eventDate: 1 });
  res.json(events);
});

router.post('/classes', authRequired, allowRoles('admin'), async (req, res) => {
  const item = await SchoolClass.create(req.body);
  res.status(201).json(item);
});

router.get('/classes', authRequired, async (req, res) => {
  const items = await SchoolClass.find().sort({ name: 1 });
  res.json(items);
});

router.get('/analytics', authRequired, allowRoles('admin'), async (req, res) => {
  const [students, teachers, marks, attendance, announcements] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'teacher' }),
    Mark.countDocuments(),
    Attendance.countDocuments(),
    Announcement.countDocuments(),
  ]);

  res.json({ students, teachers, marks, attendance, announcements });
});

router.delete('/users/:id', authRequired, allowRoles('admin'), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User removed.' });
});

router.get('/report-card/:studentId', authRequired, async (req, res) => {
  const studentId = req.params.studentId;
  if (req.user.role === 'student' && req.user.id !== studentId) {
    return res.status(403).json({ message: 'You can only access your report card.' });
  }

  const student = await User.findById(studentId).select('name className email');
  const marks = await Mark.find({ studentId }).sort({ createdAt: -1 });
  const attendance = await Attendance.find({ studentId });

  const present = attendance.filter((a) => a.status === 'Present').length;
  const attendanceRate = attendance.length ? `${Math.round((present / attendance.length) * 100)}%` : 'N/A';

  res.json({ student, marks, attendanceRate });
});

module.exports = router;
