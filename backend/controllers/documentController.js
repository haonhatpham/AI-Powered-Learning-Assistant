import { constants } from 'buffer';
import Document from '../models/Document.js'
import Flashcard from '../models/Flashcard.js'
import Quiz from '../models/Quiz.js'
import { extractTextFromPDFBuffer } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';

const uploadPdfToCloudinary = async (buffer, originalName) => {
    const publicIdBase = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileBaseName = (originalName || 'document').replace(/\.[^/.]+$/, '');
    const public_id = `${publicIdBase}-${fileBaseName}`.slice(0, 200);

    return await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                // Upload PDF as an "image" asset so Cloudinary delivers it inline (previewable in iframe)
                resource_type: 'image',
                type: 'upload',
                // Some Cloudinary accounts/folders may enforce access control; force public delivery
                access_mode: 'public',
                delivery_type: 'upload',
                folder: 'ai-learning-assistant/documents',
                public_id,
                use_filename: false,
                unique_filename: false,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(buffer);
    });
};

//@desc Upload a document
//@route POST /api/documents/upload
//@access Private
export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                error: 'Please upload a PDF file',
                statusCode: 400
            });
        }
        if (!req.file.buffer) {
            return res.status(400).json({
                success: false,
                error: 'Invalid upload. Please try again.',
                statusCode: 400,
            });
        }
        const {title} = req.body;
        if(!title) {
            return res.status(400).json({ 
                success: false,
                error: 'Please provide a title for the document',
                statusCode: 400
            });
        }

        // Upload to Cloudinary (no local disk)
        const uploaded = await uploadPdfToCloudinary(req.file.buffer, req.file.originalname);
        const fileUrl = uploaded.secure_url || uploaded.url;

        //Create document record
        const document = await Document.create({    
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: fileUrl, //Store the URL instead of the local path
            cloudinaryPublicId: uploaded.public_id || '',
            fileSize: req.file.size,
            status: "processing"
        });
        //Process PDF in background (in production, consider using a job queue like Bull)
        processPDF(document._id, req.file.buffer).catch((err) => {
            console.error('Error processing PDF:', err);
        });

        res.status(201).json({
            success: true,
            data: document,
            message: 'Document uploaded successfully, processing in background',
        });
    } catch (error) {
        next(error);
    }   
};

//Helper function to process PDF
const processPDF = async (documentId, fileBuffer) => {
    try {
        const {text } = await extractTextFromPDFBuffer(fileBuffer);

        //Create chunks
        const chunks = chunkText(text, 500, 50); 

        //Update document
        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks: chunks,
            status: 'ready',
        });
        console.log(`Document ${documentId} processed successfully`);
    } catch (error) {
        console.error(`Error processing document ${documentId}:`, error);
        await Document.findByIdAndUpdate(documentId,{
             status: 'error'
        });
    }
};


//@desc Get all documents 
//@route GET /api/documents
//@access Private
export const getDocuments = async (req, res, next) => {
    try {
       const documents =await Document.aggregate([
        {
            $match: {userId: new mongoose.Types.ObjectId(req.user._id)}
        },
        {
            $lookup:{
                from: 'flashcards',
                localField: '_id',
                foreignField: 'documentId',
                as: 'flashcardSets'
            }
        },
        {
            $lookup:{
                from: 'quizzes',
                localField:'_id',
                foreignField:'documentId',
                as:'quizzes'
            }
        },
        {
            $addFields: {
                flashcardCount: {$size: '$flashcardSets'},
                quizCount: {$size: '$quizzes'}
            }
        },
        {
            $project: {
                extractedText:0,
                chunks:0,
                flashcardSets:0,
                quizzes:0
            }
        },
        {
            $sort:{uploadDate: -1}
        }
       ]);
       
       res.status(200).json({
        success: true,
        count: documents.length,
        data: documents
       });
    }
    catch (error) {
        next(error);
    }   
};

//@desc Get a single document
//@route GET /api/documents/:id
//@access Private
export const getDocument = async (req, res, next) => {
    try {
       const document = await Document.findOne({
        _id: req.params.id,
        userId:  req.user._id
       });

       if (!document){
        return res.status(404).json({
            success:false,
            error:'Document not found',
            statusCode: 404
        })
       }

       //Get counts of associated flashcards and quizzes
       const flashcardCount = await Flashcard.countDocuments({ documentId: document._id, userId: req.user._id});
       const quizCount = await Quiz.countDocuments({ documentId: document._id, userId: req.user._id})

       //Update last accessed
       document.lastAccessed = Date.now();
       await document.save();

       //Combine document data with counts
       const documentData= document.toObject();
       documentData.flashcardCount=flashcardCount;
       documentData.quizCount = quizCount;

       res.status(200).json({
        success:true,
        data: documentData
       });
    }
    catch (error) {
   
        next(error);
    }   
};

//@desc Delete a document
//@route DELETE /api/documents/:id
//@access Private   

export const deleteDocument = async (req, res, next) => {
    try {
       const document = await Document.findOne({
        _id: req.params.id,
        userId: req.user._id
       });

       if (!document){
        return res.status(404).json({
            success:false,
            error:'Document not found',
            statusCode: 404
        })
       }

       //Delete from Cloudinary if present
       if (document.cloudinaryPublicId) {
        await cloudinary.uploader
            .destroy(document.cloudinaryPublicId, { resource_type: 'image' })
            .catch(() => {});
       }

       //Delete document
       await document.deleteOne();

       res.status(200).json({
        success: true,
        message: 'Document deleted successfully'
       });
    }
    catch (error) {
        next(error);
    }   
};