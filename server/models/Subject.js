import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    timetable: [
        {
            day: {
                type: String,
                enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                required: true
            },
            startTime: { type: String, required: true }, // "09:00"
            endTime: { type: String, required: true }    // "10:00"
        }
    ]
}, { timestamps: true });

export default mongoose.models.Subject || mongoose.model("Subject", subjectSchema);
