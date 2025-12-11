import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Shield, Menu, X, Settings } from 'lucide-react';
import { SettingsPanel } from '@/components/SettingsPanel';
import { useAuth } from '@/hooks/useAuth';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/30"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.button
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              <span className="text-xl sm:text-2xl font-bold text-gradient">
                Aura Veracity
              </span>
            </motion.button>

            {/* Desktop navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((item) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className="relative text-muted-foreground hover:text-foreground transition-smooth"
                  whileHover={{ y: -2 }}
                >
                  {item.label}
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSettingsOpen(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-5 h-5" />
              </Button>
              {user ? (
                <Button 
                  variant="default"
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/auth?mode=signin')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="default"
                    onClick={() => navigate('/auth?mode=signup')}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="lg:hidden mt-4 pt-4 border-t border-border/30"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col gap-3">
                  {navLinks.map((item, index) => (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground transition-smooth py-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </motion.a>
                  ))}
                  <div className="flex flex-col gap-2 pt-4 border-t border-border/30">
                    {user ? (
                      <Button 
                        variant="default"
                        className="justify-start"
                        onClick={() => {
                          navigate('/dashboard');
                          setIsOpen(false);
                        }}
                      >
                        Dashboard
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="ghost" 
                          className="justify-start"
                          onClick={() => {
                            navigate('/auth?mode=signin');
                            setIsOpen(false);
                          }}
                        >
                          Sign In
                        </Button>
                        <Button 
                          variant="default"
                          className="justify-start"
                          onClick={() => {
                            navigate('/auth?mode=signup');
                            setIsOpen(false);
                          }}
                        >
                          Get Started
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </>
  );
};

export default Navbar;
