import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const { user, isLoaded } = useUser();

  const getThemeKey = () => {
    if (user?.id) {
      return `pupay-theme-${user.id}`;
    }

    return "pupay-theme-guest";
  };

  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (!isLoaded) return;

    const savedTheme = localStorage.getItem(getThemeKey()) || "light";
    setTheme(savedTheme);
  }, [isLoaded, user?.id]);

  useEffect(() => {
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(`${theme}-theme`);

    if (isLoaded) {
      localStorage.setItem(getThemeKey(), theme);
    }
  }, [theme, isLoaded, user?.id]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light"
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}