import { useUiStore } from "../../store/uiStore";
import { MenuIcon } from "../icons/MenuIcon";

const Header = () => {
  const { toggleMenu } = useUiStore();

  return (
    <header className="bg-white dark:bg-gray-600 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex items-center">
        <button
          onClick={toggleMenu}
          className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mr-4"
          aria-label="Abrir menu"
        >
          <MenuIcon size={24} />
        </button>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Auto Assistance
        </h1>
      </div>
    </header>
  );
};

export default Header;
