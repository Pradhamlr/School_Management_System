import StudentSidebar from "@/components/StudentSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveSettings, loadSettings, RoleSettings } from "@/lib/settings";

const StudentSettings = () => {
  const ROLE = 'student';
  const [settings, setSettings] = useState<RoleSettings>({});

  useEffect(() => setSettings(loadSettings(ROLE)), []);

  const update = (patch: Partial<RoleSettings>) => setSettings(s => ({ ...s, ...patch }));
  const handleSave = () => { saveSettings(ROLE, settings); alert('Settings saved locally'); };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <StudentSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8">
          <div className="glass-card rounded-2xl p-8">
            <h1 className="text-2xl font-bold">Student Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account preferences and profile settings.</p>

            <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-medium">Notifications</h3>
                <p className="text-sm text-muted-foreground">Turn on exam and assignment notifications.</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Enable notifications</div>
                    <div className="text-xs text-muted-foreground">Push/email notifications</div>
                  </div>
                  <Switch checked={!!settings.notificationsEnabled} onCheckedChange={(v) => update({ notificationsEnabled: v })} />
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-medium">Regional</h3>
                <p className="text-sm text-muted-foreground">Set your preferred timezone.</p>
                <div className="mt-4">
                  <Input placeholder="UTC or Region/City" value={settings.timezone || ''} onChange={(e) => update({ timezone: e.target.value })} />
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

export default StudentSettings;
