import { useState } from "react";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import { Outlet } from "react-router-dom";

const AdminDashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar toggleSidebar={toggleSidebar} />
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <main className="pt-20 lg:pl-64 p-4">
        <Outlet />
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default AdminDashboardLayout;
