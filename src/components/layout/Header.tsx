"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Vote, Cloud, RefreshCw } from 'lucide-react';
import { useUserContext } from '@/context/UserContext';
import styles from './Header.module.css';

export const Header = () => {
  const pathname = usePathname();
  const { isSyncing, user, profile } = useUserContext();

  const isLinkActive = (href: string) => {
    if (href === '/' && pathname !== '/') return false;
    return pathname.startsWith(href);
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContainer}`}>
        <div className={styles.logoWrapper}>
          <Link href="/" className={styles.logo} aria-label="VoteGuide AI Home">
            <Vote className={styles.icon} aria-hidden="true" />
            <span className={styles.title}>VoteGuide AI</span>
          </Link>
          
          {user && (
            <div className={`${styles.syncStatus} ${isSyncing ? styles.syncing : ''}`} title={isSyncing ? "Saving to cloud..." : "Saved to cloud"}>
              {isSyncing ? (
                <RefreshCw size={14} className={styles.spin} />
              ) : (
                <Cloud size={14} />
              )}
              <span className={styles.syncText}>
                {isSyncing ? 'Syncing...' : (profile ? 'Synced' : 'Local')}
              </span>
            </div>
          )}
        </div>
        <nav aria-label="Main Navigation">
          <ul className={styles.navList}>
            <li>
              <Link
                href="/guide"
                className={`${styles.navLink} ${isLinkActive('/guide') ? styles.active : ''}`}
              >
                What&apos;s Next
              </Link>
            </li>
            <li>
              <Link
                href="/myths"
                className={`${styles.navLink} ${isLinkActive('/myths') ? styles.active : ''}`}
              >
                Myth Buster
              </Link>
            </li>
            <li>
              <Link
                href={profile ? "/journey" : "/onboarding"}
                className={`${styles.navLink} ${isLinkActive('/onboarding') || isLinkActive('/journey') ? styles.active : ''}`}
              >
                My Journey
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
