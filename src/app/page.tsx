"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/context/UserContext';
import { Button } from '@/components/ui/Button';
import { ArrowRight, BookOpen, Clock, ShieldCheck } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const { profile, isHydrated } = useUserContext();

  // If user already has a profile, we might want to suggest going to their journey
  const hasProfile = isHydrated && profile !== null;

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <span>New</span>
              <span className={styles.badgeText}>2026 Elections Guide Available</span>
            </div>
            
            <h1 className={styles.heroTitle}>
              Navigate the election process with <span className={styles.gradientText}>confidence.</span>
            </h1>
            
            <p className={styles.heroSubtitle}>
              Your interactive, step-by-step civic companion. We cut through the confusion, personalize your timeline, and make sure you never miss a deadline.
            </p>
            
            <div className={styles.heroActions}>
              <Button size="lg" onClick={() => router.push(hasProfile ? '/journey' : '/onboarding')}>
                {hasProfile ? 'View My Journey' : 'Get Started'} <ArrowRight size={20} />
              </Button>
              <Button size="lg" variant="secondary" onClick={() => router.push('/myths')}>
                Bust Election Myths
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className="container">
          <h2 className="visually-hidden">Key Features</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIconContainer}>
                <Clock size={28} className={styles.featureIcon} />
              </div>
              <h3 className={styles.featureTitle}>Personalized Timeline</h3>
              <p className={styles.featureDesc}>
                Tell us a bit about yourself, and we&apos;ll build a custom timeline showing exactly what you need to do and when.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIconContainer}>
                <ShieldCheck size={28} className={styles.featureIcon} />
              </div>
              <h3 className={styles.featureTitle}>Fight Misinformation</h3>
              <p className={styles.featureDesc}>
                Access our Myth Buster to separate fact from fiction. Understand common rumors and learn the actual rules.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIconContainer}>
                <BookOpen size={28} className={styles.featureIcon} />
              </div>
              <h3 className={styles.featureTitle}>Clear & Accessible</h3>
              <p className={styles.featureDesc}>
                No complicated legal jargon. We use plain language and offer read-aloud features to make the process accessible to everyone.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
