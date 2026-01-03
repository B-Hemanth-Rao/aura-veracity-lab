import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, Theme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ctrl+U: Go to upload/dashboard
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        navigate('/dashboard');
        toast.info('Navigated to Upload', { duration: 1500 });
      }

      // Ctrl+T: Toggle theme (dark <-> light)
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        toast.info(`Theme: ${newTheme}`, { duration: 1500 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, theme, setTheme]);
};
