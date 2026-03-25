const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} = require('../services/followService');

const follow = async (req, res) => {
  await followUser(req.user._id, req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'User followed successfully',
  });
};

const unfollow = async (req, res) => {
  await unfollowUser(req.user._id, req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'User unfollowed successfully',
  });
};

const followers = async (req, res) => {
  const data = await getFollowers(req.params.id);

  res.status(200).json({
    status: 'success',
    results: data.length,
    data: { followers: data },
  });
};

const following = async (req, res) => {
  const data = await getFollowing(req.params.id);

  res.status(200).json({
    status: 'success',
    results: data.length,
    data: { following: data },
  });
};

module.exports = {
  follow,
  unfollow,
  followers,
  following,
};
