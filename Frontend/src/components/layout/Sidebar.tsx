import { NavLink, useNavigate } from "react-router-dom";
import { useUiStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import { CloseIcon } from "../icons/CloseIcon";
import { DashboardIcon } from "../icons/DashboardIcon";
import { CarIcon } from "../icons/CarIcon";
import { UserIcon } from "../icons/UserIcon";
import { LogoutIcon } from "../icons/LogoutIcon";
// import ThemeSwitch from "../ui/ThemeSwitch";
import { Button } from "../ui/Button";

const navLinks = [
  { name: "Dashboard", path: "/", icon: <DashboardIcon size={20} /> },
  { name: "Meus Veículos", path: "/vehicles", icon: <CarIcon size={20} /> },
  { name: "Meu Perfil", path: "/profile", icon: <UserIcon size={20} /> },
];

const Sidebar = () => {
  const { isMenuOpen, closeMenu } = useUiStore();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/login");
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
      ></div>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2
            className="font-bold text-lg dark:text-white truncate"
            title={`Olá, ${user?.name}`}
          >
            Olá, {user?.name}
          </h2>
          <button onClick={closeMenu} className="dark:text-gray-300 md:hidden">
            <CloseIcon size={24} />
          </button>
        </div>

        <nav className="p-4 flex-grow">
          <ul>
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex text-gray-800 dark:text-gray-200 items-center gap-3 py-2 px-3 rounded-md transition-colors ${
                      isActive
                        ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-100 dark:text-gray-300"
                    }`
                  }
                >
                  {link.icon}
                  <span>{link.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t dark:border-gray-700 space-y-4">
          {/* <div className="flex justify-between items-center">
            <span className="text-sm dark:text-gray-300">Mudar Tema</span>
            <ThemeSwitch />
          </div> */}

          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2"
          >
            <LogoutIcon size={18} />
            Sair
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
