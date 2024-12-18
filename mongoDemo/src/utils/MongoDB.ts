import { Schema, model, connect, Mongoose } from 'mongoose';
import { logger } from '../middlewares/log';
import { MongoInfo } from '../interfaces/MongoInfo';
export class MongoDB {
    
    DB: Mongoose | void | undefined
    isConneted : boolean = false;

    constructor(info: MongoInfo) {
        // 無密碼的連接字串
        const url = `mongodb://${info.host}:${info.port}/${info.dbName}`;
        console.log('Attempting to connect to MongoDB at:', url); // 新增
    
        this.init(url).then(() => {
            console.log('MongoDB connection successful'); // 新增
            logger.info(`success: connect to mongoDB @${url}`);
            this.isConneted = true;
        }).catch((error) => {
            console.error('MongoDB connection error:', error); // 新增
            logger.error(`error: cannot connect to mongoDB @${url}: ${error}`);
        });
    }
    
    async init(url: string) {
        try {
            this.DB = await connect(url);
            return this.DB;
        } catch (error) {
            console.error('MongoDB init error:', error); // 新增
            logger.error(`MongoDB init error: ${error}`);
            throw error;
        }
    }

    getState():boolean{
        return this.isConneted;
    }
}

