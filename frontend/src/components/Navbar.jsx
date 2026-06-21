import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, User, LogOut, LayoutDashboard, Sun, Moon } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

const navLinkClass = ({ isActive }) =>
  `text-sm font-semibold transition-colors ${
    isActive
      ? "text-pasture-700 dark:text-gold-300"
      : "text-ink-700 hover:text-pasture-600 dark:text-cream-100/70 dark:hover:text-gold-300"
  }`;

const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className={`rounded-full p-2 transition-colors hover:bg-pasture-50 dark:hover:bg-noir-800 ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-gold-300" />
      ) : (
        <Moon className="h-5 w-5 text-ink-700" />
      )}
    </button>
  );
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-cream-200 bg-cream-100/90 backdrop-blur-md transition-colors duration-300 dark:border-noir-700 dark:bg-noir-950/90">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/products" className={navLinkClass}>
            Products
          </NavLink>
          {isAuthenticated && !isAdmin && (
            <NavLink to="/orders" className={navLinkClass}>
              My Orders
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />

          <Link to="/cart" className="relative rounded-full p-2 hover:bg-pasture-50 dark:hover:bg-noir-800" aria-label="Cart">
            <ShoppingCart className="h-5 w-5 text-ink dark:text-cream-100" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-milk-600 text-[10px] font-bold text-white dark:bg-gold-500 dark:text-noir-950">
                {totalItems}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="ml-1 flex items-center gap-3">
              <span className="text-sm font-semibold text-ink-700 dark:text-cream-100/80">Hi, {user.name?.split(" ")[0]}</span>
              <button onClick={handleLogout} className="rounded-full p-2 hover:bg-pasture-50 dark:hover:bg-noir-800" aria-label="Log out">
                <LogOut className="h-5 w-5 text-ink dark:text-cream-100" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary ml-1">
              <User className="h-4 w-4" /> Login
            </Link>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            className="rounded-full p-2 hover:bg-pasture-50 dark:hover:bg-noir-800"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6 dark:text-cream-100" /> : <Menu className="h-6 w-6 dark:text-cream-100" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-cream-200 bg-cream-100 px-4 pb-4 md:hidden dark:border-noir-700 dark:bg-noir-950">
          <div className="flex flex-col gap-3 pt-3">
            <NavLink to="/" className={navLinkClass} end onClick={() => setOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/products" className={navLinkClass} onClick={() => setOpen(false)}>
              Products
            </NavLink>
            <NavLink to="/cart" className={navLinkClass} onClick={() => setOpen(false)}>
              Cart ({totalItems})
            </NavLink>
            {isAuthenticated && !isAdmin && (
              <NavLink to="/orders" className={navLinkClass} onClick={() => setOpen(false)}>
                My Orders
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass} onClick={() => setOpen(false)}>
                <span className="flex items-center gap-1.5">
                  <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                </span>
              </NavLink>
            )}
            <div className="mt-2 border-t border-cream-200 pt-3 dark:border-noir-700">
              {isAuthenticated ? (
                <button onClick={handleLogout} className="btn-secondary w-full">
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              ) : (
                <Link to="/login" className="btn-primary w-full" onClick={() => setOpen(false)}>
                  <User className="h-4 w-4" /> Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
