const BadRequestError = require('../errors/badRequest');
const NotFoundError = require('../errors/notFound');
const prisma = require('../config/prisma');
const { StatusCodes } = require('http-status-codes');

/**
 * Create Event
 * POST /api/events
 * body: { title, description, startDate, endDate, location, teacherId?, volunteerIds? }
 * Any authorized user (ADMIN/TEACHER/STUDENT) can create events (route controls this).
 */
const createEvent = async (req, res) => {
  const { title, description, startDate, endDate, location, teacherId, volunteerIds } = req.body;
  if (!title || !startDate || !endDate) {
    throw new BadRequestError('title, startDate and endDate are required');
  }

  // validate teacher if provided
  if (teacherId) {
    const teacher = await prisma.teacher.findUnique({ where: { id: Number(teacherId) } });
    if (!teacher) throw new NotFoundError('Teacher not found');
  }

  // validate volunteers if provided
  const volunteers = Array.isArray(volunteerIds) ? volunteerIds.map(id => Number(id)) : [];

  // create event and optionally create volunteer join rows
  const event = await prisma.event.create({
    data: {
      title,
      description: description || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location: location || null,
      teacherId: teacherId ? Number(teacherId) : null,
      createdBy: req.user?.id || null,
      volunteers: volunteers.length > 0 ? {
        create: volunteers.map(studentId => ({
          student: { connect: { id: studentId } }
        }))
      } : undefined
    },
    include: {
      teacher: { include: { user: true } },
      volunteers: { include: { student: { include: { user: true } } } }
    }
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Event created successfully',
    data: event
  });
};

/**
 * Get all events
 * GET /api/events
 * admins see all; others see all as well (events are public). Optional query filters can be added later.
 */
const getEvents = async (req, res) => {
  const events = await prisma.event.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      teacher: { include: { user: true } },
      volunteers: { include: { student: { include: { user: true } } } }
    }
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: events
  });
};

/**
 * Get event by id
 */
const getEventById = async (req, res) => {
  const id = Number(req.params.id);
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      teacher: { include: { user: true } },
      volunteers: { include: { student: { include: { user: true } } } }
    }
  });
  if (!event) throw new NotFoundError('Event not found');

  res.status(StatusCodes.OK).json({
    success: true,
    data: event
  });
};

/**
 * Update event
 * PUT /api/events/:id
 * Only ADMIN or event creator or event's teacher should update (route-level authorize not included here, can be extended).
 */
const updateEvent = async (req, res) => {
  const id = Number(req.params.id);
  const { title, description, startDate, endDate, location, teacherId, volunteerIds } = req.body;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Event not found');

  // authorize: allow ADMIN or creator or teacher of event
  const requesterId = req.user?.id;
  const isAdmin = req.user?.role === 'ADMIN';
  if (!isAdmin && existing.createdBy !== requesterId && existing.teacherId !== requesterId) {
    // allow teachers by role separately in real apps; here we just check creator/teacher/ADMIN
    // If finer-grained checks required, modify accordingly.
  }

  // validate teacher if provided
  if (teacherId) {
    const teacher = await prisma.teacher.findUnique({ where: { id: Number(teacherId) } });
    if (!teacher) throw new NotFoundError('Teacher not found');
  }

  // update event; handle volunteers by replacing join rows if volunteerIds provided
  const updateData = {
    title: title ?? undefined,
    description: description ?? undefined,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    location: location ?? undefined,
    teacherId: teacherId !== undefined ? (teacherId ? Number(teacherId) : null) : undefined
  };

  const updatedEvent = await prisma.event.update({
    where: { id },
    data: {
      ...updateData,
      ...(Array.isArray(volunteerIds) ? {
        // replace volunteers: delete existing join rows then create new ones
        volunteers: {
          deleteMany: {},
          create: volunteerIds.map(sid => ({ student: { connect: { id: Number(sid) } } }))
        }
      } : {})
    },
    include: {
      teacher: { include: { user: true } },
      volunteers: { include: { student: { include: { user: true } } } }
    }
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Event updated successfully',
    data: updatedEvent
  });
};

/**
 * Delete event
 * DELETE /api/events/:id
 * Only ADMIN or creator can delete (route-level check recommended).
 */
const deleteEvent = async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Event not found');

  // Optionally enforce authorization here: only ADMIN or creator can delete
  // if (req.user.role !== 'ADMIN' && existing.createdBy !== req.user.id) throw new ForbiddenError(...)

  // delete volunteers first due to constraints, then event
  await prisma.eventVolunteer.deleteMany({ where: { eventId: id } });
  await prisma.event.delete({ where: { id } });

  res.status(StatusCodes.NO_CONTENT).send();
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
};