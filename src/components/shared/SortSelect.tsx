interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const SortSelect = ({ value, onChange, className, style }: SortSelectProps) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    aria-label="Sort classes"
    className={className}
    style={style}
  >
    <option value="">Sort by</option>
    <option value="title-asc">Title A-Z</option>
    <option value="title-desc">Title Z-A</option>
    <option value="slots-asc">Most slots</option>
    <option value="slots-desc">Least slots</option>
  </select>
);
