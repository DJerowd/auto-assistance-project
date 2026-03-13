import { Link } from "react-router-dom";
import { useUiStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import { MenuIcon } from "../icons/MenuIcon";
import { UserIcon } from "../icons/UserIcon";

const Header = () => {
  const { toggleMenu } = useUiStore();
  const { user } = useAuthStore();

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${baseUrl}/${cleanPath}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md text-primary-foreground border-b border-input transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleMenu}
            className="p-2 rounded-full text-primary-foreground/80 hover:bg-primary-hover hover:text-primary-foreground mr-4 transition-colors"
            aria-label="Abrir menu"
          >
            <MenuIcon size={24} />
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <h1 className="text-xl font-bold text-primary-foreground hidden sm:block">
              Auto Assistance
            </h1>
          </Link>
        </div>

        {user && (
          <Link
            to="/profile"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <span className="text-sm font-medium text-primary-foreground hidden md:block">
              {user.name}
            </span>
            <div className="w-9 h-9 rounded-full overflow-hidden border border-primary-foreground/20 flex items-center justify-center">
              {user.profile_image ? (
                <img
                  src={getImageUrl(user.profile_image) || ""}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon
                  size={20}
                  className="text-primary-foreground/70"
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
