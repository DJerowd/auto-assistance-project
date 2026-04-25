import { useEffect } from "react";
import { useChatStore } from "../../store/chatStore";
import { ChatDrawer } from "../chat/ChatDrawer";
import { Outlet, useLocation } from "react-router-dom";
import { MessageIcon } from "../icons/MessageIcon";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  const location = useLocation();
  const { connect, toggleDrawer, unreadCount } = useChatStore();

  useEffect(() => {
    connect();
  }, [connect]);

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

      <button
        onClick={toggleDrawer}
        className="fixed right-0 bottom-1/10 -translate-y-1/2 z-40 flex items-center bg-secondary text-secondary-foreground py-3 pl-3 pr-2 rounded-l-2xl shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:pr-4 transition-all duration-300 group border border-r-0 border-secondary-foreground/10"
        title="Abrir Conversas"
      >
        <div className="relative flex items-center justify-center">
          <MessageIcon
            size={24}
            className="group-hover:scale-110 transition-transform duration-300"
          />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-destructive text-foreground text-[10px] font-bold rounded-full border-2 border-primary">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-300 ease-in-out whitespace-nowrap font-medium text-sm opacity-0 group-hover:opacity-100 group-hover:pl-2">
          Conversas
        </span>
      </button>

      <ChatDrawer />
    </div>
  );
};

export default MainLayout;
