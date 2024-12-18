import { model, Schema } from "mongoose";
import { Student } from "../../interfaces/Student";

export const studentsSchemas = new Schema<Student>({
    帳號: { type: String, required: true },
    座號: { type: Number, required: true },
    姓名: { type: String, required: true },
    院系: { type: String, required: true },
    年級: { type: String, required: true },
    班級: { type: String, required: true },
    Email: { type: String, required: true }
});

export const studentsModel = model<Student>('students', studentsSchemas);
