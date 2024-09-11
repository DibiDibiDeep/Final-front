import React from 'react';
import Link from 'next/link';

interface Story {
    id: number;
    title: string;
    imageUrl: string;
}

const stories: Story[] = [
    { id: 1, title: 'The Three Little Pigs', imageUrl: '/img/storyThumbnail/three-little-pigs.jpg' },
    { id: 2, title: 'The Princess and the Pea', imageUrl: '/img/storyThumbnail/princess-and-pea.jpg' },
    { id: 3, title: 'The Tale of Peter Rabbit', imageUrl: '/img/storyThumbnail/peter-rabbit.jpg' },
    { id: 4, title: 'The Elves and The Shoemaker', imageUrl: '/img/storyThumbnail/elves-and-shoemaker.jpg' },
    { id: 5, title: 'Cinderella', imageUrl: '/img/storyThumbnail/cinderella.jpg' },
    { id: 6, title: 'Snow White', imageUrl: '/img/storyThumbnail/snowWhite.jpg' },
    { id: 7, title: 'Hansel and Gretel', imageUrl: '/img/storyThumbnail/hanselAndGretel.jpg' },
];

const StoryCard: React.FC<Story> = ({ id, title, imageUrl }) => (
    <Link href={`/story/${id}`} className="block">
        <div className="bg-white/70 rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-white">
            <img src={imageUrl} alt={title} className="w-full h-40 object-cover" />
            <div className="p-3">
                <h3 className="font-bold text-gray-700 mb-1 truncate">{title}</h3>
            </div>
        </div>
    </Link>
);

const StoryCardGrid: React.FC = () => (
    <div className="container mx-auto px-4 py-8 sm:py-16 md:py-20 mb-[100px]">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
            {stories.map((story) => (
                <StoryCard key={story.id} {...story} />
            ))}
        </div>
    </div>
);

export default StoryCardGrid;