import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutPublic() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d12] text-white">
      <Navbar />

      <main className="flex-1 pt-20 px-4 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}