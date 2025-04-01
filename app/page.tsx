"use client";

import MainScreen from "./layouts/MainScreen";
import Navbar from "./layouts/Navbar";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <MainScreen />
    </div>
  );
}
  