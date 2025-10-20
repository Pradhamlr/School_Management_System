const prisma = require('../config/prisma');
const { StatusCodes } = require('http-status-codes');
const BadRequestError = require('../errors/badRequest');
const NotFoundError = require('../errors/notFound');

// Controller contract (inputs/outputs):
// - createFeeRecord(req.body): { studentId, amount, dueDate } -> creates FeeRecord
// - getAllFeeRecords(): admin view of all records
// - getFeeRecordById(req.params.id): single fee record
// - getMyFees(): student-specific records based on req.user.id
// - payFee(req.params.id): mark as PAID, set paidAt and optional transactionId

const createFeeRecord = async (req, res) => {
	const { studentId, amount, dueDate } = req.body;

	if (!studentId || amount === undefined || !dueDate) {
		throw new BadRequestError('studentId, amount and dueDate are required');
	}

	// ensure student exists
	const student = await prisma.student.findUnique({ where: { id: Number(studentId) } });
	if (!student) throw new NotFoundError('Student not found');

	const fee = await prisma.feeRecord.create({
		data: {
			studentId: Number(studentId),
			amount: Number(amount),
			dueDate: new Date(dueDate),
			status: 'PENDING'
		},
		include: { student: { include: { user: { select: { id: true, name: true, email: true } } } } }
	});

	res.status(StatusCodes.CREATED).json({ success: true, fee });
};

const getAllFeeRecords = async (req, res) => {
	const fees = await prisma.feeRecord.findMany({
		include: { student: { include: { user: { select: { id: true, name: true, email: true } } } } },
		orderBy: { dueDate: 'desc' }
	});

	res.status(StatusCodes.OK).json({ success: true, fees });
};

const getFeeRecordById = async (req, res) => {
	const id = Number(req.params.id);
	const fee = await prisma.feeRecord.findUnique({
		where: { id },
		include: { student: { include: { user: { select: { id: true, name: true, email: true } } } } }
	});

	if (!fee) throw new NotFoundError('Fee record not found');

	// If requester is student, ensure they own the record
	if (req.user.role === 'STUDENT') {
		const student = await prisma.student.findUnique({ where: { id: fee.studentId } });
		if (!student || student.userId !== req.user.id) {
			return res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied' });
		}
	}

	res.status(StatusCodes.OK).json({ success: true, fee });
};

const getMyFees = async (req, res) => {
	// Only students expected, but admins could call other endpoints
	const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
	if (!student) throw new NotFoundError('Student profile not found for current user');

	const fees = await prisma.feeRecord.findMany({
		where: { studentId: student.id },
		orderBy: { dueDate: 'desc' }
	});

	res.status(StatusCodes.OK).json({ success: true, fees });
};

const payFee = async (req, res) => {
	const id = Number(req.params.id);
	const { transactionId } = req.body; // optional

	const fee = await prisma.feeRecord.findUnique({ where: { id } });
	if (!fee) throw new NotFoundError('Fee record not found');

	// Ensure only owning student (or admin) can pay
	if (req.user.role === 'STUDENT') {
		const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
		if (!student || student.id !== fee.studentId) {
			return res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied' });
		}
	}

	if (fee.status === 'PAID') {
		throw new BadRequestError('Fee already paid');
	}

	const updated = await prisma.feeRecord.update({
		where: { id },
		data: { status: 'PAID', paidAt: new Date(), transactionId: transactionId || null }
	});

	res.status(StatusCodes.OK).json({ success: true, message: 'Payment recorded', fee: updated });
};

const updateFee = async (req, res) => {
	// Admin only: allow updating amount, dueDate, status
	const id = Number(req.params.id);
	const { amount, dueDate, status } = req.body;

	const existing = await prisma.feeRecord.findUnique({ where: { id } });
	if (!existing) throw new NotFoundError('Fee record not found');

	const data = {};
	if (amount !== undefined) data.amount = Number(amount);
	if (dueDate !== undefined) data.dueDate = new Date(dueDate);
	if (status !== undefined) data.status = status;

	const updated = await prisma.feeRecord.update({ where: { id }, data });

	res.status(StatusCodes.OK).json({ success: true, message: 'Fee updated', fee: updated });
};

const deleteFee = async (req, res) => {
	const id = Number(req.params.id);
	const existing = await prisma.feeRecord.findUnique({ where: { id } });
	if (!existing) throw new NotFoundError('Fee record not found');

	await prisma.feeRecord.delete({ where: { id } });

	res.status(StatusCodes.OK).json({ success: true, message: 'Fee record deleted' });
};

module.exports = {
	createFeeRecord,
	getAllFeeRecords,
	getFeeRecordById,
	getMyFees,
	payFee,
	updateFee,
	deleteFee
};