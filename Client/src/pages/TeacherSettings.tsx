import { TeacherSidebar } from "@/components/TeacherSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { saveSettings, loadSettings, RoleSettings } from "@/lib/settings";

const TeacherSettings = () => {
  const ROLE = 'teacher';
  const [settings, setSettings] = useState<RoleSettings>({});

  useEffect(() => setSettings(loadSettings(ROLE)), []);
  const update = (patch: Partial<RoleSettings>) => setSettings(s => ({ ...s, ...patch }));
  const handleSave = () => { saveSettings(ROLE, settings); alert('Settings saved locally'); };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TeacherSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8">
          <div className="glass-card rounded-2xl p-8">
            <h1 className="text-2xl font-bold">Teacher Settings</h1>
            <p className="text-gray-600 mt-2">Update profile, notifications and class preferences.</p>

            <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">Enable class or admin notifications.</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Enable notifications</div>
                    <div className="text-xs text-muted-foreground">Receive assignment and timetable alerts</div>
                  </div>
                  <Switch checked={!!settings.notificationsEnabled} onCheckedChange={(v) => update({ notificationsEnabled: v })} />
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-medium">Appearance</h3>
                <p className="text-sm text-muted-foreground">Preferred theme for your dashboard.</p>
                <div className="mt-4">
                  <select className="border rounded p-2 w-full" value={settings.preferredTheme || 'system'} onChange={(e) => update({ preferredTheme: e.target.value as any })}>
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>
            </section>

            <div className="mt-6">
              <Button onClick={handleSave}>Save Settings</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherSettings;
