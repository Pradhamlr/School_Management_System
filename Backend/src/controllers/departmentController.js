const prisma = require('../config/prisma');
const { StatusCodes } = require('http-status-codes');

const getDepartments = async (req, res) => {
  // return distinct department names and counts
  const raw = await prisma.teacher.findMany({ select: { department: true } });
  const counts = raw.reduce((acc, t) => {
    const d = t.department || 'General';
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});
  const list = Object.keys(counts).map(name => ({ name, count: counts[name] }));
  res.status(StatusCodes.OK).json({ departments: list });
};

module.exports = { getDepartments };
