import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Scale,
  RotateCcw,
  Info,
  Zap,
  Keyboard,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { isDemoMode, units, toggleDemoMode, setUnits, resetData } = useAppStore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleResetData = () => {
    resetData();
    toast({
      title: "Data Reset",
      description: "All demo data has been reset successfully.",
    });
  };

  const keyboardShortcuts = [
    { key: '/', description: 'Focus search' },
    { key: 't', description: 'Toggle theme' },
    { key: 'd', description: 'Toggle demo mode' },
    { key: 'r', description: 'Reset data' },
    { key: '?', description: 'Show shortcuts' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Customize your EcoSnap experience</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme" className="flex items-center gap-2">
                    {theme === 'dark' ? <Moon className="w-4 h-4" /> : 
                     theme === 'light' ? <Sun className="w-4 h-4" /> : 
                     <Monitor className="w-4 h-4" />}
                    Theme
                  </Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Units & Measurements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Units & Measurements
                </CardTitle>
                <CardDescription>
                  Choose your preferred units for displaying data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="units">Weight Units</Label>
                  <Select value={units} onValueChange={(value: 'kg' | 'lb') => setUnits(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="lb">Pounds (lb)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Demo Mode */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Demo Mode
                  {isDemoMode && <Badge variant="secondary">Active</Badge>}
                </CardTitle>
                <CardDescription>
                  Demo mode uses mock data for testing and demonstration purposes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="demo-mode" className="flex-1">
                    Enable Demo Mode
                    <p className="text-sm text-muted-foreground mt-1">
                      Use mock data for all features and API calls
                    </p>
                  </Label>
                  <Switch
                    id="demo-mode"
                    checked={isDemoMode}
                    onCheckedChange={toggleDemoMode}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Manage your application data and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Reset Demo Data</Label>
                    <p className="text-sm text-muted-foreground">
                      This will clear all scans, stats, and achievements
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleResetData}
                    className="text-destructive hover:text-destructive"
                  >
                    Reset Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Keyboard Shortcuts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5" />
                  Keyboard Shortcuts
                </CardTitle>
                <CardDescription>
                  Quick actions and navigation shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {keyboardShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{shortcut.description}</span>
                      <Badge variant="outline" className="font-mono">
                        {shortcut.key}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  About EcoSnap
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    EcoSnap helps you make sustainable choices by scanning products 
                    and providing eco-friendly alternatives.
                  </p>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <strong>Version:</strong> 1.0.0
                    </div>
                    <div>
                      <strong>Build:</strong> Demo
                    </div>
                  </div>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>About EcoSnap</DialogTitle>
                      <DialogDescription className="space-y-4">
                        <p>
                          EcoSnap is a demo application showcasing modern web technologies 
                          and sustainable design patterns.
                        </p>
                        <div className="space-y-2">
                          <h4 className="font-semibold">Technologies Used:</h4>
                          <ul className="text-sm space-y-1 list-disc list-inside">
                            <li>React 18 with TypeScript</li>
                            <li>Vite for fast development</li>
                            <li>Tailwind CSS for styling</li>
                            <li>Framer Motion for animations</li>
                            <li>Shadcn/ui component library</li>
                            <li>Zustand for state management</li>
                          </ul>
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}