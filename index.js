const express = require("express");
const app = express();
const fs = require("fs")
const path = require("path");
const multer = require("multer");
const Jimp = require('jimp');
app.set('view engine',"ejs")
app.use(express.static("public"))

app.get('/',(req,resp)=>{
    console.log("entering into home rout",req.get("user-agent"))
    resp.render("home")
})
app.get("/google",(req,resp)=>{
    resp.render("index")
})
const storage = multer.diskStorage({
    destination: './public/images', // Save files in "uploads" folder
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });
/////////////////////upload/////////////////////
app.post('/upload',upload.array("images",10),async (req,resp)=>{
    console.log("entering into upload")
    if (!req.files || req.files.length === 0) {
        return resp.status(400).json({ error: "No files uploaded" });
    }
const filename = req.files[0].filename;
let images = [];
const filepath = path.join(__dirname,"public/images",filename);
const output = path.join(__dirname,"public/images","edited-"+filename)

try{
   const image = await Jimp.read(filepath);
   image.resize(300,Jimp.AUTO).quality(80).greyscale().write(output);
   images.push(`images/edited-${filename}`);
   

resp.status(200).json(images)


}catch(error){
    console.log(error ,"error in editing the file upload api")
    
resp.status(200).json({message:"file upload successfully",file:req.files.filename})

}



})

////////////////delete/////////////////////
app.post("/delete",(req,resp)=>{
  const dir = "./public/images";
  try{
    fs.readdir(dir,(err,files)=>{
        if(err){
            console.log(err)
            resp.status(400).send({message:"error in deleteing"})
        }else{
       files.forEach((file)=>{
        const filep = path.join(dir,file);
        fs.unlink(filep,(err)=>{
            if(err){
                console.log(err,"err in unlink")
            }else{
                console.log("sucessfully deleted all the images")
            }
        })
       })
        }
    })

  }catch(e){

  }
})

///////////////////admin//////////////////
app.get("/admin",(req,resp)=>{
    resp.render("admin")
})
app.post("/adminimg",(req,resp)=>{
    console.log("entering into admin route");
    fs.readdir("./public/images",(err,files)=>{
        console.log(files,"this is files")
        if(!files || err){
            resp.status(400).send("no data")
        } else{
            resp.status(200).send(files)
        }
    })

})

 // Add `.default` here

 async function edit(pat){
    const pa = "./public/images";
    Jimp.read(`${pat}`).then(image => {
        const width = image.bitmap.width;
        const height = image.bitmap.height;
    
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const color = Jimp.intToRGBA(image.getPixelColor(x, y)); // Get pixel color
    
                // Check if the pixel is black (RGB: 0,0,0)
                if (color.red >= 200 || color.g >= 200  || color.b >= 200 ) {
                   
                    // Change black pixel to yellow (RGB: 255, 255, 0)
                    const yellowColor = Jimp.rgbaToInt(243,234,215, 1); // Maintain the original alpha
                    image.setPixelColor(yellowColor, x, y);
                }
    
            }
        }
    
        // Save the modified image
        image.write('public/images/outp.png', () => {
            console.log('All black pixels changed to yellow and saved as output.png');
        });
    }).catch(err => {
        console.error('Error:', err);
    });
 }


app.listen("4300",'0.0.0.0',()=>{
    console.log("listening on port 3000")

})