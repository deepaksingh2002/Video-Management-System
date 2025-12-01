import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { cloudnaryUpload } from "../utils/cloudnary.js";
import { Video } from "../moduls/video.models.js";
import { User } from "../moduls/user.models.js"


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
    res.status(200).json(new ApiResponse(200,{
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
    const newVideo = await Video.create({
        title,
        description,
        videoUrl,
        user: userId
    })
    res.status(201).json(new ApiResponse(200, newVideo, "Video published successfully"))
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})


export {getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus}