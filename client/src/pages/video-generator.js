export class DIDVideoGenerator {
    constructor(apiKey) {
      this.apiKey = apiKey;
      this.baseUrl = 'http://localhost:5000/api/d-id/talks'; // Flask proxy endpoint
    }
  
    /**
     * Generate a talking avatar video
     * @param {string} text - The text for the avatar to speak
     * @param {string} [sourceUrl] - Optional image URL for the avatar
     * @returns {Promise<Object>} - Response with video URL
     */
    async generateVideo(
      text,
      sourceUrl = 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg'
    ) {
      try {
        console.log(`Generating video for text: ${text.substring(0, 50)}...`);
  
        // Step 1: Create the talk
        const createResponse = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source_url: sourceUrl,
            script: {
              type: 'text',
              subtitles: 'false',
              provider: { type: 'microsoft', voice_id: 'Sara' },
              input: text,
              ssml: 'false',
            },
            config: { fluent: 'false' },
          }),
        });
  
        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error(`Flask proxy error (${createResponse.status}): ${errorText}`);
          return { success: false, message: errorText };
        }
  
        const createData = await createResponse.json();
        console.log('Flask proxy create response:', createData);
  
        const talkId = createData.id;
        if (!talkId) {
          return { success: false, message: 'Failed to create talk' };
        }
  
        // Step 2: Poll for video status
        return await this.pollForVideoStatus(talkId);
      } catch (error) {
        console.error('Error in video generation:', error);
        return { success: false, message: error.message };
      }
    }
  
    /**
     * Poll for video status
     * @param {string} talkId - The ID of the created talk
     * @returns {Promise<Object>} - Response with video URL
     */
    async pollForVideoStatus(talkId) {
      const maxAttempts = 15;
      const delay = 2000; // 2 seconds between each poll
  
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        console.log(`Polling for video status (attempt ${attempt + 1}/${maxAttempts})...`);
  
        try {
          const statusResponse = await fetch(`${this.baseUrl}/${talkId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
  
          if (!statusResponse.ok) {
            const errorText = await statusResponse.text();
            console.error(`Flask proxy status error (${statusResponse.status}): ${errorText}`);
            continue;
          }
  
          const statusData = await statusResponse.json();
          console.log('Flask proxy status response:', statusData);
  
          if (statusData.status === 'done') {
            // Video is ready
            return { success: true, videoUrl: statusData.result_url };
          } else if (statusData.status === 'error') {
            // Video generation failed
            return { success: false, message: statusData.error || 'Unknown error' };
          }
  
          // Wait before the next poll
          await new Promise((resolve) => setTimeout(resolve, delay));
        } catch (error) {
          console.error('Error polling for video status:', error);
        }
      }
  
      // If we reach here, polling timed out
      return { success: false, message: 'Timeout waiting for video generation' };
    }
  }
  
  // Export as default
  export default DIDVideoGenerator;