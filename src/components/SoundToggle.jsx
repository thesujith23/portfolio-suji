import { useEffect, useState } from 'react';
import { isMuted, subscribeSound, toggleMuted, unlockAudio } from '../lib/sound';

export default function SoundToggle() {
  const [on, setOn] = useState(() => !isMuted());

  useEffect(() => subscribeSound((m) => setOn(!m)), []);

  return (
    <button
      type="button"
      className={`sound-toggle ${on ? 'on' : 'off'}`}
      onClick={() => {
        unlockAudio();
        toggleMuted();
      }}
      aria-pressed={on}
      aria-label={on ? 'Mute sound effects' : 'Enable sound effects'}
      title={on ? 'Sound on — click to mute' : 'Sound off — click to enable'}
      data-sound="none"
      data-hover-sound="none"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
        <path className="wave" d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path className="wave" d="M18.5 5.5a9 9 0 0 1 0 13" />
        <path className="slash" d="M16 9l6 6M22 9l-6 6" />
      </svg>
      <span>{on ? 'Sound' : 'Muted'}</span>
    </button>
  );
}
