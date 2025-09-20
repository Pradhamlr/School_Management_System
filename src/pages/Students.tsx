import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";

const Students = () => {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-8">
          <div className="glass-card rounded-2xl p-8 text-center">
            <h1 className="text-3xl font-bold gradient-text mb-4">Students Management</h1>
            <p className="text-lg text-muted-foreground">
              This page will contain student management functionality
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Students;