const express = require("express")
const router = express.Router()

const { authorizeAdmin } = require("../middlewares/roleMiddleware")

const { createClass, getClasses, getClassById, deleteClass, assignClassTeacher, assignStudentToClass } = require("../controllers/classControllers")

router.post("/", authorizeAdmin, createClass)
router.get("/", getClasses)
router.get("/:id", getClassById)
router.delete("/:id", authorizeAdmin, deleteClass)
router.post("/:id/teacher", authorizeAdmin, assignClassTeacher)
router.post("/:id/students", authorizeAdmin, assignStudentToClass)

module.exports = router