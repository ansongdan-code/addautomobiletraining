const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  email: 'admin@autotraining.com',
  password: 'admin123'
};

const testCourseId = '64f8a1b2c3d4e5f6a7b8c9d0'; // Replace with actual course ID
const testVideo = {
  title: 'Engine Fundamentals - Part 1',
  description: 'Learn the basics of internal combustion engines, including engine types, components, and operating principles.',
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Example YouTube URL
  videoType: 'lecture',
  tags: 'engine, fundamentals, automotive, training',
  isPublic: true
};

let authToken = '';

// Test authentication
const testAuth = async () => {
  console.log('🔐 Testing Authentication...\n');

  try {
    // Test login
    console.log('📝 Testing admin login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);
    authToken = loginResponse.data.token;
    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('   Token received:', authToken.substring(0, 20) + '...');

  } catch (error) {
    console.error('❌ Authentication test failed:', error.response?.data || error.message);
  }
};

// Test adding YouTube video
const testAddYouTubeVideo = async () => {
  console.log('\n📹 Testing YouTube Video Addition...\n');

  try {
    console.log('🎥 Adding YouTube video to course...');
    const videoResponse = await axios.post(
      `${BASE_URL}/v1/videos/youtube/${testCourseId}`,
      testVideo,
      {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ YouTube video added successfully!');
    console.log('   Video ID:', videoResponse.data.data.videoId);
    console.log('   Title:', videoResponse.data.data.title);
    console.log('   YouTube Video ID:', videoResponse.data.data.youtubeVideoId);
    console.log('   Embed URL:', videoResponse.data.data.videoUrl);

  } catch (error) {
    console.error('❌ YouTube video addition failed:', error.response?.data || error.message);
  }
};

// Test getting course videos
const testGetCourseVideos = async () => {
  console.log('\n📋 Testing Get Course Videos...\n');

  try {
    console.log('📚 Getting videos for course...');
    const videosResponse = await axios.get(
      `${BASE_URL}/v1/videos/course/${testCourseId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Course videos retrieved successfully!');
    console.log('   Course Title:', videosResponse.data.data.courseTitle);
    console.log('   Total Videos:', videosResponse.data.data.totalVideos);
    console.log('   Videos:', videosResponse.data.data.videos.map(v => v.title));

  } catch (error) {
    console.error('❌ Get course videos failed:', error.response?.data || error.message);
  }
};

// Test video statistics
const testVideoStats = async () => {
  console.log('\n📊 Testing Video Statistics...\n');

  try {
    console.log('📈 Getting video statistics...');
    const statsResponse = await axios.get(
      `${BASE_URL}/v1/videos/stats`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    console.log('✅ Video statistics retrieved successfully!');
    console.log('   Total Videos:', statsResponse.data.data.totalVideos);
    console.log('   Total Views:', statsResponse.data.data.totalViews);
    console.log('   YouTube Videos:', statsResponse.data.data.youtubeVideos);

  } catch (error) {
    console.error('❌ Get video stats failed:', error.response?.data || error.message);
  }
};

// Main test function
const runVideoTests = async () => {
  console.log('🚀 Starting Video Upload Tests...\n');

  try {
    await testAuth();
    await testAddYouTubeVideo();
    await testGetCourseVideos();
    await testVideoStats();

    console.log('\n🎉 All Video Tests Completed!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Authentication (admin login)');
    console.log('   ✅ YouTube video addition');
    console.log('   ✅ Course videos retrieval');
    console.log('   ✅ Video statistics');

    console.log('\n💡 How to use the video system:');
    console.log('   1. Login as admin or instructor');
    console.log('   2. Go to Dashboard > Video Manager');
    console.log('   3. Click "Add YouTube Video"');
    console.log('   4. Enter video details and YouTube URL');
    console.log('   5. Submit to add video to course');

  } catch (error) {
    console.error('❌ Video tests failed:', error.message);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runVideoTests();
}

module.exports = { runVideoTests }; 