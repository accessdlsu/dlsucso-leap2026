import { Info } from 'lucide-react';
import styles from '../App.module.css';

interface FooterProps {
  logoImg: string;
  onNavigate: (view: string) => void;
}

export const Footer = ({ logoImg, onNavigate }: FooterProps) => (
  <footer className={styles.footer}>
    <div className={styles.footerContainer}>
      <div className={styles.footerBrand}>
        <div className={styles.footerLogoWrapper}>
          <img
            src={logoImg}
            alt="LEAP 2026"
            width="120"
            height="68"
            className={styles.footerLogo}
          />
        </div>
        <p className={styles.footerBrandText}>
          Lasallian Enrichment Alternative Program. Empowering students through
          diverse learning experiences and community building.
        </p>
        <div className={styles.footerSocialIcons}>
          <div className={styles.footerSocialIcon}>
            <Info size={16} />
          </div>
        </div>
      </div>
      <div>
        <h4 className={styles.footerColumnTitle}>Quick Links</h4>
        <ul className={styles.footerColumnLinks}>
          <li>
            <button
              onClick={() => onNavigate('about')}
              className={styles.footerLink}
            >
              About LEAP
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate('classes')}
              className={styles.footerLink}
            >
              Class List
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate('major-events')}
              className={styles.footerLink}
            >
              Major Events
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate('faq')}
              className={styles.footerLink}
            >
              FAQs
            </button>
          </li>
        </ul>
      </div>
      <div>
        <h4 className={styles.footerColumnTitle}>Support</h4>
        <ul className={styles.footerColumnLinks}>
          <li>
            <button
              onClick={() => onNavigate('contact')}
              className={styles.footerLink}
            >
              Contact OPS
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate('contact')}
              className={styles.footerLink}
            >
              Technical Issues
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate('contact')}
              className={styles.footerLink}
            >
              Privacy Policy
            </button>
          </li>
        </ul>
      </div>
    </div>
    <div className={styles.footerBottom}>
      <p>© LEAP 2026 · CSO · DLSU</p>
      <p style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.35rem' }}>Made by Association of Computer Engineering Students (ACCESS DLSU)</p>
    </div>
  </footer>
);
