import AdminSidebar from "@/components/AdminSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useEffect, useState } from "react";
import { loadSettings, RoleSettings } from "@/lib/settings";

const AdminSettings = () => {
  const ROLE = 'admin';
  const [settings, setSettings] = useState<RoleSettings | null>(null);

  useEffect(() => {
    const s = loadSettings(ROLE);
    setSettings(Object.keys(s).length ? s : null);
  }, []);

  const display = (label: string, value?: string | boolean | undefined) => (
    <div className="p-4 bg-white rounded-lg shadow">
      <h4 className="text-sm font-medium">{label}</h4>
      <div className="text-sm text-muted-foreground mt-1">{value === undefined || value === null || value === '' ? 'Not configured' : String(value)}</div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8">
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Read-only configuration overview (values come from local configuration).</p>

          <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {display('Notifications enabled', settings?.notificationsEnabled)}
            {display('Contact email', settings?.email)}
            {display('Timezone', settings?.timezone)}
            {display('Preferred theme', settings?.preferredTheme)}
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;