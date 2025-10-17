const express = require("express")
const router = express.Router()

const authorize = require("../middlewares/roleMiddleware")

const { createClass, getClasses, getClassById, deleteClass, assignClassTeacher, assignStudentToClass, getStudentClass } = require("../controllers/classControllers")

router.post("/", authorize('ADMIN'), createClass)
router.get("/", getClasses)
router.get("/:id", getClassById)
router.delete("/:id", authorize('ADMIN'), deleteClass)
router.post("/:id/teacher", authorize('ADMIN'), assignClassTeacher)
router.post("/:id/students", authorize('ADMIN'), assignStudentToClass)
router.get("/me", getStudentClass)

module.exports = router