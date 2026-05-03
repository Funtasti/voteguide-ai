"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/context/UserContext';
import { mockIndianElectionData } from '@/data/indianElections';
import { getElectionConfig } from '@/lib/firebase/services';
import { ElectionData } from '@/data/indianElections';
import { Button } from '@/components/ui/Button';
import { Calendar, CheckCircle, Clock, AlertTriangle, FileText, ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import styles from './page.module.css';

/**
 * JOURNEY PAGE
 * ------------
 * This is the personalized dashboard for the user.
 * It combines their Profile (stored in Context/Cloud) with real-time Election Data
 * to generate a custom timeline of events and deadlines.
 */
export default function Journey() {
  const { profile, isHydrated } = useUserContext();
  const router = useRouter();
  
  // --- LOCAL STATE ---
  const [mounted, setMounted] = useState(false);         // Prevents hydration mismatch
  const [electionData, setElectionData] = useState<ElectionData | null>(null); // Fetched from Firestore
  const [isLoadingConfig, setIsLoadingConfig] = useState(true); // Loading state for DB fetch
  const [showAllDocs, setShowAllDocs] = useState(false); // Controls document list expansion

  /**
   * HYDRATION GUARD
   * Ensures the component only renders client-specific data after mounting.
   */
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  /**
   * DATA FETCHING LIFECYCLE
   * Fetches regional election configuration when the profile region is available.
   */
  useEffect(() => {
    const fetchConfig = async () => {
      if (profile?.region) {
        setIsLoadingConfig(true);
        const config = await getElectionConfig(profile.region);
        setElectionData(config || mockIndianElectionData);
        setIsLoadingConfig(false);
      }
    };

    if (mounted) {
      fetchConfig();
    }
  }, [profile?.region, mounted]);

  // Ensure client-side rendering only after hydration
  if (!isHydrated || !mounted) return null;

  // Empty State: Route user back to onboarding if no profile exists
  if (!profile) {
    return (
      <div className={`container ${styles.emptyState}`}>
        <h2>You haven&apos;t set up your journey yet</h2>
        <p>Take a quick 2-minute setup to get your personalized election timeline.</p>
        <Button onClick={() => router.push('/onboarding')}>Start Setup</Button>
      </div>
    );
  }

  // Loading State: While fetching from Firestore
  if (isLoadingConfig || !electionData) {
    return (
      <div className={`container ${styles.loadingState}`}>
        <Loader2 className={styles.spinner} size={48} />
        <p>Loading your personalized journey...</p>
      </div>
    );
  }

  const { phases, deadlines, documentsRequired } = electionData;

  /**
   * UI HELPER: Phase Icon Logic
   * Determines the status icon (Done, Current, Future) for timeline phases.
   */
  const getIconForPhase = (title: string, isPast: boolean) => {
    if (isPast) return <CheckCircle className={styles.iconPast} />;
    if (title.includes('Polling')) return <AlertTriangle className={styles.iconCurrent} />;
    return <Clock className={styles.iconFuture} />;
  };

  return (
    <div className={`container ${styles.journeyContainer}`}>
      {/* Header with User Info */}
      <header className={styles.header}>
        <div className={styles.headerTitleRow}>
          <h1>Your Election Journey</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/onboarding')}
            className={styles.retakeBtn}
          >
            <RotateCcw size={14} /> Retake Questionnaire
          </Button>
        </div>
        <p>Region: <strong>{profile.region}</strong> {profile.isFirstTimeVoter && <span className={styles.badge}>First-Time Voter</span>}</p>
      </header>

      <div className={styles.contentGrid}>
        {/* Main Timeline Section */}
        <div className={styles.timelineSection}>
          <h2>Timeline</h2>
          <div className={styles.timeline}>
            {phases.map((phase, index) => (
              <div key={phase.id} className={`${styles.timelineItem} ${phase.isPast ? styles.past : ''}`}>
                <div className={styles.timelineIconContainer}>
                  {getIconForPhase(phase.title, phase.isPast || false)}
                  {index !== phases.length - 1 && <div className={styles.timelineLine} />}
                </div>
                <div className={styles.timelineContent}>
                  <h3 className={styles.phaseTitle}>{phase.title}</h3>
                  <div className={styles.phaseDate}>
                    <Calendar size={14} />
                    <span>{new Date(phase.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <p className={styles.phaseDescription}>{phase.description}</p>

                  {/* Contextual Action: Only show booth finder for active/future polling steps */}
                  {(!phase.isPast) && phase.title.includes('Polling') && (
                    <Button size="sm" className={styles.actionBtn} onClick={() => window.open("https://electoralsearch.eci.gov.in/pollingstation", "_blank")}>
                      Find My Booth <ArrowRight size={14} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Contextual Info & Quick Links */}
        <div className={styles.sidebar}>
          {/* User Concerns Summary */}
          <div className={styles.card}>
            <h3>Need Help?</h3>
            <ul className={styles.helpList}>
              {profile.concerns.map(concern => (
                <li key={concern}>
                  <CheckCircle size={16} className={styles.checkIcon} />
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" fullWidth onClick={() => router.push('/myths')}>
              Go to Myth Buster
            </Button>
          </div>

          {/* Critical Deadlines Card */}
          <div className={`${styles.card} ${styles.alertCard}`}>
            <h3>Important Deadlines</h3>
            <div className={styles.deadlineItem}>
              <span className={styles.deadlineLabel}>Voter Registration:</span>
              <span className={styles.deadlineDate}>{new Date(deadlines.voterRegistration).toLocaleDateString('en-IN')}</span>
            </div>
            <div className={styles.deadlineItem}>
              <span className={styles.deadlineLabel}>Corrections:</span>
              <span className={styles.deadlineDate}>{new Date(deadlines.correction).toLocaleDateString('en-IN')}</span>
            </div>
          </div>

          {/* Document Checklist Card */}
          <div className={styles.card}>
            <h3><FileText size={18} /> Required Documents</h3>
            <p className={styles.docDesc}>Bring ONE of these to the polling booth:</p>
            <ul className={styles.docList}>
              {(showAllDocs ? documentsRequired : documentsRequired.slice(0, 3)).map(doc => (
                <li key={doc}>{doc}</li>
              ))}
              {!showAllDocs && documentsRequired.length > 3 && (
                <li>
                  <button 
                    className={styles.linkButton} 
                    onClick={() => setShowAllDocs(true)}
                  >
                    + View {documentsRequired.length - 3} more options
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

