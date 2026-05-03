"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/context/UserContext';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';
import { ChevronRight } from 'lucide-react';

const QUESTIONS = [
  {
    id: 'region',
    title: 'Where do you vote?',
    options: ['India (National)'],
    description: 'We currently support the national Lok Sabha elections for our mock data demo.'
  },
  {
    id: 'isFirstTimeVoter',
    title: 'Are you a first-time voter?',
    options: ['Yes, this is my first time', 'No, I have voted before'],
  },
  {
    id: 'concerns',
    title: 'What do you need help with the most?',
    options: ['Registering to vote / ID Card', 'Finding my polling booth', 'Understanding the process', 'Busting myths and rumors'],
    multiple: true
  }
];

export default function Onboarding() {
  const router = useRouter();
  const { saveProfile, isSyncing } = useUserContext();
  const [step, setStep] = useState(0);
  
  const [answers, setAnswers] = useState<Record<string, any>>({
    region: 'India (National)',
    isFirstTimeVoter: '',
    concerns: []
  });

  const currentQuestion = QUESTIONS[step];

  const handleOptionClick = (option: string) => {
    if (currentQuestion.multiple) {
      const currentSelection = answers[currentQuestion.id] as string[];
      if (currentSelection.includes(option)) {
        setAnswers({
          ...answers,
          [currentQuestion.id]: currentSelection.filter(item => item !== option)
        });
      } else {
        setAnswers({
          ...answers,
          [currentQuestion.id]: [...currentSelection, option]
        });
      }
    } else {
      setAnswers({
        ...answers,
        [currentQuestion.id]: option
      });
      // Auto-advance for single choice if it's not the last step
      if (step < QUESTIONS.length - 1) {
        setTimeout(() => setStep(step + 1), 300);
      }
    }
  };

  const handleNext = async () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // Save profile and redirect to journey
      await saveProfile({
        region: answers.region,
        isFirstTimeVoter: answers.isFirstTimeVoter === 'Yes, this is my first time',
        ageGroup: '18+', // simplified for demo
        concerns: answers.concerns
      });
      router.push('/journey');
    }
  };

  const isCurrentStepValid = () => {
    const value = answers[currentQuestion.id];
    if (currentQuestion.multiple) {
      return value.length > 0;
    }
    return !!value;
  };

  return (
    <div className={`container ${styles.onboardingContainer}`}>
      <div className={styles.progressContainer} aria-label={`Step ${step + 1} of ${QUESTIONS.length}`}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className={styles.questionCard}>
        <h1 className={styles.questionTitle}>{currentQuestion.title}</h1>
        {currentQuestion.description && (
          <p className={styles.questionDescription}>{currentQuestion.description}</p>
        )}

        <div className={styles.optionsList}>
          {currentQuestion.options.map(option => {
            const isSelected = currentQuestion.multiple 
              ? (answers[currentQuestion.id] as string[]).includes(option)
              : answers[currentQuestion.id] === option;

            return (
              <button
                key={option}
                className={`${styles.optionButton} ${isSelected ? styles.selected : ''}`}
                onClick={() => handleOptionClick(option)}
                aria-pressed={isSelected}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className={styles.actions}>
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <div /> // Spacer
          )}
          <Button 
            onClick={handleNext} 
            disabled={!isCurrentStepValid() || isSyncing}
          >
            {step === QUESTIONS.length - 1 
              ? (isSyncing ? 'Saving...' : 'See My Journey') 
              : 'Next'}
            {!isSyncing && <ChevronRight size={18} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
