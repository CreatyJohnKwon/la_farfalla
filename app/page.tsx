import Image from "next/image";
import Navbar from "./layouts/Navbar";

export default function Home() {
  return (
    <div className="bg-white grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Image 
        src="/chill.png"
        alt="칠가이"
        width={500}
        height={500}
        className="w-24 h-24 mb-8"
      />
      <Navbar />
      <h1 className="mt-52 w-full h-full bg-red-100">라파파팜</h1>
    </div>
  );
}
  