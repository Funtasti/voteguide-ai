import Link from 'next/link';
import { Vote, ExternalLink } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.brand}>
          <Vote className={styles.brandIcon} aria-hidden="true" />
          <span className={styles.brandName}>VoteGuide AI</span>
          <p className={styles.tagline}>Your civic companion for informed voting.</p>
        </div>

        <nav aria-label="Footer Navigation" className={styles.linksGrid}>
          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Get Started</h3>
            <ul>
              <li><Link href="/onboarding" className={styles.link}>Set Up My Journey</Link></li>
              <li><Link href="/journey" className={styles.link}>View Timeline</Link></li>
              <li><Link href="/guide" className={styles.link}>What Happens Next</Link></li>
            </ul>
          </div>
          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Learn</h3>
            <ul>
              <li><Link href="/myths" className={styles.link}>Myth Buster</Link></li>
            </ul>
          </div>
          <div className={styles.linkGroup}>
            <h3 className={styles.linkGroupTitle}>Official Resources</h3>
            <ul>
              <li>
                <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer" className={styles.link}>
                  Election Commission of India <ExternalLink size={12} aria-label="(opens in new tab)" />
                </a>
              </li>
              <li>
                <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer" className={styles.link}>
                  Voter Helpline Portal <ExternalLink size={12} aria-label="(opens in new tab)" />
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className={styles.bottomBar}>
        <p className={styles.disclaimer}>
          VoteGuide AI is an independent civic information tool. Always verify deadlines with your official
          Election Commission of India resources.
        </p>
        <p className={styles.copyright}>&copy; {new Date().getFullYear()} VoteGuide AI</p>
      </div>
    </footer>
  );
};
