const express = require("express")
const router = express.Router()

const authorize = require("../middlewares/roleMiddleware")

const { createClass, getClasses, getClassById, deleteClass, assignClassTeacher, assignStudentToClass, getStudentClass, updateClass, getTeacherClasses } = require("../controllers/classControllers")

router.post("/", authorize('ADMIN'), createClass)
router.get("/", getClasses)
// user-specific endpoints first
router.get("/me", getStudentClass)
router.get('/me/teacher', authorize('TEACHER'), getTeacherClasses)
// then dynamic id-based routes
router.get("/:id", getClassById)
router.delete("/:id", authorize('ADMIN'), deleteClass)
router.patch('/:id', authorize('ADMIN'), updateClass)
router.post("/:id/teacher", authorize('ADMIN'), assignClassTeacher)
router.post("/:id/students", authorize('ADMIN'), assignStudentToClass)

module.exports = router