
const { Upload } = require('@aws-sdk/lib-storage');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3 = require('../utils/s3');



const uploadMedia=async(req,res)=>{
    try {
        const file=req.file;
        if(!file){
            return res.status(400).json({
                message:'Please select file'
            });
        }

            const fileKey=`media/${Date.now()}-${file.originalname}`;

            const uploadToS3 = new Upload({
            client: s3,
            params: {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fileKey,
                Body: file.buffer,
                ContentType: file.mimetype
            }
            });
            await uploadToS3.done();

        res.status(200).json({
            message: 'Media uploaded successfully',
            key: fileKey,
            mediaType: file.mimetype
        
        });
        
        
    } catch (error) {
        console.error('Media upload error:', error);

        res.status(500).json({
            message: 'Failed to upload media'
        });
        
    }

}
const getMediaUrl = async (req, res) => {
    try {
        const { key } = req.query;

        if (!key || !key.startsWith('media/')) {
            return res.status(400).json({ message: 'Invalid media key' });
        }

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        });

        const url = await getSignedUrl(s3, command, {
            expiresIn: 3600
        });

        res.status(200).json({ url });

    } catch (error) {
        console.error('Get media URL error:', error);
        res.status(500).json({ message: 'Failed to generate media URL' });
    }
};
module.exports={
    uploadMedia,
    getMediaUrl
};