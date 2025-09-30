// Business logic: Timetable
import Timetable from '../models/timetableModel.js';

// Create a new timetable entry
export const createTimetableEntry = async (req, res) => {
    try {
        const { classId, subjectId, teacherId, day, startTime, endTime } = req.body;
        const newEntry = new Timetable({ classId, subjectId, teacherId, day, startTime, endTime });
        await newEntry.save();
        res.status(201).json(newEntry);
    } catch (error) {
        res.status(500).json({ message: 'Error creating timetable entry', error });
    }
};

// Get all timetable entries
export const getTimetableEntries = async (req, res) => {
    try {
        const entries = await Timetable.find().populate('classId subjectId teacherId');
        res.status(200).json(entries);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching timetable entries', error });
    }
};