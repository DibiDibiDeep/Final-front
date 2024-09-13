import axios from 'axios';

interface ProcessImageParams {
    imageUrl: string;
    userId: number;
    babyId: number;
}

export interface CalendarResult {
    year: string | null;
    month: string;
    events: Array<{
        date: string;
        activities: Array<{
            name: string;
            time: string | null;
            infomation: string;
        }>;
    }>;
    etc: string | null;
    user_id: string;
    baby_id: string;
}

export async function processImage({ imageUrl, userId, babyId }: ProcessImageParams): Promise<CalendarResult> {
    try {
        const response = await axios.post('http://localhost:8000/process_image', {
            user_id: userId,
            baby_id: babyId,
            image_path: imageUrl,
        });

        if (response.status !== 200) {
            throw new Error(`Failed to process image. Status: ${response.status}`);
        }

        console.log('Image processed successfully:', response.data);
        return response.data as CalendarResult;
    } catch (error) {
        console.error('Error processing image:', error);
        throw new Error('Failed to process image');
    }
}