"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  IdCard, 
  Fingerprint, 
  Touchpad, 
  FileText, 
  LogOut, 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';
import styles from './VotingProcess.module.css';

const STEPS = [
  {
    id: 1,
    title: "Voter Arrives",
    icon: <User size={32} />,
    desc: "Voter enters the polling station and joins the queue."
  },
  {
    id: 2,
    title: "Identity Verification",
    icon: <IdCard size={32} />,
    desc: "First Polling Officer checks your name on the voter list and verifies your ID."
  },
  {
    id: 3,
    title: "Finger Ink Mark",
    icon: <Fingerprint size={32} />,
    desc: "Second Polling Officer marks your left forefinger with indelible ink."
  },
  {
    id: 4,
    title: "Vote Cast on EVM",
    icon: <Touchpad size={32} />,
    desc: "You enter the voting compartment and press the blue button next to your candidate on the EVM."
  },
  {
    id: 5,
    title: "VVPAT Slip",
    icon: <FileText size={32} />,
    desc: "The VVPAT machine displays a slip through a glass window for 7 seconds to confirm your choice."
  },
  {
    id: 6,
    title: "Voter Exits",
    icon: <LogOut size={32} />,
    desc: "Process complete! You leave the station with your inked finger as proof of voting."
  }
];

export const VotingProcess = () => {
  const [activeStep, setActiveStep] = useState(0);

  const nextStep = () => {
    if (activeStep < STEPS.length - 1) setActiveStep(activeStep + 1);
  };

  const prevStep = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Booth Flow: A Visual Guide</h3>
      
      {/* Progress Dots */}
      <div className={styles.progressHeader}>
        {STEPS.map((_, index) => (
          <div 
            key={index} 
            className={`${styles.dot} ${index <= activeStep ? styles.dotActive : ''}`}
            onClick={() => setActiveStep(index)}
          />
        ))}
      </div>

      <div className={styles.card}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={styles.stepContent}
          >
            <div className={styles.iconContainer}>
              {STEPS[activeStep].icon}
            </div>
            <div className={styles.textContainer}>
              <span className={styles.stepNumber}>Step {STEPS[activeStep].id}</span>
              <h4 className={styles.stepTitle}>{STEPS[activeStep].title}</h4>
              <p className={styles.stepDesc}>{STEPS[activeStep].desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className={styles.controls}>
          <button 
            onClick={prevStep} 
            disabled={activeStep === 0}
            className={styles.navBtn}
            aria-label="Previous step"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className={styles.indicator}>
            {activeStep + 1} / {STEPS.length}
          </div>

          <button 
            onClick={nextStep} 
            disabled={activeStep === STEPS.length - 1}
            className={styles.navBtn}
            aria-label="Next step"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
