import { Service } from "../abstract/Service";
import { Student } from "../interfaces/Student";
import { logger } from "../middlewares/log";
import { studentsModel } from "../orm/schemas/studentSchemas";
import { Document } from "mongoose"
import { MongoDB } from "../utils/MongoDB";
import { DBResp } from "../interfaces/DBResp";
import { resp } from "../utils/resp";

type seatInfo = {
    schoolName: string,
    department: string,
    seatNumber: string
}

export class UserService extends Service {

    public async getAllStudents(): Promise<Array<DBResp<Student>> | undefined> {
        try {
            console.log('Starting getAllStudents query');
            const res: Array<DBResp<Student>> = await studentsModel.find({});
            console.log('資料筆數:', res.length);
            console.log('第一筆資料的格式:', res[0]);  // 只印出第一筆
            return res;
        } catch (error) {
            console.error('Error in getAllStudents:', error);
            return undefined;
        }
    }

    /**
 * 新增學生
 * @param info 學生資訊
 * @returns resp
 */
    public async insertOne(info: any): Promise<resp<DBResp<Student>|undefined>> {
        console.log("接收到的資料:", info);
        
        const resp: resp<DBResp<Student>|undefined> = {
            code: 200,
            message: "",
            body: undefined
        }
    
        try {
            // 檢查必要欄位
            const required = ['帳號', '姓名', '院系', '年級', '班級', 'Email'];
            for (const field of required) {
                if (!info[field]) {
                    resp.code = 400;
                    resp.message = `缺少 ${field} 欄位`;
                    return resp;
                }
            }
    
            // 取得最後一筆資料的座號
            const lastStudent = await studentsModel.findOne().sort({座號: -1});
            const nextNumber = lastStudent ? lastStudent.座號 + 1 : 1;
    
            // 建立新資料
            const studentData = {
                帳號: info.帳號,
                座號: nextNumber,
                姓名: info.姓名,
                院系: info.院系,
                年級: info.年級,
                班級: info.班級,
                Email: info.Email
            };
    
            const res = new studentsModel(studentData);
            resp.body = await res.save();
            resp.message = "新增成功";
    
        } catch (error) {
            console.error('新增失敗:', error);
            resp.code = 500;
            resp.message = "伺服器錯誤";
        }
    
        return resp;
    }

    /**
     * 學生名字驗證器
     * @param userName 學生名字
     * tku ee 0787
     * ee 科系縮寫
     *  0787 四碼
     * 座號檢查，跟之前有重複就噴錯  只能寫沒重複的號碼
     */
    public async userNameValidator(studentId: any): Promise<string> {
        if (!studentId || studentId.length < 7) {
            return '學生名字格式不正確，應為 tku + 科系縮寫 + 四碼座號，例如: tkubm1760';
        }

        const info = this.userNameFormator(studentId);

        if (info.schoolName !== 'tku') {
            return '校名必須為 tku';
        }

        // 驗證座號(正則不想寫可以給 gpt 寫, 記得測試就好)
        const seatNumberPattern = /^\d{4}$/; // 驗證4個數字

        if (!seatNumberPattern.test(info.seatNumber)) {
            return '座號格式不正確，必須為四位數字。';
        }

        if (await this.existingSeatNumbers(info.seatNumber)) {
            return '座號已存在'
        }

        return '驗證通過'

    }

    /**
     * 用戶名格式化
     * @param userName 用戶名
     * @returns seatInfo
     */
    public userNameFormator(studentId: string) {
        console.log('Processing studentId:', studentId); 
        const info: seatInfo = {
            schoolName: studentId.slice(0, 3),
            department: studentId.slice(3, studentId.length - 4),
            seatNumber: studentId.slice(-4)
        }
        return info
    }

    /**
     * 檢查用戶名是否存在
     * @param SeatNumber 
     * @returns boolean
     */
    public async existingSeatNumbers(seatNumber: string): Promise<boolean> {
        const students = await this.getAllStudents();
        let exist = false;
        if (students) {
            students.forEach((student: any) => {
                // 改用中文欄位名
                const info = this.userNameFormator(student['帳號']);
                if (info.seatNumber === seatNumber) {
                    exist = true;
                }
            });
        }
        return exist;
    }

    public async updateOne(sid: string, updateInfo: Partial<Student>): Promise<resp<DBResp<Student> | undefined>> {
        const resp: resp<DBResp<Student> | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };

        try {
            const result = await studentsModel.findOneAndUpdate(
                { sid: sid },
                { $set: updateInfo },
                { new: true }
            );

            if (result) {
                resp.body = result;
                resp.message = "update success";
            } else {
                resp.code = 404;
                resp.message = "student not found";
            }
        } catch (error) {
            console.error('Error in updateOne:', error);
            resp.code = 500;
            resp.message = "server error";
        }

        return resp;
    }

    public async getStudentsByField(field: string, value: string): Promise<Array<DBResp<Student>> | null> {
        try {
            const query = { [field]: value };
            const students = await studentsModel.find(query);
            if (students.length > 0) {
                return students;
            } else {
                return null;
            }
        } catch (error) {
            console.error(`Error in getStudentsByField (field: ${field}, value: ${value}):`, error);
            return null;
        }
    }

    public async updateStudentById(id: string, updateData: Partial<Student>): Promise<DBResp<Student> | null> {
        try {
            const student = await studentsModel.findByIdAndUpdate(id, updateData, { new: true });
            if (student) {
                return student;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error in updateStudentById:', error);
            return null;
        }
    }

    public async deleteStudentById(id: string): Promise<resp<DBResp<Student> | undefined>> {
        const resp: resp<DBResp<Student> | undefined> = {
            code: 200,
            message: "",
            body: undefined
        };
    
        try {
            const deletedStudent = await studentsModel.findByIdAndDelete(id);
    
            if (deletedStudent) {
                resp.message = "Student deleted successfully";
                resp.body = deletedStudent;
            } else {
                resp.code = 404;
                resp.message = "Student not found";
            }
        } catch (error) {
            console.error('Error in deleteStudentById:', error);
            resp.code = 500;
            resp.message = "Server error during deletion";
        }
    
        return resp;
    }

}