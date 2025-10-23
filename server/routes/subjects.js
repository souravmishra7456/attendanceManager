import express from "express";
import Subject from "../models/Subject.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all subjects for logged-in user
router.get("/", protect, async (req, res) => {
    try {
        const subjects = await Subject.find({ user: req.user._id });
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST: Add new subject
router.post("/", protect, async (req, res) => {
    const { name, timetable } = req.body;

    try {
        // Fetch all existing subjects of the user
        const existingSubjects = await Subject.find({ user: req.user._id });

        // Check for conflicts
        for (const newSlot of timetable) {
            for (const subject of existingSubjects) {
                for (const slot of subject.timetable) {
                    if (
                        slot.day === newSlot.day &&
                        !(
                            newSlot.endTime <= slot.startTime ||
                            newSlot.startTime >= slot.endTime
                        )
                    ) {
                        return res
                            .status(400)
                            .json({ message: `Time conflict with subject "${subject.name}" on ${slot.day}` });
                    }
                }
            }
        }

        // No conflicts, create subject
        const newSubject = new Subject({
            name,
            timetable,
            user: req.user._id,
        });
        const savedSubject = await newSubject.save();
        res.status(201).json(savedSubject);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// PUT: Update subject
router.put("/:id", protect, async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) return res.status(404).json({ message: "Subject not found" });
        if (subject.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: "Not authorized" });

        subject.name = req.body.name || subject.name;
        subject.timetable = req.body.timetable || subject.timetable;

        const updatedSubject = await subject.save();
        res.json(updatedSubject);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE: Remove subject
router.delete("/:id", protect, async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) return res.status(404).json({ message: "Subject not found" });
        if (subject.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: "Not authorized" });

        await subject.remove();
        res.json({ message: "Subject removed" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
