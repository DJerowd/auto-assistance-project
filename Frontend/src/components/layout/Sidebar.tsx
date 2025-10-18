import { NavLink, useNavigate } from "react-router-dom";
import { useUiStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import { CloseIcon } from "../icons/CloseIcon";
import ThemeSwitch from "../ui/ThemeSwitch";
import { Button } from "../ui/Button";

const navLinks = [
  { name: "Dashboard", path: "/" },
  { name: "Meus Veículos", path: "/vehicles" },
  { name: "Meu Perfil", path: "/profile" },
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
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          isMenuOpen ? "opacity-20" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
      ></div>

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="font-bold text-lg dark:text-white">Olá, {user?.name}</h2>
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
                    `block py-2 px-3 rounded-md transition-colors ${
                      isActive
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t dark:border-gray-700 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm dark:text-gray-300">Mudar Tema</span>
            <ThemeSwitch />
          </div>

          <Button variant="destructive" size="sm" onClick={handleLogout} className="w-full">
            Sair
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
