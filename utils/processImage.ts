import axios from 'axios';

interface ProcessImageParams {
    imageUrl: string;
    userId: number;
    babyId: number;
}

export async function processImage({ imageUrl, userId, babyId }: ProcessImageParams): Promise<void> {
    try {
        const response = await axios.post('http://localhost:8000/process_image', {
            user_id: userId.toString(),
            baby_id: babyId.toString(),
            image_path: imageUrl,

        });

        if (response.status !== 200) {
            throw new Error(`Failed to process image. Status: ${response.status}`);
        }

        console.log('Image processed successfully:', response.data);
    } catch (error) {
        console.error('Error processing image:', error);
        throw new Error('Failed to process image');
    }
}