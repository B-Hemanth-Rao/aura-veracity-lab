import { motion } from 'framer-motion';
import { Shield, Users, Award } from 'lucide-react';


const About = () => {
  return (
    <section id="about" className="py-24 px-4 sm:px-6 relative bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Protecting India's <span className="text-gradient">Digital Truth</span>
            </h2>
            
            <div className="space-y-4 text-muted-foreground">
              <p>
                Aura Veracity is India's leading deepfake detection platform, built by a team of 
                AI researchers and cybersecurity experts dedicated to combating synthetic media 
                misinformation.
              </p>
              <p>
                Founded in 2024, we recognized the growing threat of AI-generated fake videos 
                targeting Indian politicians, celebrities, and ordinary citizens. Our mission is 
                to empower every Indian with the tools to verify digital content authenticity.
              </p>
              <p>
                Our technology is developed in collaboration with premier Indian institutions and 
                is designed to understand the nuances of Indian languages, regional content, and 
                cultural context.
              </p>
            </div>

            {/* Key points */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Made in India</h4>
                  <p className="text-sm text-muted-foreground">
                    Proudly developed under the Digital India initiative, supporting Atmanirbhar Bharat.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Trusted Partners</h4>
                  <p className="text-sm text-muted-foreground">
                    Working with Indian media houses, fact-checking organizations, and law enforcement.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Recognized Excellence</h4>
                  <p className="text-sm text-muted-foreground">
                    Winner of NASSCOM AI Innovation Award 2024 and recognized by MeitY.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Vision card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Vision card */}
            <div className="glass-strong p-8 rounded-2xl border border-border/30">
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
              <p className="text-muted-foreground mb-6">
                To create a safer digital ecosystem where individuals and organizations can trust 
                the authenticity of media content. We believe in empowering users with cutting-edge 
                AI technology to combat misinformation.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-foreground">Continuous model improvement</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-foreground">Research-driven development</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-foreground">User privacy at the core</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
