
import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import DashboardPage from "./pages/Dashboard/DashboardPage";
import BugsPage from "./pages/Bugs/BugsPage";
import KanbanPage from "./pages/kanban/KanbanPage";
import LoginPage from "./pages/Auth/LoginPage";

import Navbar from "./components/navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";

import ProtectedRoute from "./components/routes/ProtectedRoute";
import RoleProtectedRoute from "./components/routes/RoleProtectedRoute";

import UsersPage from "./pages/Users/UsersPage";
import ProjectsPage from "./pages/Projects/ProjectsPage";
import MyBugsPage from "./pages/MyBugs/MyBugsPage";
import ProjectDetailsPage from "./pages/Projects/ProjectDetailsPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import SettingsPage from "./pages/Settings/SettingsPage";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected application routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen min-w-0 bg-slate-50 text-slate-800 antialiased transition-colors duration-200 selection:bg-blue-500/30 dark:bg-[#0d121f] dark:text-slate-100">
                {/* Sidebar */}
                <Sidebar
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                />

                {/* Main application */}
                <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
                  <Navbar setSidebarOpen={setSidebarOpen} />

                  <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 sm:p-6 lg:p-8">
                    <Routes>
                      <Route
                        path="/"
                        element={<DashboardPage />}
                      />

                      <Route
                        path="/bugs"
                        element={<BugsPage />}
                      />

                      <Route
                        path="/kanban"
                        element={<KanbanPage />}
                      />

                      <Route
                        path="/my-bugs"
                        element={<MyBugsPage />}
                      />

                      {/* Admin-only pages */}
                      <Route
                        path="/projects"
                        element={
                          <RoleProtectedRoute role="ADMIN">
                            <ProjectsPage />
                          </RoleProtectedRoute>
                        }
                      />

                      <Route
                        path="/users"
                        element={
                          <RoleProtectedRoute role="ADMIN">
                            <UsersPage />
                          </RoleProtectedRoute>
                        }
                      />

                      <Route
                        path="/projects/:id"
                        element={<ProjectDetailsPage />}
                      />

                      <Route
                        path="/profile"
                        element={<ProfilePage />}
                      />

                      <Route
                        path="/settings"
                        element={<SettingsPage />}
                      />

                      {/* Fallback */}
                      <Route
                        path="*"
                        element={<Navigate to="/" replace />}
                      />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
