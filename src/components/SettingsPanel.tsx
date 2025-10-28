import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Film, Sparkles, User, Lock, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTheme, Theme } from '@/contexts/ThemeContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const themeOptions: { value: Theme; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    value: 'dark', 
    label: 'Dark Navy', 
    icon: <Moon className="w-5 h-5" />,
    description: 'Deep ocean vibes with electric accents'
  },
  { 
    value: 'light', 
    label: 'Light Mode', 
    icon: <Sun className="w-5 h-5" />,
    description: 'Clean and bright professional look'
  },
  { 
    value: 'cinematic', 
    label: 'Cinematic', 
    icon: <Film className="w-5 h-5" />,
    description: 'Rich contrast for video professionals'
  },
  { 
    value: 'neon', 
    label: 'Neon Pulse', 
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Vibrant cyberpunk aesthetics'
  },
];

// Future enhancement: expand to full result logs and downloadable reports
const mockRecentUploads = [
  { id: '1', name: 'interview_footage.mp4', confidence: 91, date: '2 hours ago' },
  { id: '2', name: 'news_segment.mp4', confidence: 8, date: '1 day ago' },
  { id: '3', name: 'social_media_clip.mp4', confidence: 87, date: '3 days ago' },
];

export const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Settings
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Theme Selector */}
              <Card className="glass transition-smooth">
                <CardHeader>
                  <CardTitle className="text-lg">Appearance</CardTitle>
                  <CardDescription>Choose your preferred theme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {themeOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        theme === option.value
                          ? 'border-primary bg-primary/10 shadow-glow-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`${theme === option.value ? 'text-primary' : 'text-muted-foreground'}`}>
                          {option.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </CardContent>
              </Card>

              {/* Profile Section */}
              <Card className="glass transition-smooth">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile
                  </CardTitle>
                  <CardDescription>Manage your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" placeholder="Your name" className="glass-strong" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" className="glass-strong" disabled />
                    <p className="text-xs text-muted-foreground">Email changes coming soon</p>
                  </div>
                  <Separator />
                  <Button variant="outline" className="w-full">
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="glass transition-smooth">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Recent Uploads
                  </CardTitle>
                  <CardDescription>Your latest video analyses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockRecentUploads.map((upload) => (
                    <motion.div
                      key={upload.id}
                      whileHover={{ x: 4 }}
                      className="p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-smooth"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{upload.name}</p>
                          <p className="text-xs text-muted-foreground">{upload.date}</p>
                        </div>
                        <div className={`ml-3 text-sm font-bold ${
                          upload.confidence > 50 ? 'text-success' : 'text-destructive'
                        }`}>
                          {upload.confidence}%
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    {/* Future enhancement: expand to full result logs and downloadable reports */}
                    Full history and detailed logs coming soon
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
