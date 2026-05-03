"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/context/UserContext';
import { Button } from '@/components/ui/Button';
import {
  User, UserCheck, AlertTriangle, HelpCircle, ChevronRight, ArrowRight
} from 'lucide-react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';

/**
 * OPTIMIZATION: Dynamic Component Loading
 * --------------------------------------
 * We use next/dynamic to lazy-load the interactive VotingProcess component.
 * This keeps the initial 'Guide' page bundle small and efficient.
 */
const VotingProcess = dynamic(() => import('@/components/ui/VotingProcess').then(mod => mod.VotingProcess), {
  loading: () => <div style={{ height: '200px', background: '#f1f5f9', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Animation...</div>,
  ssr: false
});

/**
 * SCENARIO TYPES & INTERFACES
 */
type ScenarioId = 'first-time' | 'missed-deadline' | 'confused' | 'returning';

interface Scenario {
  id: ScenarioId;
  icon: React.ReactNode;
  label: string;
  description: string;
}

interface Step {
  title: string;
  detail: string;
  action?: { label: string; href: string };
}

const SCENARIOS: Scenario[] = [
  {
    id: 'first-time',
    icon: <User size={28} />,
    label: 'I just turned 18',
    description: 'New to voting — find out what to do first.',
  },
  {
    id: 'returning',
    icon: <UserCheck size={28} />,
    label: 'I have voted before',
    description: 'Quick refresher on what changed and what to verify.',
  },
  {
    id: 'missed-deadline',
    icon: <AlertTriangle size={28} />,
    label: 'I missed a deadline',
    description: "Don't panic — see what options are still available.",
  },
  {
    id: 'confused',
    icon: <HelpCircle size={28} />,
    label: 'I don\'t understand the process',
    description: 'Step-by-step breakdown from scratch, plain and simple.',
  },
];

const SCENARIO_STEPS: Record<ScenarioId, Step[]> = {
  'first-time': [
    {
      title: '✅ Check your eligibility',
      detail: 'You must be 18 years old on or before January 1st of the election year and be an Indian citizen to vote in Lok Sabha elections.',
    },
    {
      title: '📝 Register as a voter',
      detail: 'Fill Form 6 online at the Voter Helpline App or NVSP portal (voters.eci.gov.in). You need a photo ID and proof of address.',
      action: { label: 'Go to ECI Registration', href: 'https://voters.eci.gov.in' },
    },
    {
      title: '⏳ Wait for verification',
      detail: 'A Booth Level Officer (BLO) will verify your details at your address. This can take a few weeks — apply early!',
    },
    {
      title: '🔍 Confirm your name on the rolls',
      detail: 'After the final voter list is published, search for your name on the ECI portal. No name = no vote.',
      action: { label: 'Search your name', href: 'https://electoralsearch.eci.gov.in' },
    },
    {
      title: '🏛️ Vote on polling day',
      detail: 'Carry your Voter ID (or any approved alternative ID) and go to your assigned polling booth. The booth address is printed on your Voter Slip.',
    },
  ],
  'returning': [
    {
      title: '🔍 Verify your details are correct',
      detail: 'Search your name on the ECI portal to confirm your name, address, and polling booth are still accurate.',
      action: { label: 'Search your name', href: 'https://electoralsearch.eci.gov.in' },
    },
    {
      title: '✏️ Update if anything changed',
      detail: 'Moved house? Changed your name? File Form 8 (correction) or Form 6 (new constituency) before the deadline.',
    },
    {
      title: '📅 Know your polling date',
      detail: 'India uses a multi-phase election. Check ECI to see which phase your constituency falls under.',
    },
    {
      title: '🏛️ Cast your vote',
      detail: "Bring an approved ID to your assigned booth. You'll press the EVM button for your preferred candidate.",
    },
  ],
  'missed-deadline': [
    {
      title: '🔍 First — check if your name is already registered',
      detail: 'You may already be on the voter list from a previous registration. Check immediately on the ECI portal.',
      action: { label: 'Search your name', href: 'https://electoralsearch.eci.gov.in' },
    },
    {
      title: '📞 Contact your BLO or ERO',
      detail: 'Your Booth Level Officer or Electoral Registration Officer may still be able to assist in special circumstances. Find them via the Voter Helpline (1950).',
    },
    {
      title: '📋 Prepare for the next election',
      detail: 'Missing this deadline does not mean you are permanently excluded. Register well before the next election cycle. Voter lists are updated quarterly.',
    },
    {
      title: '🚫 What NOT to do',
      detail: 'Do not try to vote without being on the roll — it will not work and is illegal. Do not trust anyone who claims they can "add you on the day".',
    },
  ],
  'confused': [
    {
      title: '🇮🇳 What is the Lok Sabha election?',
      detail: 'Every 5 years, Indian citizens vote to elect Members of Parliament (MPs) for the Lok Sabha (lower house). The party or coalition with the most MPs forms the government.',
    },
    {
      title: '📋 Are you on the voter list?',
      detail: 'The voter list (electoral roll) is the official register of who is allowed to vote. Your name must be on it. You can check online on the ECI portal.',
      action: { label: 'Check voter list', href: 'https://electoralsearch.eci.gov.in' },
    },
    {
      title: '🗓️ The election happens in phases',
      detail: 'Due to the size of India, voting happens across multiple days in different regions (phases). Only your phase date matters to you.',
    },
    {
      title: '🗳️ What happens at the booth?',
      detail: 'You show your ID, get your finger inked (to prevent double-voting), and press a button on an Electronic Voting Machine (EVM) next to your chosen candidate.',
    },
    {
      title: '📊 Counting & results',
      detail: 'Votes are counted on a declared date after all phases are complete. Results are announced publicly by the Election Commission.',
    },
  ],
};

export default function Guide() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const router = useRouter();
  const { profile } = useUserContext();

  const steps = selectedScenario ? SCENARIO_STEPS[selectedScenario] : [];

  const handleScenarioSelect = (id: ScenarioId) => {
    setSelectedScenario(id);
    setActiveStep(0);
  };

  const handleReset = () => {
    setSelectedScenario(null);
    setActiveStep(0);
  };

  return (
    <div className={`container ${styles.guideContainer}`}>
      <header className={styles.header}>
        <h1>What Happens Next?</h1>
        <p>Choose your situation and we&apos;ll walk you through exactly what to do, step by step.</p>
      </header>

      {!selectedScenario ? (
        <div className={styles.scenarioGrid}>
          {SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              className={styles.scenarioCard}
              onClick={() => handleScenarioSelect(scenario.id)}
              aria-label={`Scenario: ${scenario.label}`}
            >
              <div className={styles.scenarioIcon}>{scenario.icon}</div>
              <div className={styles.scenarioText}>
                <h2 className={styles.scenarioLabel}>{scenario.label}</h2>
                <p className={styles.scenarioDesc}>{scenario.description}</p>
              </div>
              <ChevronRight className={styles.scenarioArrow} size={20} />
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.stepsContainer}>
          <button className={styles.backBtn} onClick={handleReset}>
            ← Choose a different scenario
          </button>

          <div className={styles.stepsLayout}>
            {/* Step list sidebar */}
            <nav className={styles.stepNav} aria-label="Guide steps">
              {steps.map((step, index) => (
                <button
                  key={index}
                  className={`${styles.stepNavItem} ${index === activeStep ? styles.stepNavActive : ''} ${index < activeStep ? styles.stepNavDone : ''}`}
                  onClick={() => setActiveStep(index)}
                  aria-current={index === activeStep ? 'step' : undefined}
                >
                  <span className={styles.stepNumber}>{index + 1}</span>
                  <span className={styles.stepNavTitle}>{step.title}</span>
                </button>
              ))}
            </nav>

            {/* Active step detail */}
            <div className={styles.stepDetail} aria-live="polite">
              <div className={styles.stepCard}>
                <h2 className={styles.stepTitle}>{steps[activeStep].title}</h2>
                <p className={styles.stepDetail2}>{steps[activeStep].detail}</p>
                
                {/* Visual Animation for Voting Process */}
                {(steps[activeStep].title.toLowerCase().includes('vote') || 
                  steps[activeStep].title.toLowerCase().includes('booth')) && (
                  <VotingProcess />
                )}

                {steps[activeStep].action && (
                  <a
                    href={steps[activeStep].action!.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.stepActionLink}
                  >
                    {steps[activeStep].action!.label} <ArrowRight size={16} />
                  </a>
                )}
              </div>

              <div className={styles.stepActions}>
                <Button
                  variant="secondary"
                  onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                >
                  ← Previous
                </Button>
                {activeStep < steps.length - 1 ? (
                  <Button onClick={() => setActiveStep(activeStep + 1)}>
                    Next Step <ChevronRight size={18} />
                  </Button>
                ) : (
                  <Button onClick={() => router.push(profile ? '/journey' : '/onboarding')}>
                    {profile ? 'View My Timeline' : 'Set Up My Journey'} <ArrowRight size={18} />
                  </Button>
                )}
              </div>

              <div className={styles.stepProgress} aria-label={`Step ${activeStep + 1} of ${steps.length}`}>
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`${styles.stepDot} ${i <= activeStep ? styles.stepDotActive : ''}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
