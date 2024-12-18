import { Contorller } from "../abstract/Contorller";
import { Request, response, Response } from "express";
import { UserService } from "../Service/UserService";
import { resp } from "../utils/resp";
import { DBResp } from "../interfaces/DBResp";
import { Student } from "../interfaces/Student";
require('dotenv').config()

export class UserController extends Contorller {
    protected service: UserService;

    constructor() {
        super();
        this.service = new UserService();
    }

    public async findAll(Request: Request, Response: Response) {

        const res: resp<Array<DBResp<Student>> | undefined> = {
            code: 200,
            message: "",
            body: undefined
        }

        const dbResp = await this.service.getAllStudents();
        if (dbResp) {
            res.body = dbResp;
            res.message = "find sucess";
            Response.send(res);
        } else {
            res.code = 500;
            res.message = "server error";
            Response.status(500).send(res);
        }

    }

    public async insertOne(Request: Request, Response: Response) {
        console.log("UserController - insertOne - Request.body:", Request.body);
        const resp = await this.service.insertOne(Request.body);
        Response.status(resp.code).send(resp);
    }

    public async updateOne(Request: Request, Response: Response) {
        const { sid } = Request.params;
        const updateInfo = Request.body;
        const resp = await this.service.updateOne(sid, updateInfo);
        Response.status(resp.code).send(resp);
    }

    public async getByField(Request: Request, Response: Response) {
        const field = Request.params.field;
        const value = Request.params.value;
        const resp: resp<Array<DBResp<Student>> | null> = {
            code: 200,
            message: '',
            body: null
        };
    
        const students = await this.service.getStudentsByField(field, value);
        if (students) {
            resp.body = students;
            resp.message = 'Students found';
        } else {
            resp.code = 404;
            resp.message = 'No students found';
        }
    
        Response.status(resp.code).send(resp);
    }

    public async updateStudent(Request: Request, Response: Response) {
        const id = Request.params.id;
        const updateData = Request.body;
        const resp: resp<DBResp<Student> | null> = {
            code: 200,
            message: '',
            body: null
        };
    
        const student = await this.service.updateStudentById(id, updateData);
        if (student) {
            resp.body = student;
            resp.message = 'Student updated successfully';
        } else {
            resp.code = 404;
            resp.message = 'Student not found';
        }
    
        Response.status(resp.code).send(resp);
    }

    public async deleteStudent(Request: Request, Response: Response) {
        const id = Request.params.id;
        const resp: resp<DBResp<Student> | undefined> = await this.service.deleteStudentById(id);
        Response.status(resp.code).send(resp);
    }


}