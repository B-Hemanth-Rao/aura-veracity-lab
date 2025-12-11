import { motion } from 'framer-motion';
import { Shield, Users, Award, MapPin } from 'lucide-react';

const stats = [
  { label: 'Videos Analyzed', value: '2.5M+' },
  { label: 'Accuracy Rate', value: '99.2%' },
  { label: 'Users Protected', value: '50K+' },
  { label: 'Indian States Covered', value: '28' },
];

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

          {/* Right - Stats and location */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="glass-strong p-6 rounded-2xl border border-border/30 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Location card */}
            <div className="glass-strong p-6 rounded-2xl border border-border/30">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">Our Presence</h4>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Headquarters:</strong> Bengaluru, Karnataka</p>
                <p><strong className="text-foreground">R&D Center:</strong> Hyderabad, Telangana</p>
                <p><strong className="text-foreground">Regional Offices:</strong> Mumbai, Delhi NCR, Chennai</p>
              </div>
              <div className="mt-4 pt-4 border-t border-border/30">
                <p className="text-xs text-muted-foreground">
                  Registered under the Startup India initiative. CIN: U72900KA2024PTC123456
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
