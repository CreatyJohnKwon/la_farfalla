import Navbar from "./layouts/Navbar";
import MainScreen from "./components/MainScreen";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <MainScreen />
    </div>
  );
}
  