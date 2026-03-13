import { useState, useEffect } from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { getPendingRequests } from "../../services/friendshipService";
import { useUiStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import { CloseIcon } from "../icons/CloseIcon";
import { DashboardIcon } from "../icons/DashboardIcon";
import { CarIcon } from "../icons/CarIcon";
import { UserIcon } from "../icons/UserIcon";
import { SettingsIcon } from "../icons/SettingsIcon";
import { LogoutIcon } from "../icons/LogoutIcon";
import { MaintenanceIcon } from "../icons/MaintenanceIcon";
import { BellIcon } from "../icons/BellIcon";
import ThemeSwitch from "../ui/ThemeSwitch";
import { Button } from "../ui/Button";

const navLinks = [
  { name: "Dashboard", path: "/dashboard", icon: <DashboardIcon size={20} /> },
  { name: "Amigos", path: "/friends", icon: <UserIcon size={20} /> },
  { name: "Meus Veículos", path: "/vehicles", icon: <CarIcon size={20} /> },
  {
    name: "Manutenções",
    path: "/maintenances",
    icon: <MaintenanceIcon size={20} />,
  },
  { name: "Lembretes", path: "/reminders", icon: <BellIcon size={20} /> },
  { name: "Meu Perfil", path: "/profile", icon: <UserIcon size={20} /> },
];

const Sidebar = () => {
  const { isMenuOpen, closeMenu } = useUiStore();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const requests = await getPendingRequests();
        setPendingRequestsCount(requests.length);
      } catch (error) {
        console.error("Erro ao buscar notificações de amizade", error);
      }
    };
    fetchPendingCount();
  }, [location.pathname]);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/");
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
        className={`fixed top-0 left-0 h-full w-80 bg-background border-r border-input shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-input">
          <h2
            className="font-bold text-lg text-foreground truncate"
            title={`Olá, ${user?.name}`}
          >
            Olá, {user?.name}
          </h2>
          <button onClick={closeMenu} className="text-foreground/70 hover:text-foreground md:hidden">
            <CloseIcon size={24} />
          </button>
        </div>

        <nav className="p-4 flex-grow overflow-y-auto">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 py-2 px-3 rounded-md transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                    }`
                  }
                >
                  {link.icon}
                  <span className="flex-1">{link.name}</span>
                  {link.name === "Amigos" && pendingRequestsCount > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full shadow-sm animate-pulse">
                      {pendingRequestsCount}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}

            {user?.role === "ADMIN" && (
              <li className="pt-2 mt-2 border-t border-input">
                <NavLink
                  to="/admin"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 py-2 px-3 rounded-md transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                    }`
                  }
                >
                  <SettingsIcon size={20} />
                  <span>Administração</span>
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <div className="p-4 border-t border-input space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm dark:text-gray-300">Mudar Tema</span>
            <ThemeSwitch />
          </div>

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
