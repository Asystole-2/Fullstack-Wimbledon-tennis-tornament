const YT_API_KEY = 'AIzaSyAo1K49yjUaLP6P0oNoF5q74X7HvdssIy0';

async function tm_loadYouTubeContent() {
    const container = document.getElementById('tm_videoContainer');
    container.innerHTML = '<p>Loading videos...</p>';

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?` +
            `part=snippet&` +
            `maxResults=6&` +
            `q=Wimbledon%20tennis%20tournament%20guide&` + // More specific query
            `type=video&` +
            `key=${YT_API_KEY}`
        );

        const data = await response.json();

        if (data.items && data.items.length > 0) {
            tm_displayVideos(data.items);
        } else {
            throw new Error('No videos found');
        }

    } catch (error) {
        console.error('YouTube API Error:', error);
        container.innerHTML = '<p class="tm_error">Error loading video content. Please try again later.</p>';
    }
}

function tm_displayVideos(videos) {
    const container = document.getElementById('tm_videoContainer');
    container.innerHTML = ''; // Clear loading state

    videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'tm_video-card';
        videoCard.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${video.id.videoId}" 
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen></iframe>
            <div class="tm_video-info">
                <div class="tm_video-title">${video.snippet.title}</div>
                <div class="tm_video-description">${video.snippet.description.substring(0, 100)}...</div>
            </div>
        `;
        container.appendChild(videoCard);
    });
}

// Initialize in main.js
export function tm_initYouTube() {
    tm_loadYouTubeContent();
}