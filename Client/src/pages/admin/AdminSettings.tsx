import AdminSidebar from "@/components/AdminSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";

const AdminSettings = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8">
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure system settings and preferences</p>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;