import type { ReactNode } from 'react';

export const THEME_ILLUSTRATIONS: Record<string, ReactNode> = {
  'Palayan ng Karunungan': (
    <svg width="130" height="150" viewBox="0 0 130 150">
      {[20, 42, 64, 86, 108].map((x, i) => (
        <g key={i}>
          <path d={`M${x} 148 Q${x + (i % 2 ? 3 : -3)} 100 ${x + (i % 2 ? -2 : 2)} 55 Q${x} 28 ${x + (i % 2 ? 2 : -2)} 5`} stroke="#4a7a20" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          {[5, 15, 25, 35, 45].map((y, gi) => (
            <ellipse key={gi} cx={x + (gi % 2 === 0 ? -4 : 4) + (i % 2 ? 1 : -1)} cy={y} rx="5" ry="8" fill="#d4a030" opacity="0.9" transform={`rotate(${gi % 2 === 0 ? -22 : 22},${x + (gi % 2 === 0 ? -4 : 4)},${y})`} />
          ))}
        </g>
      ))}
    </svg>
  ),

  'Bahay ng Bayanihan': (
    <svg width="170" height="180" viewBox="0 0 170 180">
      <ellipse cx="85" cy="175" rx="75" ry="10" fill="rgba(250,225,133,0.12)" />
      <rect x="20" y="115" width="7" height="60" rx="3" fill="#7a5030" />
      <rect x="70" y="115" width="7" height="60" rx="3" fill="#7a5030" />
      <rect x="95" y="115" width="7" height="60" rx="3" fill="#7a5030" />
      <rect x="143" y="115" width="7" height="60" rx="3" fill="#7a5030" />
      <rect x="10" y="110" width="150" height="8" rx="3" fill="#8a6038" />
      <rect x="14" y="52" width="142" height="60" rx="2" fill="#c49a72" />
      <rect x="70" y="72" width="32" height="40" rx="2" fill="#5a3520" />
      <rect x="72" y="74" width="13" height="36" rx="1" fill="#6a4028" />
      <rect x="87" y="74" width="13" height="36" rx="1" fill="#6a4028" />
      <rect x="20" y="66" width="34" height="24" rx="2" fill="#ffd966" opacity="0.7" />
      <line x1="37" y1="66" x2="37" y2="90" stroke="#8a6038" strokeWidth="1.5" />
      <line x1="20" y1="78" x2="54" y2="78" stroke="#8a6038" strokeWidth="1.5" />
      <rect x="116" y="66" width="28" height="24" rx="2" fill="#ffd966" opacity="0.6" />
      <path d="M-5 54 L85 4 L175 54Z" fill="#c8a46e" />
      <path d="M85 4 L175 54 L145 54Z" fill="rgba(0,0,0,0.18)" />
      {[20, 50, 85, 118, 148].map((x, i) => <line key={i} x1="85" y1="4" x2={x} y2="54" stroke="rgba(100,70,30,0.3)" strokeWidth="1.5" />)}
      <ellipse cx="85" cy="4" rx="6" ry="5" fill="#b08040" />
      <rect x="-5" y="51" width="180" height="5" rx="2" fill="rgba(0,0,0,0.15)" />
    </svg>
  ),

  'Palaisdaan ng Kalusugan': (
    <svg width="200" height="130" viewBox="0 0 200 130">
      <ellipse cx="100" cy="115" rx="90" ry="10" fill="rgba(74,160,185,0.3)" />
      {[40, 80, 120, 160].map((x, i) => <path key={i} d={`M${x} 115 Q${x + 20} 112 ${x + 40} 115`} stroke="rgba(150,220,240,0.4)" strokeWidth="1.2" fill="none" />)}
      <path d="M10 85 Q100 105 190 85 L180 110 Q100 125 20 110Z" fill="#8b5e3c" />
      <path d="M10 85 Q100 105 190 85 L185 95 Q100 115 15 95Z" fill="#a0703c" />
      {[0, 1, 2].map(i => <path key={i} d={`M${20 + i * 55} 88 Q${20 + i * 55 + 27} 100 ${20 + i * 55 + 55} 88`} stroke="rgba(60,30,10,0.3)" strokeWidth="1.2" fill="none" />)}
      <path d="M30 88 L20 72 L180 72 L170 88" fill="none" stroke="#7a5028" strokeWidth="2.5" />
      <rect x="18" y="68" width="164" height="5" rx="2" fill="#9a6840" />
      <line x1="100" y1="88" x2="100" y2="25" stroke="#6a4020" strokeWidth="3" />
      <path d="M100 28 L100 78 L148 60Z" fill="rgba(230,200,130,0.85)" stroke="#c8a060" strokeWidth="1" />
      <ellipse cx="100" cy="118" rx="60" ry="5" fill="rgba(153,217,235,0.2)" />
    </svg>
  ),

  'Dambana ng Pagkakaisa': (
    <svg width="150" height="200" viewBox="0 0 150 200">
      <ellipse cx="75" cy="100" rx="60" ry="80" fill="rgba(78,207,138,0.08)" />
      <rect x="62" y="100" width="26" height="95" rx="8" fill="#5a4020" />
      <rect x="68" y="100" width="14" height="95" rx="6" fill="#7a5a28" />
      <path d="M70 130 Q55 150 50 190" stroke="#6a4820" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M80 145 Q92 165 95 190" stroke="#6a4820" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M65 160 Q45 175 42 195" stroke="#5a4018" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="75" cy="80" rx="58" ry="52" fill="#1e6030" />
      <ellipse cx="45" cy="90" rx="38" ry="32" fill="#256835" />
      <ellipse cx="105" cy="88" rx="36" ry="30" fill="#1d5a2c" />
      <ellipse cx="75" cy="50" rx="48" ry="40" fill="#2a7a38" />
      <ellipse cx="75" cy="38" rx="32" ry="26" fill="#318040" />
      {[[30, 70], [120, 65], [55, 40], [95, 42], [70, 30], [140, 80], [25, 90]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="#4ecf8a" opacity="0.7">
          <animate attributeName="opacity" values="0.2;0.9;0.2" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <rect x="58" y="190" width="34" height="5" rx="2" fill="#8a6030" />
      <path d="M62 185 L75 175 L88 185Z" fill="#c8a050" />
    </svg>
  ),

  'Pamilihan ng Kakayahan': (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <rect x="10" y="100" width="140" height="8" rx="3" fill="#8a5e30" />
      <rect x="15" y="108" width="6" height="45" rx="2" fill="#7a5028" />
      <rect x="139" y="108" width="6" height="45" rx="2" fill="#7a5028" />
      <path d="M0 35 L160 35 L150 70 L10 70Z" fill="#c8402a" opacity="0.85" />
      <path d="M0 35 L160 35 L160 40 L0 40Z" fill="#a83020" />
      {[20, 45, 70, 95, 120, 145].map((x, i) => <path key={i} d={`M${x} 70 L${x - 5} 80`} stroke="#c8402a" strokeWidth="3" strokeLinecap="round" />)}
      <path d="M48 55 L56 98 L104 98 L112 55Z" fill="#c88030" />
      {[62, 72, 82, 92].map((y, i) => [50, 65, 80, 95, 108].map((x, j) => (
        <path key={`${i}-${j}`} d={`M${x + 4} ${y} L${x + 12} ${y + 7} L${x + 4} ${y + 14} L${x - 4} ${y + 7}Z`} fill={(i + j) % 2 === 0 ? 'rgba(210,140,30,0.6)' : 'rgba(170,90,15,0.45)'} stroke="rgba(100,50,0,0.2)" strokeWidth="0.4" />
      )))}
      <ellipse cx="80" cy="98" rx="30" ry="5" fill="#a06020" />
      <path d="M56 55 Q58 38 68 28 Q80 20 92 28 Q102 38 104 55" fill="none" stroke="#c07020" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="30" cy="99" rx="16" ry="10" fill="#d4922a" />
      <ellipse cx="130" cy="99" rx="14" ry="9" fill="#de9a49" />
    </svg>
  ),

  'Plaza ng Malikhaing Diwa': (
    <svg width="180" height="190" viewBox="0 0 180 190">
      <path d="M0 30 Q45 50 90 35 Q135 20 180 40" stroke="#8a6030" strokeWidth="2" fill="none" />
      {[8, 28, 48, 68, 88, 108, 128, 148, 168].map((x, i) => {
        const y = 30 + Math.sin((x / 180) * Math.PI) * 15;
        const colors = ['#e8402a', '#fae185', '#4ab068', '#4ab0c8', '#de9a49', '#c870a0'];
        return <path key={i} d={`M${x} ${y} L${x + 10} ${y + 18} L${x + 18} ${y}Z`} fill={colors[i % colors.length]} opacity="0.9" />;
      })}
      <path d="M10 55 Q90 70 170 55" stroke="#6a4820" strokeWidth="1.5" fill="none" />
      {[18, 40, 62, 84, 106, 128, 150].map((x, i) => {
        const y = 55 + Math.sin((x / 180) * Math.PI) * 8;
        const colors = ['#fae185', '#c870a0', '#e8402a', '#4ab068', '#de9a49'];
        return <path key={i} d={`M${x} ${y} L${x + 9} ${y + 15} L${x + 17} ${y}Z`} fill={colors[i % colors.length]} opacity="0.85" />;
      })}
      <g transform="translate(90,135)">
        <path d="M0 0 L-72 68 Q-76 76 -66 80 Q0 88 66 80 Q76 76 72 68Z" fill="#e8c07a" />
        <path d="M0 0 L72 68 Q76 76 66 80 Q33 85 0 85Z" fill="rgba(0,0,0,0.15)" />
        {[22, 42, 60, 76].map((y, i) => { const w = 18 + i * 14; return <path key={i} d={`M${-w} ${y} Q0 ${y - 3} ${w} ${y}`} fill="none" stroke="rgba(100,60,10,0.25)" strokeWidth="1.5" />; })}
        <circle cx="0" cy="0" r="7" fill="#b07020" />
        <circle cx="0" cy="0" r="3.5" fill="#de9a49" />
        <ellipse cx="0" cy="78" rx="78" ry="12" fill="#d4a84e" />
      </g>
    </svg>
  ),
};
