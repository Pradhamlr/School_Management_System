import { Search, Bell, Settings, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function DashboardHeader() {
  return (
    <header className="h-20 glass-card border-b border-border/50 px-8 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-background/50 border-border/50 backdrop-blur-sm"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </Button>

        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-3 pl-4 border-l border-border/50">
          <Avatar>
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback className="bg-primary text-white">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">Rajesh Kumar</p>
            <p className="text-xs text-muted-foreground">Principal</p>
          </div>
        </div>
      </div>
    </header>
  );
}