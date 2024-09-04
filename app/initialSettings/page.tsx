'use client';

import React, { useState } from 'react';
import CommonContainer from '@/components/CommonContainer';
import AvatarWithUpload from './AvatarWithUpload';

const InitialSettings: React.FC = () => {

    return (
        <CommonContainer>
            <AvatarWithUpload />
        </CommonContainer>

    );
};

export default InitialSettings;
