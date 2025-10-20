const prisma = require('../config/prisma');
const { StatusCodes } = require('http-status-codes');
const BadRequestError = require('../errors/badRequest');
const NotFoundError = require('../errors/notFound');

// Helper: check overlap [aStart,aEnd) and [bStart,bEnd)
function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Create timetable slot
 * POST /api/timetables
 * body: { classId, subjectId, teacherId, classroomId, day, startMinute, endMinute }
 */
const createTimetable = async (req, res) => {
  const { classId, subjectId, teacherId, classroomId, day, startMinute, endMinute } = req.body;
  if (!classId || !subjectId || !teacherId || !classroomId || !day || startMinute == null || endMinute == null) {
    throw new BadRequestError('Missing required fields');
  }
  if (Number(startMinute) >= Number(endMinute)) throw new BadRequestError('startMinute must be < endMinute');

  // Normalize
  const s = Number(startMinute);
  const e = Number(endMinute);

  // Check overlapping slots for same teacher on same day
  const teacherConflicts = await prisma.timetable.findMany({
    where: { teacherId: Number(teacherId), day },
  });
  for (const t of teacherConflicts) {
    if (overlaps(s, e, t.startMinute, t.endMinute)) {
      throw new BadRequestError('Teacher has a conflicting slot at this time');
    }
  }

  // Check overlapping slots for same classroom on same day
  const roomConflicts = await prisma.timetable.findMany({ where: { classroomId: Number(classroomId), day } });
  for (const t of roomConflicts) {
    if (overlaps(s, e, t.startMinute, t.endMinute)) {
      throw new BadRequestError('Classroom has a conflicting slot at this time');
    }
  }

  // Check overlapping slots for same class on same day
  const classConflicts = await prisma.timetable.findMany({ where: { classId: Number(classId), day } });
  for (const t of classConflicts) {
    if (overlaps(s, e, t.startMinute, t.endMinute)) {
      throw new BadRequestError('Class has a conflicting slot at this time');
    }
  }

  const slot = await prisma.timetable.create({ data: {
    classId: Number(classId), subjectId: Number(subjectId), teacherId: Number(teacherId), classroomId: Number(classroomId), day, startMinute: s, endMinute: e
  }});

  res.status(StatusCodes.CREATED).json({ success: true, data: slot });
};

const getTimetables = async (req, res) => {
  const items = await prisma.timetable.findMany({ include: { class: true, subject: true, teacher: { include: { user: true } }, classroom: true } });
  res.status(StatusCodes.OK).json({ success: true, data: items });
};

const getTimetableById = async (req, res) => {
  const id = Number(req.params.id);
  const slot = await prisma.timetable.findUnique({ where: { id }, include: { class: true, subject: true, teacher: { include: { user: true } }, classroom: true } });
  if (!slot) throw new NotFoundError('Timetable slot not found');
  res.status(StatusCodes.OK).json({ success: true, data: slot });
};

const updateTimetable = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.timetable.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Timetable slot not found');

  const { classId, subjectId, teacherId, classroomId, day, startMinute, endMinute } = req.body;
  const s = startMinute != null ? Number(startMinute) : existing.startMinute;
  const e = endMinute != null ? Number(endMinute) : existing.endMinute;
  const newDay = day || existing.day;
  const newTeacher = teacherId != null ? Number(teacherId) : existing.teacherId;
  const newClassroom = classroomId != null ? Number(classroomId) : existing.classroomId;
  const newClass = classId != null ? Number(classId) : existing.classId;

  if (s >= e) throw new BadRequestError('startMinute must be < endMinute');

  // Check conflicts (exclude current id)
  const conflicts = await prisma.timetable.findMany({ where: { NOT: { id }, day: newDay } });

  for (const t of conflicts) {
    // teacher conflict
    if (t.teacherId === newTeacher && overlaps(s, e, t.startMinute, t.endMinute)) throw new BadRequestError('Teacher has a conflicting slot');
    // classroom conflict
    if (t.classroomId === newClassroom && overlaps(s, e, t.startMinute, t.endMinute)) throw new BadRequestError('Classroom has a conflicting slot');
    // class conflict
    if (t.classId === newClass && overlaps(s, e, t.startMinute, t.endMinute)) throw new BadRequestError('Class has a conflicting slot');
  }

  const updated = await prisma.timetable.update({ where: { id }, data: {
    classId: newClass,
    subjectId: subjectId != null ? Number(subjectId) : existing.subjectId,
    teacherId: newTeacher,
    classroomId: newClassroom,
    day: newDay,
    startMinute: s,
    endMinute: e
  }});

  res.status(StatusCodes.OK).json({ success: true, data: updated });
};

const deleteTimetable = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.timetable.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Timetable slot not found');
  await prisma.timetable.delete({ where: { id } });
  res.status(StatusCodes.NO_CONTENT).send();
};

module.exports = { createTimetable, getTimetables, getTimetableById, updateTimetable, deleteTimetable };
// Business logic: Timetable

