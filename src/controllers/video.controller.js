import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { cloudnaryUpload, cloudnaryDelete } from "../utils/cloudnary.js";
import { Video } from "../moduls/video.models.js";
import { User } from "../moduls/user.models.js"
import mongoose from "mongoose";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);

    const filter = {}
    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ]
    }
    if (userId) {
        filter.user = userId
    }
    const sort = {}
    if (sortBy) {
        sort[sortBy] = sortType === 'desc' ? -1 : 1
    } else {
        sort.createdAt = -1
    }
    const videos = await Video.find(filter)
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('user', 'name email avatarUrl')
        .lean()
    const totalVideos = await Video.countDocuments(filter)
    const totalPages = Math.ceil(totalVideos / limitNum)    
     return res.status(200).json(new ApiResponse(200,{
        videos,
        pagination: {
            totalVideos,
            totalPages,
            currentPage: parseInt(page),
            pageSize: parseInt(limit)
        }
    },"Videos fetched successfully"))
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!req.file) {
        throw new ApiError(400, "Video file is required")
    }
    const userId = req.user._id
    const user =  await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const videoUrl = await cloudnaryUpload(req.file.path, 'video')
    const thumbnailUrl 
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailUrl = await cloudnaryUpload(req.files.thumbnail[0].path)
    } 
    const newVideo = await Video.create({
        title,
        description,
        videoUrl,
        thumbnailUrl,   
        user: userId
    })
    return res.status(201).json(new ApiResponse(200, newVideo, "Video published successfully"))
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }
    const video = await Video.findById(videoId)
        .populate('user', "name email avatarUrl")
    if (!video){
        throw new ApiError(404, "Video not found")
    }
    return res.status(200).json(new ApiResponse(200, video, "video fetched successfully"))
})

export const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Fetch video first (needed for old thumbnail deletion)
    const existingVideo = await Video.findById(videoId);
    if (!existingVideo) {
        throw new ApiError(404, "Video not found");
    }

    let thumbnailUrl;

    // Handle new thumbnail upload
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailUrl = await cloudnaryUpload(req.files.thumbnail[0].path, "thumbnail");

        // delete old thumbnail only if new one uploaded
        if (existingVideo.thumbnailUrl) {
            await cloudnaryDelete(existingVideo.thumbnailUrl);
        }
    }

    // Update video fields
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                ...(title && { title }),
                ...(description && { description }),
                ...(thumbnailUrl && { thumbnailUrl })
            }
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    );
});


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "video not found")
    }
    await video.remove()
    res.status(200).json(new ApiResponse(200, null, "video deleted successfully"))  
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    video.isPublished = !video.isPublished
    await video.save()
    return res.status(200).json(new ApiResponse(200, video, `Video ${video.isPublished ? 'published' : 'unpublished'} successfully`))

})


export {getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus}