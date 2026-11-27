import { useId } from 'react';

/* A hand-torn paper edge. The rip is shallow and finely irregular — fibre
   nicks a few units deep with the odd longer pull — so it reads as torn
   paper rather than a sawtooth, and a hairline light rim along the torn side
   gives it the lit paper thickness. */
const PATH =
  'M0 60 L0 34 L6 51 L10 44 L18 37 L23 36 L31 43 L46 40 L51 31 L62 36 L76 36 L82 37 L86 44 L98 30 ' +
  'L106 30 L114 39 L121 44 L125 50 L135 51 L146 51 L153 45 L161 45 L171 43 L176 42 L186 39 ' +
  'L191 51 L195 40 L199 51 L205 40 L215 35 L221 39 L229 30 L240 37 L247 31 L259 31 L266 39 ' +
  'L271 50 L277 52 L289 37 L294 37 L305 42 L312 36 L318 35 L326 45 L334 42 L349 36 L355 40 ' +
  'L365 37 L376 31 L386 44 L394 42 L403 50 L408 37 L420 40 L430 38 L437 42 L449 29 L464 51 ' +
  'L469 43 L480 38 L488 31 L498 38 L507 43 L514 42 L522 37 L529 35 L540 39 L552 40 L557 39 ' +
  'L572 37 L585 51 L589 36 L604 42 L610 35 L617 35 L626 42 L630 32 L638 36 L653 39 L659 39 ' +
  'L663 41 L674 38 L688 50 L703 38 L708 38 L719 42 L733 29 L737 41 L750 43 L764 29 L774 37 ' +
  'L787 41 L799 37 L812 38 L827 49 L838 43 L846 40 L853 44 L866 44 L871 36 L876 40 L886 42 ' +
  'L893 31 L904 50 L914 36 L919 39 L924 44 L930 36 L944 39 L956 40 L966 38 L973 42 L986 42 ' +
  'L991 43 L1004 36 L1015 45 L1025 40 L1036 41 L1043 44 L1051 40 L1058 38 L1062 44 L1071 42 ' +
  'L1084 36 L1097 37 L1109 42 L1116 38 L1123 50 L1130 36 L1137 41 L1148 36 L1162 37 L1169 39 ' +
  'L1182 42 L1191 39 L1204 43 L1217 36 L1223 44 L1233 44 L1245 32 L1256 38 L1263 43 L1275 44 ' +
  'L1286 39 L1291 40 L1302 50 L1309 33 L1318 36 L1325 38 L1335 37 L1348 48 L1361 43 L1370 36 ' +
  'L1383 50 L1393 41 L1403 39 L1413 32 L1424 39 L1432 51 L1443 36 L1449 29 L1457 39 L1471 29 ' +
  'L1478 37 L1483 38 L1488 39 L1493 43 L1502 44 L1506 30 L1515 50 L1523 37 L1533 45 L1548 30 ' +
  'L1557 36 L1567 32 L1581 51 L1588 38 L1595 39 L1600 44 L1600 60 Z';

/* `edge="top"` is a strip at the top of a section: solid at y=0, ragged at the
   bottom, so it never leaves a sliver of the section below showing through.
   `edge="bottom"` is the mirror for a strip sitting on a section's bottom. */
export default function TornEdge({ className = '', fill = '#111111', edge = 'top', shadow = true, rim = 'rgba(255, 255, 255, 0.42)' }) {
  const rid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const fid = `torn${rid}`;
  const top = edge === 'top';
  const flip = top ? 'rotate(180 800 30)' : '';

  return (
    <svg className={`torn-edge ${className}`} viewBox="0 0 1600 60" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <filter id={fid} x="-2%" y="-80%" width="104%" height="260%">
          <feDropShadow dx="0" dy={top ? -4 : 4} stdDeviation="5" floodColor="#04121f" floodOpacity="0.26" />
        </filter>
      </defs>
      {/* Light fibre edge: the same rip nudged a hair to the torn side, so only
          a thin lit sliver shows beneath the paper. */}
      <g transform={`${flip} translate(0 -1.6)`}>
        <path d={PATH} fill={rim} shapeRendering="geometricPrecision" />
      </g>
      <path
        d={PATH}
        fill={fill}
        filter={shadow ? `url(#${fid})` : undefined}
        transform={flip || undefined}
        shapeRendering="geometricPrecision"
      />
    </svg>
  );
}
