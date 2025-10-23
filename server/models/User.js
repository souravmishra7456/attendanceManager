import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Individual subject entry
const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
});

// Days structure (each day holds an array of subjects)
const daysSchema = new mongoose.Schema({
    Monday: [subjectSchema],
    Tuesday: [subjectSchema],
    Wednesday: [subjectSchema],
    Thursday: [subjectSchema],
    Friday: [subjectSchema],
    Saturday: [subjectSchema],
    Sunday: [subjectSchema],
}, { _id: false });

// Main user schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    days: {
        type: daysSchema,
        default: () => ({
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: []
        }),
    },
}, { timestamps: true });

// 🔒 Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 🔑 Compare password for login
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);
