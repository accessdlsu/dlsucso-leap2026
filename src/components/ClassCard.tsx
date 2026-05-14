import { motion } from 'framer-motion';
import { Calendar, MapPin, Bookmark, ExternalLink, ChevronRight } from 'lucide-react';
import type { LeapClass } from '../types';
import styles from '../App.module.css';

interface ClassCardProps {
  item: LeapClass;
  index: number;
  isLoggedIn: boolean;
  isSaved: boolean;
  onToggleSave: (classId: string) => void;
  onLearnMore: (item: LeapClass) => void;
}

export const ClassCard = ({
  item,
  index,
  isLoggedIn,
  isSaved,
  onToggleSave,
  onLearnMore,
}: ClassCardProps) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className={styles.classCardWrapper}
  >
    {/* Image section */}
    <div className={styles.cardImageWrapper}>
      <img
        src={item.image}
        alt={item.title}
        className={styles.cardImage}
        referrerPolicy="no-referrer"
      />
      <div className={styles.cardImageGradient} />

      {/* Slots label - prioritized */}
      <div className={styles.cardSlotsLabel}>{item.slots} SLOTS</div>

      {/* Save button - bookmark icon */}
      {isLoggedIn && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(item.id);
          }}
          title={isSaved ? 'Unbookmark class' : 'Bookmark class'}
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            border: '1.5px solid rgba(250, 225, 133, 0.35)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            transition: 'all 0.2s',
            pointerEvents: 'auto',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'rgba(0, 0, 0, 0.8)';
            (e.currentTarget as HTMLButtonElement).style.transform =
              'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'rgba(0, 0, 0, 0.6)';
            (e.currentTarget as HTMLButtonElement).style.transform =
              'scale(1)';
          }}
        >
          {isSaved ? (
            <Bookmark size={20} fill="#fae185" color="#fae185" />
          ) : (
            <Bookmark size={20} color="#fae185" />
          )}
        </button>
      )}

      {/* Overlay content - desktop only */}
      <div className={styles.cardOverlayContent}>
        <p className={styles.cardOrganization}>{item.org}</p>
        <h3
          className={styles.cardTitle}
          style={{ fontFamily: "'Playfair Display', serif" }}
          onClick={() => onLearnMore(item)}
        >
          {item.title}
        </h3>
        <div className={styles.cardMetadataOverlay}>
          <div className={styles.metadataItem}>
            <Calendar size={12} className={styles.metadataIcon} />
            <span>
              {item.date} · {item.time}
            </span>
          </div>
          <div className={styles.metadataItem}>
            <MapPin size={12} className={styles.metadataIcon} />
            <span>
              {item.venue} ({item.modality})
            </span>
          </div>
        </div>
        <div className={styles.cardActionsOverlay}>
          <a
            href={item.googleFormUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={styles.registerBtnOverlay}
          >
            Register <ExternalLink size={13} />
          </a>
          <button
            onClick={() => onLearnMore(item)}
            className={styles.learnMoreBtnOverlay}
          >
            Learn More <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>

    {/* Details section - mobile only, shown below the image */}
    <div className={styles.cardDetailsSection}>
      <div className={styles.cardOverlayTopRow}>
        {item.orgLogo ? (
          <img
            src={item.orgLogo}
            alt={item.org}
            className={styles.cardOrgLogo}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={styles.cardOrgLogoPlaceholder}>
            {item.org.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <p className={styles.cardOrganization}>{item.org}</p>

      <h3
        className={styles.cardTitle}
        style={{ fontFamily: "'Playfair Display', serif" }}
        onClick={() => onLearnMore(item)}
      >
        {item.title}
      </h3>
      <div className={styles.cardMetadataOverlay}>
        <div className={styles.metadataItem}>
          <Calendar size={12} className={styles.metadataIcon} />
          <span>
            {item.date} · {item.time}
          </span>
        </div>
        <div className={styles.metadataItem}>
          <MapPin size={12} className={styles.metadataIcon} />
          <span>
            {item.venue} ({item.modality})
          </span>
        </div>
      </div>
      <div className={styles.cardActionsOverlay}>
        <a
          href={item.googleFormUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={styles.registerBtnOverlay}
        >
          Register <ExternalLink size={13} />
        </a>
        <button
          onClick={() => onLearnMore(item)}
          className={styles.learnMoreBtnOverlay}
        >
          Learn More <ChevronRight size={13} />
        </button>
      </div>
    </div>
  </motion.div>
);
