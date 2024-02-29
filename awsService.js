const {S3} = require("aws-sdk")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require('fs');
const { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

exports.imageUpload = async (files) => {
    const s3client = new S3Client();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
  
    const params = files.map((file) => {
      return {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${uniqueSuffix}-${file.originalname}`,
        Body: file.buffer,
        ContentType: 'image/jpeg'
      };
    });
  
    return await Promise.all(
      params.map((param) => s3client.send(new PutObjectCommand(param)))
    );
  };

  exports.listImage = async () => {
    const s3client = new S3Client({region: process.env.AWS_REGION});
    
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: "/upload",
        
    }

    const getcommand = await s3client.send(new ListObjectsV2Command(params))
    const imageNames = getcommand.Contents.map(object => object.Key);
    return imageNames
  }
  

  exports.readImage = async(image) => {
    const s3client = new S3Client({region: process.env.AWS_REGION});

    const params = {       
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `uploads/${image}`, 
    };
    
    const command = new GetObjectCommand(params);

    const signedUrl = await getSignedUrl(s3client, command, { expiresIn: 36000 });
    return signedUrl;

  }
  
  exports.deleteImage = async(image) => {
    const s3client = new S3Client({region: process.env.AWS_REGION});

    const params = {       
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${image}`, 
    }
  const command = new DeleteObjectCommand(params);

  return await s3client.send(command);

  }
