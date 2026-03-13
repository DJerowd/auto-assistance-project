import { useUiStore } from "../../store/uiStore";
import { SunIcon } from "../icons/SunIcon";
import { MoonIcon } from "../icons/MoonIcon";

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useUiStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-foreground/70 hover:text-foreground hover:bg-accent transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? <MoonIcon size={20} /> : <SunIcon size={20} />}
    </button>
  );
};

export default ThemeSwitch;
