import React, { useEffect } from "react";
import { useSnapshot } from "valtio";
import { authState } from "../../store/authState";
import { Link, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";

const Navbar = () => {
  const auth = useSnapshot(authState);
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    authState.checkAuth();
  }, []);

  const isActive = (path) => {
    if (path === "/" && currentPath === "/") {
      return true;
    }
    if (path !== "/" && currentPath.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <nav className="bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg animate-gradient-x">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={"/"}>
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-white text-xl font-bold hover:text-purple-100 transition-colors duration-300">
                  PixelVibe
                </h1>
              </div>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`${
                  isActive("/")
                    ? "text-white border-purple-200"
                    : "text-purple-100 border-transparent"
                } hover:text-white inline-flex items-center px-1 pt-1 border-b-2 hover:border-purple-200 font-medium transition-all duration-300`}
              >
                Home
              </Link>
              <Link
                to="/feedbacks"
                className={`${
                  isActive("/feedbacks")
                    ? "text-white border-purple-200"
                    : "text-purple-100 border-transparent"
                } hover:text-white inline-flex items-center px-1 pt-1 border-b-2 hover:border-purple-200 font-medium transition-all duration-300`}
              >
                Feedbacks
              </Link>
              <Link
                to="/progress"
                className={`${
                  isActive("/progress")
                    ? "text-white border-purple-200"
                    : "text-purple-100 border-transparent"
                } hover:text-white inline-flex items-center px-1 pt-1 border-b-2 hover:border-purple-200 font-medium transition-all duration-300`}
              >
                Progress
              </Link>
              <Link
                to="/plans"
                className={`${
                  isActive("/plans")
                    ? "text-white border-purple-200"
                    : "text-purple-100 border-transparent"
                } hover:text-white inline-flex items-center px-1 pt-1 border-b-2 hover:border-purple-200 font-medium transition-all duration-300`}
              >
                Plans
              </Link>
              <Link
                to="/tasks"
                className={`${
                  isActive("/tasks")
                    ? "text-white border-purple-200"
                    : "text-purple-100 border-transparent"
                } hover:text-white inline-flex items-center px-1 pt-1 border-b-2 hover:border-purple-200 font-medium transition-all duration-300`}
              >
                Tasks
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {auth.isAuthenticated ? (
              <div className="flex items-center">
                <Link
                  to="/profile"
                  className={`${
                    isActive("/profile") ? "text-white" : "text-purple-100"
                  } hover:text-white px-3 py-2 rounded-md font-medium transition-colors duration-300`}
                >
                  Profile
                </Link>
                <Link
                  to="/notification"
                  className={`${
                    isActive("/notification")
                      ? "text-white"
                      : "text-purple-100"
                  } hover:text-white px-3 py-2 rounded-md font-medium transition-colors duration-300`}
                >
                  <Bell />
                </Link>
                <button
                  onClick={() => authState.logout()}
                  className="ml-4 bg-purple-700 hover:bg-purple-800 text-white px-3 py-2 rounded-md font-medium transition-colors duration-300 shadow-md"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <Link
                  to="/login"
                  className={`${
                    isActive("/login") ? "bg-purple-700" : "bg-purple-600"
                  } hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-300 shadow-md`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`ml-4 ${
                    isActive("/signup") ? "bg-indigo-100" : "bg-white"
                  } hover:bg-indigo-100 text-purple-600 border border-purple-500 px-4 py-2 rounded-md font-medium transition-colors duration-300 shadow-sm`}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
