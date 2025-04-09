// app/fonts.ts
import localFont from 'next/font/local';

export const pretendard = localFont({
    src: [
        {
            path: '../public/fonts/Pretendard-Medium.woff2',
            weight: '500',
            style: 'normal',
        },
    ],
    variable: '--font-pretendard',
    display: 'swap',
});
