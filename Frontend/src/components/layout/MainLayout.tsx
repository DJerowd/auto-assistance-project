import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-bg-start to-bg-end text-foreground">
      <Sidebar />
      <div className="flex flex-col flex-grow">
        <Header />
        <main className="flex-grow p-6">
          <div
            className="max-w-7xl mx-auto animate-fade-in-up"
            key={location.pathname}
          >
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
