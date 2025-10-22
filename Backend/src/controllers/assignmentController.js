const BadRequestError = require('../errors/badRequest');
const NotFoundError = require('../errors/notFound');
const prisma = require('../config/prisma');
const { StatusCodes } = require('http-status-codes');

// Create Assignment
const createAssignment = async (req, res) => {
    const { title, description, dueDate, teacherClassSubjectId } = req.body;

    if (!title || !dueDate || !teacherClassSubjectId) {
        throw new BadRequestError('Title, due date, and teacher-class-subject mapping are required');
    }

    // Verify that the teacher-class-subject mapping exists
    const teacherClassSubject = await prisma.teacherClassSubject.findUnique({
        where: { id: Number(teacherClassSubjectId) },
        include: {
            class: true,
            subject: true,
            teacher: { include: { user: true } }
        }
    });

    if (!teacherClassSubject) {
        throw new NotFoundError('Teacher-Class-Subject mapping not found');
    }

    const assignment = await prisma.assignment.create({
        data: {
            title,
            description,
            dueDate: new Date(dueDate),
            teacherClassSubjectId: Number(teacherClassSubjectId)
        },
        include: {
            teacherClassSubject: {
                include: {
                    class: true,
                    subject: true,
                    teacher: { include: { user: true } }
                }
            }
        }
    });

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Assignment created successfully',
        data: assignment
    });
};

// Get All Assignments with filters
const getAssignments = async (req, res) => {
    const { classId, subjectId, teacherId, status } = req.query;

    const whereConditions = {};

    if (classId) {
        whereConditions.teacherClassSubject = {
            ...whereConditions.teacherClassSubject,
            classId: Number(classId)
        };
    }

    if (subjectId) {
        whereConditions.teacherClassSubject = {
            ...whereConditions.teacherClassSubject,
            subjectId: Number(subjectId)
        };
    }

    if (teacherId) {
        whereConditions.teacherClassSubject = {
            ...whereConditions.teacherClassSubject,
            teacherId: Number(teacherId)
        };
    }

    const assignments = await prisma.assignment.findMany({
        where: whereConditions,
        include: {
            teacherClassSubject: {
                include: {
                    class: true,
                    subject: true,
                    teacher: { include: { user: { select: { id: true, name: true, email: true } } } }
                }
            },
            submissions: {
                include: {
                    student: {
                        include: {
                            user: { select: { id: true, name: true, email: true } }
                        }
                    }
                }
            }
        },
        orderBy: { dueDate: 'desc' }
    });

    res.status(StatusCodes.OK).json({
        success: true,
        count: assignments.length,
        data: assignments
    });
};

// Get Assignment by ID
const getAssignmentById = async (req, res) => {
    const assignmentId = Number(req.params.id);

    const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
            teacherClassSubject: {
                include: {
                    class: true,
                    subject: true,
                    teacher: { include: { user: { select: { id: true, name: true, email: true } } } }
                }
            },
            submissions: {
                include: {
                    student: {
                        include: {
                            user: { select: { id: true, name: true, email: true, role: true } },
                            class: true
                        }
                    }
                }
            }
        }
    });

    if (!assignment) {
        throw new NotFoundError('Assignment not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        data: assignment
    });
};

// Update Assignment
const updateAssignment = async (req, res) => {
    const assignmentId = Number(req.params.id);
    const { title, description, dueDate } = req.body;

    const existingAssignment = await prisma.assignment.findUnique({
        where: { id: assignmentId }
    });

    if (!existingAssignment) {
        throw new NotFoundError('Assignment not found');
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (dueDate) updateData.dueDate = new Date(dueDate);

    const updatedAssignment = await prisma.assignment.update({
        where: { id: assignmentId },
        data: updateData,
        include: {
            teacherClassSubject: {
                include: {
                    class: true,
                    subject: true,
                    teacher: { include: { user: true } }
                }
            }
        }
    });

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Assignment updated successfully',
        data: updatedAssignment
    });
};

// Delete Assignment
const deleteAssignment = async (req, res) => {
    const assignmentId = Number(req.params.id);

    const existingAssignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { submissions: true }
    });

    if (!existingAssignment) {
        throw new NotFoundError('Assignment not found');
    }

    // Delete all submissions first
    await prisma.assignmentSubmission.deleteMany({
        where: { assignmentId }
    });

    // Delete the assignment
    await prisma.assignment.delete({
        where: { id: assignmentId }
    });

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Assignment and related submissions deleted successfully'
    });
};

// Get Assignments for a specific student
const getStudentAssignments = async (req, res) => {
    const studentId = Number(req.params.studentId);

    // Get student's class
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { class: true }
    });

    if (!student) {
        throw new NotFoundError('Student not found');
    }

    // Get all assignments for the student's class
    const assignments = await prisma.assignment.findMany({
        where: {
            teacherClassSubject: {
                classId: student.classId
            }
        },
        include: {
            teacherClassSubject: {
                include: {
                    class: true,
                    subject: true,
                    teacher: { include: { user: { select: { id: true, name: true, email: true } } } }
                }
            },
            submissions: {
                where: { studentId },
                include: {
                    student: {
                        include: {
                            user: { select: { id: true, name: true, email: true } }
                        }
                    }
                }
            }
        },
        orderBy: { dueDate: 'desc' }
    });

    res.status(StatusCodes.OK).json({
        success: true,
        count: assignments.length,
        data: assignments
    });
};

// ========== SUBMISSION CONTROLLERS ==========

// Submit Assignment
const submitAssignment = async (req, res) => {
    const { assignmentId, studentId, fileUrl, remarks } = req.body;

    if (!assignmentId || !studentId) {
        throw new BadRequestError('Assignment ID and Student ID are required');
    }

    // Check if assignment exists
    const assignment = await prisma.assignment.findUnique({
        where: { id: Number(assignmentId) }
    });

    if (!assignment) {
        throw new NotFoundError('Assignment not found');
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
        where: { id: Number(studentId) }
    });

    if (!student) {
        throw new NotFoundError('Student not found');
    }

    // Check if already submitted
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
        where: {
            assignmentId_studentId: {
                assignmentId: Number(assignmentId),
                studentId: Number(studentId)
            }
        }
    });

    if (existingSubmission) {
        throw new BadRequestError('Assignment already submitted by this student');
    }

    const submission = await prisma.assignmentSubmission.create({
        data: {
            assignmentId: Number(assignmentId),
            studentId: Number(studentId),
            fileUrl: fileUrl || null,
            remarks: remarks || null,
            status: 'SUBMITTED'
        },
        include: {
            assignment: {
                include: {
                    teacherClassSubject: {
                        include: { class: true, subject: true }
                    }
                }
            },
            student: {
                include: {
                    user: { select: { id: true, name: true, email: true } }
                }
            }
        }
    });

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Assignment submitted successfully',
        data: submission
    });
};

// Submit Assignment with File Upload
const submitAssignmentWithFile = async (req, res) => {
    const { assignmentId, studentId, remarks } = req.body;

    if (!assignmentId || !studentId) {
        throw new BadRequestError('Assignment ID and Student ID are required');
    }

    if (!req.file) {
        throw new BadRequestError('File is required for this endpoint');
    }

    // Check if assignment exists
    const assignment = await prisma.assignment.findUnique({
        where: { id: Number(assignmentId) }
    });

    if (!assignment) {
        throw new NotFoundError('Assignment not found');
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
        where: { id: Number(studentId) }
    });

    if (!student) {
        throw new NotFoundError('Student not found');
    }

    // Check if already submitted
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
        where: {
            assignmentId_studentId: {
                assignmentId: Number(assignmentId),
                studentId: Number(studentId)
            }
        }
    });

    if (existingSubmission) {
        throw new BadRequestError('Assignment already submitted by this student');
    }

    // Get file URL from uploaded file
    const fileUrl = req.file.path;

    const submission = await prisma.assignmentSubmission.create({
        data: {
            assignmentId: Number(assignmentId),
            studentId: Number(studentId),
            fileUrl: fileUrl,
            remarks: remarks || null,
            status: 'SUBMITTED'
        },
        include: {
            assignment: {
                include: {
                    teacherClassSubject: {
                        include: { class: true, subject: true }
                    }
                }
            },
            student: {
                include: {
                    user: { select: { id: true, name: true, email: true } }
                }
            }
        }
    });

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Assignment submitted successfully with file',
        data: submission
    });
};

// Get All Submissions (for teachers)
const getSubmissions = async (req, res) => {
    const { assignmentId, studentId, status } = req.query;

    const whereConditions = {};
    if (assignmentId) whereConditions.assignmentId = Number(assignmentId);
    if (studentId) whereConditions.studentId = Number(studentId);
    if (status) whereConditions.status = status;

    const submissions = await prisma.assignmentSubmission.findMany({
        where: whereConditions,
        include: {
            assignment: {
                include: {
                    teacherClassSubject: {
                        include: {
                            class: true,
                            subject: true,
                            teacher: { include: { user: { select: { id: true, name: true } } } }
                        }
                    }
                }
            },
            student: {
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    class: true
                }
            }
        },
        orderBy: { submittedAt: 'desc' }
    });

    res.status(StatusCodes.OK).json({
        success: true,
        count: submissions.length,
        data: submissions
    });
};

// Get Submission by ID
const getSubmissionById = async (req, res) => {
    const submissionId = Number(req.params.id);

    const submission = await prisma.assignmentSubmission.findUnique({
        where: { id: submissionId },
        include: {
            assignment: {
                include: {
                    teacherClassSubject: {
                        include: { class: true, subject: true, teacher: { include: { user: true } } }
                    }
                }
            },
            student: {
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    class: true
                }
            }
        }
    });

    if (!submission) {
        throw new NotFoundError('Submission not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        data: submission
    });
};

// Grade Assignment Submission
const gradeSubmission = async (req, res) => {
    const submissionId = Number(req.params.id);
    const { grade, remarks } = req.body;

    if (!grade) {
        throw new BadRequestError('Grade is required');
    }

    const existingSubmission = await prisma.assignmentSubmission.findUnique({
        where: { id: submissionId }
    });

    if (!existingSubmission) {
        throw new NotFoundError('Submission not found');
    }

    if (existingSubmission.status !== 'SUBMITTED') {
        throw new BadRequestError('Only submitted assignments can be graded');
    }

    const gradedSubmission = await prisma.assignmentSubmission.update({
        where: { id: submissionId },
        data: {
            grade,
            remarks: remarks || existingSubmission.remarks,
            status: 'GRADED'
        },
        include: {
            assignment: {
                include: {
                    teacherClassSubject: {
                        include: { class: true, subject: true }
                    }
                }
            },
            student: {
                include: {
                    user: { select: { id: true, name: true, email: true } }
                }
            }
        }
    });

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Assignment graded successfully',
        data: gradedSubmission
    });
};

// Update Submission (for students to resubmit)
const updateSubmission = async (req, res) => {
    const submissionId = Number(req.params.id);
    const { fileUrl, remarks } = req.body;

    const existingSubmission = await prisma.assignmentSubmission.findUnique({
        where: { id: submissionId }
    });

    if (!existingSubmission) {
        throw new NotFoundError('Submission not found');
    }

    if (existingSubmission.status === 'GRADED') {
        throw new BadRequestError('Cannot update a graded submission');
    }

    const updateData = {};
    if (fileUrl) updateData.fileUrl = fileUrl;
    if (remarks) updateData.remarks = remarks;
    updateData.status = 'SUBMITTED';

    const updatedSubmission = await prisma.assignmentSubmission.update({
        where: { id: submissionId },
        data: updateData,
        include: {
            assignment: true,
            student: {
                include: {
                    user: { select: { id: true, name: true, email: true } }
                }
            }
        }
    });

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Submission updated successfully',
        data: updatedSubmission
    });
};

// Delete Submission
const deleteSubmission = async (req, res) => {
    const submissionId = Number(req.params.id);

    const existingSubmission = await prisma.assignmentSubmission.findUnique({
        where: { id: submissionId }
    });

    if (!existingSubmission) {
        throw new NotFoundError('Submission not found');
    }

    await prisma.assignmentSubmission.delete({
        where: { id: submissionId }
    });

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Submission deleted successfully'
    });
};

// Get Assignment Statistics
const getAssignmentStats = async (req, res) => {
    const assignmentId = Number(req.params.assignmentId);

    const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
            teacherClassSubject: {
                include: { class: true }
            },
            submissions: true
        }
    });

    if (!assignment) {
        throw new NotFoundError('Assignment not found');
    }

    // Get total students in the class
    const totalStudents = await prisma.student.count({
        where: { classId: assignment.teacherClassSubject.classId }
    });

    const submittedCount = assignment.submissions.filter(s => s.status === 'SUBMITTED' || s.status === 'GRADED').length;
    const gradedCount = assignment.submissions.filter(s => s.status === 'GRADED').length;
    const pendingCount = totalStudents - submittedCount;

    const stats = {
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        dueDate: assignment.dueDate,
        class: assignment.teacherClassSubject.class.name,
        section: assignment.teacherClassSubject.class.section,
        totalStudents,
        submitted: submittedCount,
        graded: gradedCount,
        pending: pendingCount,
        submissionRate: totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0,
        gradingRate: submittedCount > 0 ? Math.round((gradedCount / submittedCount) * 100) : 0
    };

    res.status(StatusCodes.OK).json({
        success: true,
        data: stats
    });
};

module.exports = {
    // Assignment Controllers
    createAssignment,
    getAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment,
    getStudentAssignments,
    
    // Submission Controllers
    submitAssignment,
    submitAssignmentWithFile,
    getSubmissions,
    getSubmissionById,
    gradeSubmission,
    updateSubmission,
    deleteSubmission,
    getAssignmentStats
};
