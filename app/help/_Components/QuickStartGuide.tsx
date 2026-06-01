'use client';

import { ArrowLeft, CheckCircle, User, Settings, Play, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface QuickStartGuideProps {
  onBack: () => void;
}

const quickStartSteps = [
  {
    id: 1,
    title: 'Create Your Account',
    description: 'Sign up with your Codeforces handle and create a secure PIN',
    icon: User,
    time: '2 minutes',
    steps: [
      'Go to the homepage and click on the register/login area',
      'Enter your Codeforces handle exactly as it appears on Codeforces',
      'Create a secure 4-digit PIN (remember this for future logins)',
      'The system will automatically fetch your profile data',
      'Complete the registration process',
    ],
    tips: [
      'Make sure your Codeforces handle is spelled correctly',
      'Choose a PIN that you can remember but others cannot guess',
      'Your profile will sync automatically with Codeforces data',
    ],
  },
  {
    id: 2,
    title: 'Set Up Your Profile',
    description: 'Sync your Codeforces data and configure your preferences',
    icon: Settings,
    time: '3 minutes',
    steps: [
      'After logging in, click on your profile avatar',
      'Select "Sync Profile" to update your latest data',
      'Review your statistics and performance metrics',
      'Adjust theme settings (dark/light mode) if desired',
      'Explore the notification center (bell icon)',
    ],
    tips: [
      'Profile sync updates your rating, solved problems, and submissions',
      'Sync regularly to keep your data current',
      'Check notifications for important updates and announcements',
    ],
  },
  {
    id: 3,
    title: 'Start Your First Practice Session',
    description: 'Generate problems and begin practicing with customized difficulty',
    icon: Play,
    time: '5 minutes',
    steps: [
      'Navigate to the "Training" page from the main menu',
      'Select your preferred difficulty level or set a custom rating range',
      'Choose specific problem tags to focus on (optional)',
      'Set the number of problems you want to practice',
      'Click "Generate Problems" to start your session',
      'Work through problems and track your progress',
    ],
    tips: [
      'Start with easier problems if you are new to competitive programming',
      'Focus on specific tags to improve weak areas',
      'Take breaks between problems to avoid fatigue',
    ],
  },
  {
    id: 4,
    title: 'Track Your Progress',
    description: 'Monitor your performance and analyze your improvement',
    icon: BarChart,
    time: '2 minutes',
    steps: [
      'Visit the "Statistics" page to view your analytics',
      'Review your activity heatmap to see daily practice',
      'Analyze your rating progression over time',
      'Check your problem-solving speed and accuracy',
      'Identify areas for improvement based on tag performance',
    ],
    tips: [
      'Regular practice shows better results in the heatmap',
      'Focus on consistency rather than solving many problems at once',
      'Use statistics to identify your strong and weak problem categories',
    ],
  },
];

export default function QuickStartGuide({ onBack }: Readonly<QuickStartGuideProps>) {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-primary/10 hover:text-primary border border-border/40 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Onboarding Protocol</span>
              <div className="h-[1px] w-6 bg-primary/30" />
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tight">Mission Directive</h1>
          </div>
        </div>
      </div>

      {/* Progress Overview Card */}
      <Card className="relative overflow-hidden border-border/40 bg-primary/5 backdrop-blur-xl rounded-[2.5rem] border-dashed">
        <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black text-foreground tracking-tight uppercase">Operational Readiness</h3>
            <p className="text-muted-foreground font-medium max-w-md">
              Complete these 4 tactical steps to achieve full synchronization with the Training Tracker network.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-black text-primary leading-none">12</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Minutes</div>
            </div>
            <div className="h-10 w-[1px] bg-border/40" />
            <div className="text-center">
              <div className="text-4xl font-black text-foreground leading-none">04</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Stages</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vertical Timeline Steps */}
      <div className="relative space-y-8 before:absolute before:left-8 before:top-10 before:bottom-10 before:w-[1px] before:bg-gradient-to-b before:from-primary/40 before:via-border/40 before:to-transparent">
        {quickStartSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-24"
            >
              {/* Step Indicator */}
              <div className="absolute left-0 top-2 flex items-center justify-center">
                <div className="h-16 w-16 rounded-2xl bg-card border border-border/40 flex items-center justify-center shadow-2xl relative z-10 group">
                  <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                  <Icon className="h-7 w-7 text-primary relative z-20" />
                </div>
              </div>

              <Card className="border-border/40 bg-card/20 backdrop-blur-xl rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all duration-500">
                <CardContent className="p-8 sm:p-10 space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Stage 0{step.id}</span>
                        <Badge variant="outline" className="rounded-lg bg-white/5 border-border/40 text-[9px] font-black tracking-widest px-2 py-0.5 opacity-60">
                          {step.time.toUpperCase()}
                        </Badge>
                      </div>
                      <h3 className="text-2xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{step.title}</h3>
                    </div>
                  </div>

                  <p className="text-muted-foreground font-medium leading-relaxed opacity-80">{step.description}</p>

                  <div className="grid md:grid-cols-2 gap-10 pt-6 border-t border-border/20">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Mission Checklist</h4>
                      <div className="space-y-3">
                        {step.steps.map((s) => (
                          <div key={`step-${step.id}-${s}`} className="flex items-start gap-3">
                            <div className="mt-1 h-4 w-4 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                              <CheckCircle size={10} />
                            </div>
                            <span className="text-sm text-muted-foreground font-medium leading-tight">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 p-6 rounded-2xl bg-white/5 border border-border/40">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/80">Intelligence Brief</h4>
                      <div className="space-y-3">
                        {step.tips.map((tip) => (
                          <div key={`tip-${step.id}-${tip}`} className="flex items-start gap-3">
                            <div className="mt-2 h-1 w-1 rounded-full bg-amber-500/40 shrink-0" />
                            <span className="text-xs text-muted-foreground/80 font-medium leading-relaxed italic">"{tip}"</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Final Call to Action */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <Card className="border-border/40 bg-emerald-500/5 backdrop-blur-xl rounded-[3rem] overflow-hidden p-10 sm:p-16 text-center space-y-8 relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] -z-10" />
          <div className="space-y-4">
            <div className="h-20 w-20 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500 shadow-2xl shadow-emerald-500/20">
              <CheckCircle size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-foreground tracking-tight">Operational!</h2>
              <p className="text-muted-foreground font-medium max-w-sm mx-auto opacity-80">
                Onboarding protocol complete. You are now authorized to initiate high-performance practice sessions.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="w-full sm:w-auto h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all"
              onClick={() => globalThis.location.href = '/training'}
            >
              Initiate Training
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="w-full sm:w-auto h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs border-border/40 bg-white/5 hover:bg-white/10 transition-all"
              onClick={() => globalThis.location.href = '/statistics'}
            >
              System Analytics
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}







