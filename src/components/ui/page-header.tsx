import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  onSettingsClick?: () => void;
  actions?: React.ReactNode;
  showBackButton?: boolean;
  backTo?: string;
}

export const PageHeader = ({ 
  title = 'Aura Veracity',
  subtitle,
  onSettingsClick,
  actions,
  showBackButton = false,
  backTo = '/dashboard'
}: PageHeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 border-b border-border/50 bg-card/80 backdrop-blur-lg"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(backTo)}
                className="transition-smooth hover:bg-primary/10"
              >
                ← Back
              </Button>
            )}
            <motion.button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Shield className="w-7 h-7 text-primary" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {title}
                </h1>
                {subtitle && (
                  <span className="text-sm text-muted-foreground">{subtitle}</span>
                )}
              </div>
            </motion.button>
          </div>
          
          <div className="flex items-center gap-2">
            {actions}
            {onSettingsClick && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onSettingsClick}
                className="transition-smooth hover:bg-primary/10 hover:text-primary"
              >
                <Settings className="w-5 h-5" />
              </Button>
            )}
            {user && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={signOut}
                className="transition-smooth hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};
