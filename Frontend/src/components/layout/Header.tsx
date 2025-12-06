import { Link } from "react-router-dom";
import { useUiStore } from "../../store/uiStore";
import { MenuIcon } from "../icons/MenuIcon";

const Header = () => {
  const { toggleMenu } = useUiStore();

  return (
    <header className="bg-indigo-700 dark:bg-indigo-900 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex items-center">
        <button
          onClick={toggleMenu}
          className="p-2 rounded-full text-gray-100 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-black/10 mr-4"
          aria-label="Abrir menu"
        >
          <MenuIcon size={24} />
        </button>

        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Auto Assistance
          </h1>
        </Link>
      </div>
    </header>
  );
};

export default Header;
