const {
  createVideo,
  getVideos,
  getFollowingFeed,
  getTrendingFeed,
  updateVideo,
  deleteVideo,
} = require('../services/videoService');

const create = async (req, res) => {
  const video = await createVideo(req.user._id, req.body);

  res.status(201).json({
    status: 'success',
    data: { video },
  });
};

const list = async (req, res) => {
  const { videos, total } = await getVideos({
    limit: req.query.limit,
    skip: req.query.skip,
  });

  res.status(200).json({
    status: 'success',
    results: videos.length,
    total,
    data: { videos },
  });
};

const followingFeed = async (req, res) => {
  const { videos, total } = await getFollowingFeed({
    viewerId: req.user._id,
    limit: req.query.limit,
    skip: req.query.skip,
  });

  res.status(200).json({
    status: 'success',
    feedType: 'following',
    results: videos.length,
    total,
    data: { videos },
  });
};

const trendingFeed = async (req, res) => {
  const { videos, total } = await getTrendingFeed({
    limit: req.query.limit,
    skip: req.query.skip,
  });

  res.status(200).json({
    status: 'success',
    feedType: 'trending',
    results: videos.length,
    total,
    data: { videos },
  });
};

const update = async (req, res) => {
  const video = await updateVideo(req.params.id, req.user._id, req.body);

  res.status(200).json({
    status: 'success',
    data: { video },
  });
};

const remove = async (req, res) => {
  await deleteVideo(req.params.id, req.user._id, req.user.role);

  res.status(200).json({
    status: 'success',
    message: 'Video deleted successfully',
  });
};

module.exports = {
  create,
  list,
  followingFeed,
  trendingFeed,
  update,
  remove,
};
