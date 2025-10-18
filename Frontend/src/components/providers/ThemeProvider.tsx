import { useEffect } from "react";
import { useUiStore } from "../../store/uiStore";

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
};

export default ThemeProvider;
