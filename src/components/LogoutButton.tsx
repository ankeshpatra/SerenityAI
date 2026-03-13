import React, { useRef, useCallback } from 'react';

interface LogoutButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * Animated logout button with a walking figure SVG.
 * Ported from the "Logout button Animation" reference files.
 * Dark theme variant styled for Serenity AI's cyan/navy palette.
 */
const LogoutButton: React.FC<LogoutButtonProps> = ({ onClick, className = '' }) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  const walkingFrames = [
    { arm1: 'rotate(0)',  wrist1: 'rotate(0)',  arm2: 'rotate(0)',  wrist2: 'rotate(0)',  leg1: 'rotate(0)',  calf1: 'rotate(0)',  leg2: 'rotate(0)',  calf2: 'rotate(0)',  figure: 'translateX(0)' },
    { arm1: 'rotate(20deg)', wrist1: 'rotate(-10deg)', arm2: 'rotate(-20deg)', wrist2: 'rotate(10deg)', leg1: 'rotate(-20deg)', calf1: 'rotate(10deg)', leg2: 'rotate(20deg)', calf2: 'rotate(-15deg)', figure: 'translateX(4px)' },
    { arm1: 'rotate(0)',  wrist1: 'rotate(0)',  arm2: 'rotate(0)',  wrist2: 'rotate(0)',  leg1: 'rotate(0)',  calf1: 'rotate(0)',  leg2: 'rotate(0)',  calf2: 'rotate(0)',  figure: 'translateX(8px)' },
    { arm1: 'rotate(-20deg)', wrist1: 'rotate(10deg)', arm2: 'rotate(20deg)', wrist2: 'rotate(-10deg)', leg1: 'rotate(20deg)', calf1: 'rotate(-15deg)', leg2: 'rotate(-20deg)', calf2: 'rotate(10deg)', figure: 'translateX(12px)' },
    { arm1: 'rotate(0)',  wrist1: 'rotate(0)',  arm2: 'rotate(0)',  wrist2: 'rotate(0)',  leg1: 'rotate(0)',  calf1: 'rotate(0)',  leg2: 'rotate(0)',  calf2: 'rotate(0)',  figure: 'translateX(16px)' },
  ];

  const handleClick = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;

    btn.classList.add('clicked');
    let frame = 0;

    const walkInterval = setInterval(() => {
      const f = walkingFrames[frame % walkingFrames.length];
      btn.style.setProperty('--transform-figure', f.figure);
      btn.style.setProperty('--transform-arm1', f.arm1);
      btn.style.setProperty('--transform-wrist1', f.wrist1);
      btn.style.setProperty('--transform-arm2', f.arm2);
      btn.style.setProperty('--transform-wrist2', f.wrist2);
      btn.style.setProperty('--transform-leg1', f.leg1);
      btn.style.setProperty('--transform-calf1', f.calf1);
      btn.style.setProperty('--transform-leg2', f.leg2);
      btn.style.setProperty('--transform-calf2', f.calf2);
      frame++;
    }, 100);

    setTimeout(() => {
      clearInterval(walkInterval);
      btn.classList.add('door-slammed');
      btn.classList.add('falling');
      setTimeout(() => {
        btn.classList.remove('clicked', 'door-slammed', 'falling');
        btn.style.setProperty('--transform-figure', 'none');
        onClick();
      }, 800);
    }, 800);
  }, [onClick, walkingFrames]);

  return (
    <>
      <style>{`
        .logoutBtn {
          --figure-duration: 100;
          --transform-figure: none;
          --walking-duration: 100;
          --transform-arm1: none;
          --transform-wrist1: none;
          --transform-arm2: none;
          --transform-wrist2: none;
          --transform-leg1: none;
          --transform-calf1: none;
          --transform-leg2: none;
          --transform-calf2: none;
          background: none;
          border: 0;
          cursor: pointer;
          display: block;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          height: 36px;
          outline: none;
          padding: 0 0 0 16px;
          perspective: 100px;
          position: relative;
          text-align: left;
          width: 110px;
          -webkit-tap-highlight-color: transparent;
        }
        .logoutBtn::before {
          background-color: #131B2E;
          border-radius: 8px;
          content: "";
          display: block;
          height: 100%;
          left: 0;
          position: absolute;
          top: 0;
          width: 100%;
          z-index: 2;
          transition: transform 50ms ease;
        }
        .logoutBtn:hover .logout-door { transform: rotateY(20deg); }
        .logoutBtn:active::before { transform: scale(0.96); }
        .logoutBtn:active .logout-door { transform: rotateY(28deg); }
        .logoutBtn.clicked::before { transform: none; }
        .logoutBtn.clicked .logout-door { transform: rotateY(35deg); }
        .logoutBtn.door-slammed .logout-door {
          transform: none;
          transition: transform 100ms ease-in 250ms;
        }
        .logoutBtn.falling { animation: logoutShake 200ms linear; }
        .logoutBtn.falling .logout-bang { animation: logoutFlash 300ms linear; }
        .logoutBtn.falling .logout-figure {
          animation: logoutSpin 1000ms infinite linear;
          bottom: -1080px;
          opacity: 0;
          right: 1px;
          transition:
            transform calc(var(--figure-duration) * 1ms) linear,
            bottom calc(var(--figure-duration) * 1ms) cubic-bezier(0.7, 0.1, 1, 1) 100ms,
            opacity calc(var(--figure-duration) * 0.25ms) linear calc(var(--figure-duration) * 0.75ms);
          z-index: 1;
        }
        .logoutBtn .logout-btn-text {
          color: #4FC3F7;
          font-weight: 600;
          position: relative;
          z-index: 10;
        }
        .logoutBtn svg {
          display: block;
          position: absolute;
        }
        .logoutBtn .logout-figure {
          bottom: 4px;
          fill: #4FC3F7;
          right: 14px;
          transform: var(--transform-figure);
          transition: transform calc(var(--figure-duration) * 1ms) cubic-bezier(0.2, 0.1, 0.8, 0.9);
          width: 26px;
          z-index: 4;
        }
        .logoutBtn .logout-door,
        .logoutBtn .logout-doorway {
          bottom: 3px;
          fill: #4FC3F7;
          right: 10px;
          width: 28px;
        }
        .logoutBtn .logout-door {
          transform: rotateY(0);
          transform-origin: 100% 50%;
          transform-style: preserve-3d;
          transition: transform 200ms ease;
          z-index: 5;
        }
        .logoutBtn .logout-door path { fill: #4FC3F7; stroke: #4FC3F7; stroke-width: 4; }
        .logoutBtn .logout-doorway { z-index: 3; }
        .logoutBtn .logout-bang { opacity: 0; }
        .logoutBtn .arm1, .logoutBtn .wrist1, .logoutBtn .arm2, .logoutBtn .wrist2,
        .logoutBtn .leg1, .logoutBtn .calf1, .logoutBtn .leg2, .logoutBtn .calf2 {
          transition: transform calc(var(--walking-duration) * 1ms) ease-in-out;
        }
        .logoutBtn .arm1 { transform: var(--transform-arm1); transform-origin: 52% 45%; }
        .logoutBtn .wrist1 { transform: var(--transform-wrist1); transform-origin: 59% 55%; }
        .logoutBtn .arm2 { transform: var(--transform-arm2); transform-origin: 47% 43%; }
        .logoutBtn .wrist2 { transform: var(--transform-wrist2); transform-origin: 35% 47%; }
        .logoutBtn .leg1 { transform: var(--transform-leg1); transform-origin: 47% 64.5%; }
        .logoutBtn .calf1 { transform: var(--transform-calf1); transform-origin: 55.5% 71.5%; }
        .logoutBtn .leg2 { transform: var(--transform-leg2); transform-origin: 43% 63%; }
        .logoutBtn .calf2 { transform: var(--transform-calf2); transform-origin: 41.5% 73%; }
        @keyframes logoutSpin { from { transform: rotate(0deg) scale(0.94); } to { transform: rotate(359deg) scale(0.94); } }
        @keyframes logoutShake { 0% { transform: rotate(-1deg); } 50% { transform: rotate(2deg); } 100% { transform: rotate(-1deg); } }
        @keyframes logoutFlash { 0% { opacity: 0.4; } 100% { opacity: 0; } }
      `}</style>

      <button ref={btnRef} className={`logoutBtn ${className}`} onClick={handleClick} type="button">
        <svg className="logout-doorway" viewBox="0 0 100 100">
          <path d="M93.4 86.3H58.6c-1.9 0-3.4-1.5-3.4-3.4V17.1c0-1.9 1.5-3.4 3.4-3.4h34.8c1.9 0 3.4 1.5 3.4 3.4v65.8c0 1.9-1.5 3.4-3.4 3.4z" />
          <path className="logout-bang" d="M40.5 43.7L26.6 31.4l-2.5 6.7zM41.9 50.4l-19.5-4-1.4 6.3zM40 57.4l-17.7 3.9 3.9 5.7z" />
        </svg>
        <svg className="logout-figure" viewBox="0 0 100 100">
          <circle cx="52.1" cy="32.4" r="6.4" />
          <path d="M50.7 62.8c-1.2 2.5-3.6 5-7.2 4-3.2-.9-4.9-3.5-4-7.8.7-3.4 3.1-13.8 4.1-15.8 1.7-3.4 1.6-4.6 7-3.7 4.3.7 4.6 2.5 4.3 5.4-.4 3.7-2.8 15.1-4.2 17.9z" />
          <g className="arm1">
            <path d="M55.5 56.5l-6-9.5c-1-1.5-.6-3.5.9-4.4 1.5-1 3.7-1.1 4.6.4l6.1 10c1 1.5.3 3.5-1.1 4.4-1.5.9-3.5.5-4.5-.9z" />
            <path className="wrist1" d="M69.4 59.9L58.1 58c-1.7-.3-2.9-1.9-2.6-3.7.3-1.7 1.9-2.9 3.7-2.6l11.4 1.9c1.7.3 2.9 1.9 2.6 3.7-.4 1.7-2 2.9-3.8 2.6z" />
          </g>
          <g className="arm2">
            <path d="M34.2 43.6L45 40.3c1.7-.6 3.5.3 4 2 .6 1.7-.3 4-2 4.5l-10.8 2.8c-1.7.6-3.5-.3-4-2-.6-1.6.3-3.4 2-4z" />
            <path className="wrist2" d="M27.1 56.2L32 45.7c.7-1.6 2.6-2.3 4.2-1.6 1.6.7 2.3 2.6 1.6 4.2L33 58.8c-.7 1.6-2.6 2.3-4.2 1.6-1.7-.7-2.4-2.6-1.7-4.2z" />
          </g>
          <g className="leg1">
            <path d="M52.1 73.2s-7-5.7-7.9-6.5c-.9-.9-1.2-3.5-.1-4.9 1.1-1.4 3.8-1.9 5.2-.9l7.9 7c1.4 1.1 1.7 3.5.7 4.9-1.1 1.4-4.4 1.5-5.8.4z" />
            <path className="calf1" d="M52.6 84.4l-1-12.8c-.1-1.9 1.5-3.6 3.5-3.7 2-.1 3.7 1.4 3.8 3.4l1 12.8c.1 1.9-1.5 3.6-3.5 3.7-2 0-3.7-1.5-3.8-3.4z" />
          </g>
          <g className="leg2">
            <path d="M37.8 72.7s1.3-10.2 1.6-11.4 2.4-2.8 4.1-2.6c1.7.2 3.6 2.3 3.4 4l-1.8 11.1c-.2 1.7-1.7 3.3-3.4 3.1-1.8-.2-4.1-2.4-3.9-4.2z" />
            <path className="calf2" d="M29.5 82.3l9.6-10.9c1.3-1.4 3.6-1.5 5.1-.1 1.5 1.4.4 4.9-.9 6.3l-8.5 9.6c-1.3 1.4-3.6 1.5-5.1.1-1.4-1.3-1.5-3.5-.2-5z" />
          </g>
        </svg>
        <svg className="logout-door" viewBox="0 0 100 100">
          <path d="M93.4 86.3H58.6c-1.9 0-3.4-1.5-3.4-3.4V17.1c0-1.9 1.5-3.4 3.4-3.4h34.8c1.9 0 3.4 1.5 3.4 3.4v65.8c0 1.9-1.5 3.4-3.4 3.4z" />
          <circle cx="66" cy="50" r="3.7" />
        </svg>
        <span className="logout-btn-text">Log Out</span>
      </button>
    </>
  );
};

export default LogoutButton;
