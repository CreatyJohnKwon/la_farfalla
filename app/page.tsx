"use client";

import MainScreen from "./utils/components/MainScreen";
import Navbar from "./utils/layouts/Navbar";
import { useSession } from "next-auth/react";

export default function App() {
  const { status } = useSession();

  return (
    <>
      { status && 
        <div className="flex flex-col min-h-screen w-full justify-center items-center">
          <Navbar />
          <MainScreen />
          <span className="mb-2 text-sm text-white hover:text-gray-900 transition-all duration-700 ease-in-out">Dev by CreatyJohnKwon</span>
        </div>
      }
    </>
  );
}