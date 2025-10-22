import AdminSidebar from "@/components/AdminSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";

const ReportManagement = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8">
          <h1 className="text-3xl font-bold text-gray-900">Report Management</h1>
          <p className="text-gray-600 mt-1">Generate and manage system reports</p>
        </main>
      </div>
    </div>
  );
};

export default ReportManagement;