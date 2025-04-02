"use client";

import ReactPlayer from "react-player";

const Fun = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-full">
            {/* <div className="rounded-3xl overflow-hidden">
                {/* <ReactPlayer 
                    width={450}
                    height={870}
                    url="https://www.youtube.com/shorts/iplAx5EK_KU" 
                    loop
                    playing
                />
            </div> */}
            <h1 className="text-3xl c_base:text-7xl font-serif mb-10">serif Font FONT</h1>
            <h1 className="text-3xl c_base:text-7xl font-sans mb-10">sans Font FONT</h1>
            <h1 className="text-3xl c_base:text-7xl font-mono mb-10">mono Font FONT</h1>
            <h1 className="text-3xl c_base:text-7xl font-thin mb-10">thin Font FONT</h1>
            <h1 className="text-3xl c_base:text-7xl font-light mb-10">light Font FONT</h1>
            <h1 className="text-3xl c_base:text-7xl font-extralight mb-10">extralight Font FONT</h1>
            <h1 className="text-3xl c_base:text-7xl font-normal mb-10">normal Font FONT</h1>
            <h1 className="text-3xl c_base:text-7xl font-semibold mb-10">semibold Font FONT</h1>
            <h1 className="text-3xl c_base:text-7xl font-bold mb-10">bold Font FONT</h1>
            <h1 className="text-3xl c_base:text-7xl font-extrabold mb-10">extrabold Font FONT</h1>
        </div>
    )
}

export default Fun;