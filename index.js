const express = require("express");
const fs = require("fs").promises;
const app = express();
const gradesRouter = require("./routes/grades.js");
const winston = require("winston");

global.fileName = "grades.json";

const {combine,timestamp,label,printf}=winston.format;
const myFormat = printf(({level,message,label,timestamp})=>{
    return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
    level:"silly",
    transports:[
        new (winston.transports.Console)(),
        new (winston.transports.File)({filename:"grades-api.log"})
    ],
    format: combine(
        label({label:"grades-api"}),
        timestamp(),
        myFormat
    )
});

app.use(express.json());
app.use("/grade",gradesRouter);

app.listen(3030,async ()=> {
    try{
        await fs.readFile(global.fileName,"utf8");
        logger.info("API Started!");
    }catch(err){
        const initialJson={
            nextId:1,
            grades:[]
        };
        fs.writeFile(global.fileName,JSON.stringify(initialJson),err=>{
            logger.error(err);
        })
    }
});

