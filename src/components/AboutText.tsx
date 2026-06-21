import { useLocale } from '../hooks/useLocale';

export default function AboutText() {
  const { t } = useLocale();
  return (
    <>
      <h1 className="about-title">{t('about_title')}</h1>
      <p className="about-desc" style={{ marginBottom: '1.25rem' }}>{t('about_p1')}</p>
      <p className="about-desc">{t('about_p2')}</p>
    </>
  );
}
