"use client";

import MainScreen from "./layouts/MainScreen";
import Navbar from "./layouts/Navbar";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen w-full justify-center items-center">
      <Navbar />
      <MainScreen />
      <span className="mb-2 text-sm text-white hover:text-gray-900 transition-all duration-700 ease-in-out">Dev by CreatyJohnKwon</span>
    </div>
  );
}