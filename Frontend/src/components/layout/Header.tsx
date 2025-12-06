import { Link } from "react-router-dom";
import { useUiStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import { MenuIcon } from "../icons/MenuIcon";
import { UserIcon } from "../icons/UserIcon";

const Header = () => {
  const { toggleMenu } = useUiStore();
  const { user } = useAuthStore();

  const getImageUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    return `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}/${path}`;
  };

  return (
    <header className="bg-indigo-700 dark:bg-indigo-900 shadow-sm sticky top-0 z-30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleMenu}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mr-4"
            aria-label="Abrir menu"
          >
            <MenuIcon size={24} />
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
              Auto Assistance
            </h1>
          </Link>
        </div>

        {user && (
          <Link
            to="/profile"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:block">
              {user.name}
            </span>
            <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              {user.profile_image ? (
                <img
                  src={getImageUrl(user.profile_image)}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon
                  size={20}
                  className="text-gray-500 dark:text-gray-400"
                />
              )}
            </div>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
