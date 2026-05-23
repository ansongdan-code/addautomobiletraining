class VideoServiceInterface {
  async addVideoToCourse() {
    throw new Error('addVideoToCourse must be implemented');
  }

  async getVideosByCourse() {
    throw new Error('getVideosByCourse must be implemented');
  }

  async getVideoById() {
    throw new Error('getVideoById must be implemented');
  }

  async updateVideo() {
    throw new Error('updateVideo must be implemented');
  }

  async deleteVideo() {
    throw new Error('deleteVideo must be implemented');
  }

  async searchVideos() {
    throw new Error('searchVideos must be implemented');
  }
}

module.exports = VideoServiceInterface;
