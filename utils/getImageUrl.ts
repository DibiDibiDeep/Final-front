import axios from 'axios';

export async function getImageUrl(imageKey: string): Promise<string> {
    try {
        const response = await axios.get(`/api/calendar?key=${encodeURIComponent(imageKey)}`);

        if (response.status !== 200) {
            throw new Error(`Failed to fetch image URL. Status: ${response.status}`);
        }

        return response.data.url;
    } catch (error) {
        console.error('Error fetching image URL:', error);
        throw new Error('Failed to fetch image URL');
    }
}