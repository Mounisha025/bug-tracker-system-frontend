
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={`
        group inline-flex h-10 w-10 shrink-0 items-center justify-center
        rounded-xl border transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-blue-500 focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-slate-950
        ${isDark
          ? "border-slate-700 bg-slate-900 text-amber-400 hover:border-slate-600 hover:bg-slate-800 hover:text-amber-300"
          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        }
        ${className}
      `}
    >
      {isDark ? (
        <Sun
          size={19}
          strokeWidth={1.8}
          className="transition-transform duration-300 group-hover:rotate-45"
        />
      ) : (
        <Moon
          size={19}
          strokeWidth={1.8}
          className="transition-transform duration-300 group-hover:-rotate-12"
        />
      )}
    </button>
  );
};

export default ThemeToggle;
