const nodemailer = require("nodemailer");

var transpoter=nodemailer.createTransport({
    host:'smtp.gmail.com',
    port:587,
    secure:false,
    requireTLS:true,
    auth:{
        user:"tuser3977@gmail.com",
        pass:"ukil mpbx fgnc saxd"
    }
})

var mailopt={
    from:"tuser3977@gmail.com",
    to:"thkkjl@gmail.com",
    subject:"test subject",
    text:"hello kes ho"
}

transpoter.sendMail(mailopt,(err,info)=>{
    if(err){
        console.log(err)
    }
    else{
        console.log("sent successfully",info.response)
    }
})  