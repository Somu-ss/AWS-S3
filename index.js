const express = require('express')
const multer = require('multer');
const aws = require('aws-sdk')
const { imageUpload, listImage, readImage, deleteImage } = require('./awsService');
require("dotenv").config();

const app = express()

aws.config.update({
    secretAccessKey: process.env.ACCESS_SECRET,
    accessKeyId: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    // Note: 'bucket' is not a valid AWS SDK configuration property
});

const storage = multer.memoryStorage()

const imageFilter = (req,file,cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      }else {
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false)
    }
}

const upload = multer({
    storage,
    fileFilter: imageFilter,
  });

 app.post("/upload", upload.array("file"), async (req, res) => {
    try {
      const results = await imageUpload(req.files);
      return res.status(201).json(results)
    } catch (error) {
        if (error instanceof multer.MulterError) {
            if (error.code === "LIMIT_FILE_SIZE") {
              return res.status(400).json({
                message: "file is too large",
              });
            }
        
            else if (error.code === "LIMIT_FILE_COUNT") {
              return res.status(400).json({
                message: "File limit reached",
              });
            }
        
            else if (error.code === "LIMIT_UNEXPECTED_FILE") {
              return res.status(400).json({
                message: "File must be an image",
              });
            }
          }else {
             return res.status(400).json({message : "Something went wrong"})
          }
    }
  });

app.get("/list_Images", async (req,res)=> {
    try{
        const result = await listImage()
        console.log(result);
        return res.status(200).json(result);
    }catch(e){
        console.log(e);
    }
})

app.get("/download/:filename", async (req, res) => {
    const filename = req.params.filename;

    if (!filename) {
        return res
          .status(400)
          .json({ message: 'Filaname is Required in the Parameter' })
      }
    try {
        const results = await readImage(filename)
        res.status(203).json(results)
    } catch (e) {
        console.log(e, 'file');
    }


})

app.delete("/delete/:filename", async (req, res) => {
    const filename = req.params.filename;
    if (!req.params.filename) {
        return res
          .status(400)
          .json({ message: 'Filaname is Required in the Parameter' })
      }
    console.log(filename);
    try {
        const results = await deleteImage(filename)
        res.status(203).json({message: 'Image Deleted Successfully'})
    } catch (e) {
        console.log(e, 'Error Occured While Deleting Image');
    }


})

app.listen(4000, () => {
    console.log('the port is runnig 4000');
})
