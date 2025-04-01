"use client";

import ReactPlayer from "react-player";

const Fun = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-full">
            <div className="rounded-3xl overflow-hidden">
                <ReactPlayer 
                    width={450}
                    height={870}
                    url="https://www.youtube.com/shorts/iplAx5EK_KU" 
                    loop
                    playing
                />
            </div>
        </div>
    )
}

export default Fun;