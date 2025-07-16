import React, { useState, useEffect, useCallback } from 'react';
import './VideoManager.css';

const VideoManager = ({ courseId, onVideoAdded }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    videoType: 'lecture',
    tags: '',
    isPublic: false
  });

  // Fetch videos for the course
  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/videos/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVideos(data.data.videos || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchVideos();
    }
  }, [courseId, fetchVideos]);

  // Add YouTube video
  const handleAddVideo = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/videos/youtube/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setVideos([...videos, data.data]);
        setFormData({
          title: '',
          description: '',
          youtubeUrl: '',
          videoType: 'lecture',
          tags: '',
          isPublic: false
        });
        setShowAddForm(false);
        if (onVideoAdded) {
          onVideoAdded(data.data);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add video');
      }
    } catch (error) {
      console.error('Error adding video:', error);
      alert('Failed to add video');
    } finally {
      setLoading(false);
    }
  };

  // Delete video
  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setVideos(videos.filter(video => video._id !== videoId));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  // Update video
  const handleUpdateVideo = async (videoId, updates) => {
    try {
      const response = await fetch(`/api/v1/videos/${videoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setVideos(videos.map(video => 
          video._id === videoId ? { ...video, ...updates } : video
        ));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update video');
      }
    } catch (error) {
      console.error('Error updating video:', error);
      alert('Failed to update video');
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-manager">
      <div className="video-manager-header">
        <h2>Course Videos</h2>
        <button 
          className="add-video-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add YouTube Video'}
        </button>
      </div>

      {/* Add Video Form */}
      {showAddForm && (
        <div className="add-video-form">
          <h3>Add YouTube Video</h3>
          <form onSubmit={handleAddVideo}>
            <div className="form-group">
              <label>Video Title:</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter video title"
                required
              />
            </div>

            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter video description"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>YouTube URL:</label>
              <input
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Video Type:</label>
                <select
                  value={formData.videoType}
                  onChange={(e) => setFormData({...formData, videoType: e.target.value})}
                >
                  <option value="lecture">Lecture</option>
                  <option value="demonstration">Demonstration</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="review">Review</option>
                  <option value="assessment">Assessment</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tags:</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                />
                Make this video public (visible to non-enrolled users)
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Video'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Videos List */}
      <div className="videos-list">
        {loading && videos.length === 0 ? (
          <div className="loading">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div className="no-videos">
            <p>No videos added to this course yet.</p>
            <p>Click "Add YouTube Video" to get started!</p>
          </div>
        ) : (
          videos.map((video) => (
            <div key={video._id} className="video-item">
              <div className="video-thumbnail">
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/320x180?text=Video+Thumbnail';
                  }}
                />
                <div className="video-overlay">
                  <span className="video-type">{video.videoType}</span>
                  {video.isPublic && <span className="public-badge">Public</span>}
                </div>
              </div>

              <div className="video-info">
                <h4>{video.title}</h4>
                <p className="video-description">{video.description}</p>
                
                <div className="video-meta">
                  <span className="video-duration">
                    {video.duration > 0 ? formatDuration(video.duration) : 'Duration N/A'}
                  </span>
                  <span className="video-views">
                    {video.viewCount} views
                  </span>
                  <span className="video-date">
                    {new Date(video.uploadDate).toLocaleDateString()}
                  </span>
                </div>

                {video.tags && video.tags.length > 0 && (
                  <div className="video-tags">
                    {video.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="video-actions">
                  <button 
                    className="play-btn"
                    onClick={() => window.open(video.youtubeUrl, '_blank')}
                  >
                    ▶ Watch on YouTube
                  </button>
                  <button 
                    className="edit-btn"
                    onClick={() => {
                      // Simple inline editing - you can expand this
                      const newTitle = prompt('Enter new title:', video.title);
                      if (newTitle && newTitle !== video.title) {
                        handleUpdateVideo(video._id, { title: newTitle });
                      }
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteVideo(video._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Video Statistics */}
      {videos.length > 0 && (
        <div className="video-stats">
          <h3>Video Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{videos.length}</span>
              <span className="stat-label">Total Videos</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {videos.reduce((total, video) => total + video.viewCount, 0)}
              </span>
              <span className="stat-label">Total Views</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {videos.filter(video => video.isPublic).length}
              </span>
              <span className="stat-label">Public Videos</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoManager; 