import { motion } from 'framer-motion';
import { Check, Zap, Building2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    icon: Zap,
    price: '₹0',
    period: '/month',
    description: 'Perfect for individuals exploring deepfake detection.',
    features: [
      '5 video analyses per month',
      'Basic confidence scores',
      'Max 50MB file size',
      'Email support',
      'Standard processing speed',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Professional',
    icon: Crown,
    price: '₹999',
    period: '/month',
    description: 'For journalists, fact-checkers, and content creators.',
    features: [
      '100 video analyses per month',
      'Detailed analysis reports',
      'Max 500MB file size',
      'Priority processing',
      'Frame-level heatmaps',
      'API access (1000 calls)',
      'Priority email & chat support',
    ],
    cta: 'Start Professional',
    popular: true,
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: 'Custom',
    period: '',
    description: 'For organizations, media houses, and government agencies.',
    features: [
      'Unlimited video analyses',
      'Custom model training',
      'Unlimited file size',
      'Dedicated infrastructure',
      'White-label solution',
      'Full API access',
      'On-premise deployment option',
      '24/7 dedicated support',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Simple, Transparent <span className="text-gradient">Pricing</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. All prices in Indian Rupees (₹). GST applicable.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`glass-strong p-8 rounded-2xl border relative ${
                plan.popular 
                  ? 'border-primary shadow-lg shadow-primary/20' 
                  : 'border-border/30'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <plan.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              </div>
              
              <div className="mb-4">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              
              <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => navigate('/auth?mode=signup')}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* India-specific note */}
        <motion.p
          className="text-center text-muted-foreground text-sm mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          Special discounts available for Indian government agencies, educational institutions, and registered NGOs.
          <br />
          Contact us at <span className="text-primary">enterprise@auraveracity.in</span>
        </motion.p>
      </div>
    </section>
  );
};

export default Pricing;
