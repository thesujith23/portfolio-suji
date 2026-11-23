/* A fluffy, plush Pikachu modelled on the sunlit photo: a squat wide body that
   merges into the head, short fuzzy ears with black tips, big red cheeks, a
   lightning bolt tail. The fur comes from a turbulence displacement on the body
   layer, so the outline wobbles like soft plush.

   The face is a small expression kit driven by the `expression` prop — the
   wrapper's `data-expression` attribute shows one eye set and one mouth, so
   switching expressions is a class swap and costs nothing.

   One inline SVG so the existing state classes keep driving it (idle,
   walking, jumping, riding…). */

const MOUTH_SMILE = 'M33.7 32.4 Q35 34.2 36 32.9 Q37 34.2 38.3 32.4';

export default function PikaSprite({ expression = 'idle' }) {
  return (
    <svg
      className="pika-svg"
      data-expression={expression}
      viewBox="0 0 72 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pkBody" x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#FFDE55" />
          <stop offset="45%" stopColor="#F9D12A" />
          <stop offset="100%" stopColor="#E9B514" />
        </linearGradient>

        {/* Ear gradients run base → tip with a hard stop, so the black tips
            stay clean bands across each ear. */}
        <linearGradient id="pkEarL" gradientUnits="userSpaceOnUse" x1="29" y1="18" x2="10" y2="5">
          <stop offset="0%" stopColor="#F9D12A" />
          <stop offset="62%" stopColor="#F9D12A" />
          <stop offset="62.5%" stopColor="#1B1714" />
          <stop offset="100%" stopColor="#161311" />
        </linearGradient>
        <linearGradient id="pkEarR" gradientUnits="userSpaceOnUse" x1="43" y1="17" x2="55" y2="8">
          <stop offset="0%" stopColor="#F9D12A" />
          <stop offset="62%" stopColor="#F9D12A" />
          <stop offset="62.5%" stopColor="#1B1714" />
          <stop offset="100%" stopColor="#161311" />
        </linearGradient>

        <radialGradient id="pkBelly" cx="0.5" cy="0.45" r="0.55">
          <stop offset="0%" stopColor="#FFE97A" stopOpacity="0.6" />
          <stop offset="70%" stopColor="#FFE97A" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#FFE97A" stopOpacity="0" />
        </radialGradient>

        {/* Soft fur: displacing the flat fills roughens only their outlines. */}
        <filter id="pkFur" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      {/* The tail and ears animate every frame, so they live outside the fur
          filter: a filtered, animated subtree is re-rasterised 60 times a second. */}
      <g className="pk-tail-block">
        {/* Lightning-bolt tail, behind the body */}
        <g className="pk-tail">
          <path d="M50 62.5 L52 55.5 L56.5 59.5 L55.5 53.5 Z" fill="#8C5A22" />
          <path
            d="M51.5 58.5 L58.5 42 L61.5 54.5 L69.5 48.5 L63 68 L58.5 59.5 L51 66 Z"
            fill="#F6C81F"
            stroke="#E4B216"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </g>

        {/* Ears: the near one long, the far one shorter and more upright */}
        <g className="pk-ear-l">
          <path d="M26 21 L9 4 L35 14 Z" fill="url(#pkEarL)" />
        </g>
        <g className="pk-ear-r">
          <path d="M38 14 L46 21 L56 6 Z" fill="url(#pkEarR)" />
        </g>
      </g>

      <g filter="url(#pkFur)">
        {/* Fur tufts where the plush puffs out at the cheeks and hips */}
        <path d="M21.8 26.6 L18.4 25.8 L21.2 29.6 Z" fill="url(#pkBody)" />
        <path d="M50.2 26.6 L53.6 25.8 L50.8 29.6 Z" fill="url(#pkBody)" />
        <path d="M19.2 48.2 L16.2 47.4 L18.8 51.4 Z" fill="url(#pkBody)" />
        <path d="M52.8 48.2 L55.8 47.4 L53.2 51.4 Z" fill="url(#pkBody)" />

        {/* One continuous plush silhouette: head flowing into a wide body */}
        <path
          d="M36 12.6
             C45.2 12.6 51.4 19.4 51.6 27
             C51.7 31 50.4 34.6 48 37.4
             C51.6 40.8 53.2 45.8 53.5 52.2
             C53.9 61.4 47.2 68.2 36 68.2
             C24.8 68.2 18.1 61.4 18.5 52.2
             C18.8 45.8 20.4 40.8 24 37.4
             C21.6 34.6 20.3 31 20.4 27
             C20.6 19.4 26.8 12.6 36 12.6 Z"
          fill="url(#pkBody)"
        />

        {/* Sunlight on top, glow on the belly, shade underneath */}
        <ellipse cx="30.6" cy="20.6" rx="6" ry="4" fill="#FFF6C2" opacity="0.16" />
        <ellipse cx="35.8" cy="53" rx="12.4" ry="8.8" fill="url(#pkBelly)" opacity="0.7" />
        <ellipse cx="36" cy="64" rx="12.4" ry="3.8" fill="#D9A50F" opacity="0.16" />

      </g>

      {/* Feet and arms also animate, so they stay outside the fur filter. */}
      <g className="pk-leg">
        <ellipse cx="31.4" cy="68" rx="3.6" ry="2" fill="#F1BE1A" />
        <ellipse cx="40.6" cy="68" rx="3.6" ry="2" fill="#F1BE1A" />
      </g>

      <g className="pk-arms">
        <ellipse cx="28.6" cy="56.4" rx="3.4" ry="4.2" transform="rotate(14 28.6 56.4)" fill="#E9B313" opacity="0.45" />
        <ellipse cx="43.4" cy="56.4" rx="3.4" ry="4.2" transform="rotate(-14 43.4 56.4)" fill="#E9B313" opacity="0.45" />
        <ellipse cx="28.4" cy="55.8" rx="2.9" ry="3.7" transform="rotate(14 28.4 55.8)" fill="#F8CE24" />
        <ellipse cx="43.6" cy="55.8" rx="2.9" ry="3.7" transform="rotate(-14 43.6 55.8)" fill="#F8CE24" />
      </g>

      {/* Face stays crisp on top of the fur */}
      <g className="pk-face">
        {/* big round cheeks */}
        <circle cx="25.6" cy="32.4" r="4.2" fill="#E8402F" />
        <circle cx="46.4" cy="32.4" r="4.2" fill="#E8402F" />
        <ellipse cx="24.1" cy="30.9" rx="1.2" ry="1.15" fill="#FF9A8C" opacity="0.45" />

        {/* eyes — one set is shown at a time */}
        <g className="pk-eyes-open">
          <ellipse cx="30.2" cy="26.3" rx="2.75" ry="3.6" fill="#1A1714" />
          <ellipse cx="41.8" cy="26.3" rx="2.75" ry="3.6" fill="#1A1714" />
          <circle cx="31.2" cy="24.9" r="1.05" fill="#FFFFFF" />
          <circle cx="42.8" cy="24.9" r="1.05" fill="#FFFFFF" />
          <circle cx="29.4" cy="28" r="0.55" fill="#FFFFFF" opacity="0.7" />
          <circle cx="41" cy="28" r="0.55" fill="#FFFFFF" opacity="0.7" />
        </g>

        <g className="pk-eyes-happy">
          <path d="M27.4 27 Q30.2 23.6 33 27" stroke="#2A211B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M39 27 Q41.8 23.6 44.6 27" stroke="#2A211B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>

        <g className="pk-eyes-wink">
          <ellipse cx="30.2" cy="26.3" rx="2.6" ry="3.4" fill="#1A1714" />
          <circle cx="31.1" cy="24.9" r="1" fill="#FFFFFF" />
          <path d="M39 27 Q41.8 23.6 44.6 27" stroke="#2A211B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>

        <g className="pk-eyes-sleepy">
          <path d="M27.6 26.4 Q30.2 29 32.8 26.4" stroke="#2A211B" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          <path d="M39.2 26.4 Q41.8 29 44.4 26.4" stroke="#2A211B" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </g>

        <g className="pk-eyes-shock">
          <ellipse cx="30.2" cy="26.2" rx="3.1" ry="3.7" fill="#FFFFFF" stroke="#2A211B" strokeWidth="0.7" />
          <ellipse cx="41.8" cy="26.2" rx="3.1" ry="3.7" fill="#FFFFFF" stroke="#2A211B" strokeWidth="0.7" />
          <circle cx="30.2" cy="26.4" r="1.35" fill="#1A1714" />
          <circle cx="41.8" cy="26.4" r="1.35" fill="#1A1714" />
        </g>

        <g className="pk-eyes-love">
          <path
            d="M30.2 29 C28.2 27.6 27.3 26.7 27.3 25.6 C27.3 24.6 28.1 24 28.9 24 C29.5 24 30 24.3 30.2 24.8 C30.4 24.3 30.9 24 31.5 24 C32.3 24 33.1 24.6 33.1 25.6 C33.1 26.7 32.2 27.6 30.2 29 Z"
            fill="#E8402F"
          />
          <path
            d="M41.8 29 C39.8 27.6 38.9 26.7 38.9 25.6 C38.9 24.6 39.7 24 40.5 24 C41.1 24 41.6 24.3 41.8 24.8 C42 24.3 42.5 24 43.1 24 C43.9 24 44.7 24.6 44.7 25.6 C44.7 26.7 43.8 27.6 41.8 29 Z"
            fill="#E8402F"
          />
        </g>

        <g className="pk-eyes-derp">
          <circle cx="30.6" cy="26.6" r="1.5" fill="#1A1714" />
          <circle cx="41.4" cy="25.6" r="1.9" fill="#1A1714" />
          <circle cx="42.2" cy="24.6" r="0.7" fill="#FFFFFF" />
        </g>

        {/* nose */}
        <path d="M35.3 30.4 Q36 29.8 36.7 30.4 Q36.3 31.4 36 31.5 Q35.7 31.4 35.3 30.4 Z" fill="#2B2320" />

        {/* mouths — one set is shown at a time */}
        <g className="pk-mouth-smile">
          <path d={MOUTH_SMILE} stroke="#4A2118" strokeWidth="1.15" strokeLinecap="round" fill="none" />
        </g>
        <g className="pk-mouth-open">
          <path d="M32.4 32.5 C33.2 37.8 38.8 37.8 39.6 32.5 Z" fill="#6B2B24" />
          <ellipse cx="36" cy="36.2" rx="2.1" ry="1.4" fill="#F2797E" />
        </g>
        <g className="pk-mouth-o">
          <ellipse cx="36" cy="34.4" rx="1.9" ry="2.3" fill="#6B2B24" />
        </g>
        <g className="pk-mouth-tongue">
          <path d={MOUTH_SMILE} stroke="#4A2118" strokeWidth="1.15" strokeLinecap="round" fill="none" />
          <path d="M34.4 33.4 q1.6 3.4 3.2 0 q-.4 3.4-1.6 3.4 q-1.2 0-1.6-3.4 Z" fill="#F2797E" />
        </g>
      </g>
    </svg>
  );
}
