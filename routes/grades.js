var express=require("express");
var router=express.Router();
var fs=require("fs").promises;

router.post("/",async (req,res)=>{
    let grade=req.body;
    try{
        let data=await fs.readFile(global.fileName,"utf8");
        let json=JSON.parse(data);

        grade={id:json.nextId++,...grade,timestamp:new Date()};
        json.grades.push(grade);

        await fs.writeFile(global.fileName,JSON.stringify(json));
        res.end();

        logger.info(`POST /grade - ${JSON.stringify(grade)}`);
    }catch(err){
        res.status(400).send({error:err.message});
        logger.error(`POST /grade - ${err.message}`);
    }
});

router.get("/",async (_,res)=>{
    try{
        let data=await fs.readFile(global.fileName,"utf8");
        let json=JSON.parse(data);
        delete json.nextId;
        res.send(json);
        logger.info("GET /grade");
    }catch(err){
        res.status(400).send({error:err.message});
        logger.error(`GET /grade - ${err.message}`);
    }
});

router.get("/:id", async(req,res)=>{
    try{
        let data = await fs.readFile(global.fileName,"utf8");
        let json=JSON.parse(data);
        const grade=json.grades.find(grade=>grade.id===parseInt(req.params.id,10));
        if(grade){
            res.send(grade);
            logger.info(`GET /grade/:id - ${JSON.stringify(grade)}`);
        }else{
            res.status(404).end();
        }
    }catch(err){
        res.status(400).send({error:err.message});
        logger.error(`GET /grade/:id - ${err.message}`);
    }
});

router.delete("/:id",async (req,res)=>{
    try{
        let data=await fs.readFile(global.fileName,"utf8");
        let json=JSON.parse(data);

        let grades=json.grades.filter(grade=>grade.id!==parseInt(req.params.id,10));
        json.grades=grades;

        await fs.writeFile(global.fileName,JSON.stringify(json));
        res.end();

        logger.info(`DELETE /grade/:id - ${req.params.id}`);
    }catch(err){
        res.status(400).send({error:err.message});
        logger.error(`DELETE /grade/:id - ${err.message}`);
    }
});

router.put("/", async (req,res)=>{
    try{
        let newGrade = req.body;
        let data = await fs.readFile(global.fileName,"utf8");
        let json=JSON.parse(data);
        
        let oldIndex=json.grades.findIndex(grade=>grade.id===newGrade.id);
        if(oldIndex>0){
            json.grades[oldIndex].student=newGrade.student;
            json.grades[oldIndex].subject=newGrade.subject;
            json.grades[oldIndex].type=newGrade.type;
            json.grades[oldIndex].value=newGrade.value;
            json.grades[oldIndex].timestamp=new Date();
        }else{
            res.status(404).end();
            logger.error(`PUT /grade/:id - ${err.message}`);
        }
       
        await fs.writeFile(global.fileName,JSON.stringify(json));
        res.send(json.grades[oldIndex]);
        logger.info(`PUT /grade - ${JSON.stringify(newGrade)}`);
    }catch(err){
        res.status(400).send({error:err.message});
        logger.error(`PUT /grade - ${err.message}`);
    }
});

router.post("/total",async (req,res)=>{
    try{
        let studentData=req.body;
        let data=await fs.readFile(global.fileName,"utf8");
        let json=JSON.parse(data);
      
        let grades=json.grades.filter(grade=>studentData.student===grade.student && studentData.subject===grade.subject);
        console.log(grades);
       
        let sumGrades=grades.reduce((accumulator,currentItem)=>{
            return accumulator + currentItem.value;
        },0);
        
        res.status(200).send({
            student: studentData.student,
            subject: studentData.subject,
            totalNotas:sumGrades
        });

        logger.info(`POST /total - Soma é ${sumGrades}`);
    }catch(err){
        res.status(400).send({error:err.message});
        logger.error(`POST /total - ${err.message}`);
    }
});

router.post("/averagegrade",async (req,res)=>{
    try{
        let input=req.body;
        let data=await fs.readFile(global.fileName,"utf8");
        let json=JSON.parse(data);

        let dataAverage=json.grades.filter(grade=>grade.subject===input.subject && grade.type===input.type);
        let sumGrades=dataAverage.reduce((accumulator,currentItem)=>{
            return accumulator+currentItem.value;
        },0);

        let average=sumGrades/dataAverage.length;

        res.status(200).send({
            subject:input.subject,
            type:input.type,
            average:average
        })

        logger.info(`POST /averagegrade - Média é ${average}`);
    }catch(err){
        res.status(400).send({error:err.message});
        logger.error(`POST /averagegrade - ${err.message}`);
    }
});

router.post("/bestgrades",async (req,res)=>{
    try{
        let input=req.body;
        let data=await fs.readFile(global.fileName,"utf8");
        let json=JSON.parse(data);

        let filteredData=json.grades.filter(grade=>grade.subject===input.subject && grade.type===input.type);
        
        let orderedGrades=filteredData.sort((a,b)=>{
            if(a.value<b.value) return 1;
            else if (a.value>b.value) return -1;
            else return 0;
        });

        console.log(orderedGrades);       

        res.status(200).send(orderedGrades.slice(0,3));

        logger.info(`POST /bestgrade - Melhores notas foram impressas`);
    }catch(err){
        res.status(400).send({error:err.message});
        logger.error(`POST /bestgrade - ${err.message}`);
    }
});

module.exports=router;
