import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET full timetable for the logged-in user
 */
router.get("/", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user.days);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * GET subjects for a specific day
 */
router.get("/:day", protect, async (req, res) => {
    const day = req.params.day;
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ [day]: user.days[day] || [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * POST: Add new subject for a specific day
 */
router.post("/:day", protect, async (req, res) => {
    const day = req.params.day;
    const { name, startTime, endTime } = req.body;

    try {
        // Validate time range
        if (!startTime || !endTime || startTime >= endTime) {
            return res.status(400).json({
                message: "Invalid time range — endTime must be greater than startTime",
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const daySubjects = user.days[day] || [];

        // Conflict check
        const conflict = daySubjects.find(
            (slot) =>
                !(
                    endTime <= slot.startTime ||
                    startTime >= slot.endTime
                )
        );

        if (conflict) {
            return res
                .status(400)
                .json({ message: `Time conflict with "${conflict.name}" on ${day}` });
        }

        // Add new subject
        daySubjects.push({ name, startTime, endTime });
        user.days[day] = daySubjects;

        await user.save();
        res.status(201).json(user.days[day]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * PUT: Update a subject for a specific day (by index)
 */
router.put("/:day/:index", protect, async (req, res) => {
    const day = req.params.day;
    const index = parseInt(req.params.index);
    const { name, startTime, endTime } = req.body;

    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.days[day] || !user.days[day][index]) {
            return res.status(404).json({ message: "Subject not found for that day" });
        }

        // Validate time range
        if (startTime && endTime && startTime >= endTime) {
            return res.status(400).json({
                message: "Invalid time range — endTime must be greater than startTime",
            });
        }

        const subject = user.days[day][index];
        subject.name = name || subject.name;
        subject.startTime = startTime || subject.startTime;
        subject.endTime = endTime || subject.endTime;

        await user.save();
        res.json(user.days[day]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * DELETE: Remove subject for a specific day
 */
router.delete("/:day/:index", protect, async (req, res) => {
    const day = req.params.day;
    const index = parseInt(req.params.index);

    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.days[day] || !user.days[day][index]) {
            return res.status(404).json({ message: "Subject not found for that day" });
        }

        user.days[day].splice(index, 1);
        await user.save();

        res.json({ message: `Subject removed from ${day}`, timetable: user.days[day] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
