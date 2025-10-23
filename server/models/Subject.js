import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
});

const timetableSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    days: {
        Monday: [subjectSchema],
        Tuesday: [subjectSchema],
        Wednesday: [subjectSchema],
        Thursday: [subjectSchema],
        Friday: [subjectSchema],
        Saturday: [subjectSchema],
        Sunday: [subjectSchema],
    },
});

export default mongoose.model("Subject", timetableSchema);
