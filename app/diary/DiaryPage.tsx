'use client'

import React, { useState } from 'react';
import Image from 'next/image';

interface DiaryEntryProps {
  date: string;
  title: string;
  content: string;
  imageSrc: string;
}

const DiaryPage: React.FC<DiaryEntryProps> = ({ date, title, content, imageSrc }) => {
  return (
    <main className="min-h-screen bg-gradient-to-r from-pink-200 to-blue-200 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-lg shadow-xl overflow-hidden w-full max-w-7xl h-[800px]">
        <div className="flex flex-col h-full">
          <div className="flex-grow p-8 overflow-y-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Diary</h1>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
              <div className="p-4 h-[200px]">
                <p className="text-sm text-gray-500">Friday, 15 March 2024</p>
                <h2 className="text-xl font-bold mt-1">Full-day Hike in the Mountain</h2>
              </div>
              <div className="relative h-80">
                <Image
                  src="/img/diary.jpg"
                  alt="Mountain hike"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-4">
                <p className="text-gray-700">
                  The city of southern California, San Diego is located in San Diego County. Its located on San Diego Bay, on part of the Pacific Ocean near the Mexican border. San Diego is the second largest city in California and the seventh largest in the United States. It is also nicknamed as Americas Finest City...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DiaryPage;