import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Brain, Zap } from "lucide-react";
import heroImage from "@/assets/hero-neural-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Neural Network Background" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <motion.div
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Advanced AI Detection Technology
            </span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-bold leading-tight mb-6">
            <span className="text-foreground">Separate</span>
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Truth
            </span>
            {" "}
            <span className="text-foreground">from</span>
            <br />
            <span className="bg-gradient-secondary bg-clip-text text-transparent">
              Deception
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Aura Veracity uses cutting-edge multimodal AI to detect deepfakes with unprecedented accuracy. 
            Upload any video and get instant, reliable authenticity analysis.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Button variant="hero" size="lg" className="text-lg px-8 py-6" onClick={() => window.location.href = '/auth?mode=signup'}>
            <Brain className="w-5 h-5 mr-2" />
            Sign Up
          </Button>
          <Button variant="glass" size="lg" className="text-lg px-8 py-6" onClick={() => window.location.href = '/auth?mode=signin'}>
            Login
          </Button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          {[
            {
              icon: Brain,
              title: "Multimodal Analysis",
              description: "Analyzes both video frames and audio signals for comprehensive detection"
            },
            {
              icon: Shield,
              title: "99.7% Accuracy",
              description: "State-of-the-art neural networks trained on millions of samples"
            },
            {
              icon: Zap,
              title: "Instant Results",
              description: "Get detailed authenticity reports in seconds, not minutes"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="glass-strong p-6 rounded-xl hover:scale-105 transition-smooth"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.2, duration: 0.6 }}
            >
              <feature.icon className="w-8 h-8 text-primary mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;