'use client';

import Image from 'next/image';
import { startTransition, useEffect, useRef, useState, ViewTransition, type ReactNode } from 'react';
import type VimeoPlayer from '@vimeo/player';
import { cameraRig } from '@/components/sky/cameraRig';
import styles from './FilmView.module.css';

interface Props {
  slug: string;
  title: string;
  roles: string[];
  vimeoId: string;
  vimeoUrl: string;
  still?: string;
  /** "02 / 12" for the theater drawer footer. */
  counter: string;
  /** Right column: number, h1, roles, description, credits (server-rendered). */
  info: ReactNode;
  /** Up next row (server-rendered); hidden in theater. */
  children: ReactNode;
}

/**
 * VIMEO_NATIVE_CONTROLS (default true). Vimeo only honours `controls: false`
 * on paid plans, and the client's plan is unknown. true: the player asks for
 * Vimeo's own controls and our play / seek / time / mute bar steps aside once
 * the iframe is playing, so exactly one set of controls ever shows (theater
 * and "Watch on Vimeo" stay). false: set this only if the account is on a plan
 * that honours `controls: false`; then our custom bar is the only control set.
 */
export const VIMEO_NATIVE_CONTROLS = true;

const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/**
 * R3 · A5 cinema layout and R3 · A6 theater mode (spec §6 FilmPlayer,
 * CreditsDrawer; §7 T11, T12). The still is the poster until the first play;
 * the Vimeo iframe mounts only then. Theater is a client mode mirrored to
 * `?theater=1`; the player frame keeps one DOM node so playback survives it.
 */
export function FilmView({ slug, title, roles, vimeoId, vimeoUrl, still, counter, info, children }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const player = useRef<VimeoPlayer | null>(null);
  const [status, setStatus] = useState<'poster' | 'loading' | 'ready'>('poster');
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState({ seconds: 0, duration: 0 });
  const [theater, setTheater] = useState(false);

  // Direct load of ?theater=1. Read after hydration: the server HTML is the cinema layout.
  useEffect(() => {
    if (new URLSearchParams(location.search).has('theater')) setTheater(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  // Theater: twinkle × 0.3, and everything but the theater layer and the sky is hidden (transitions.css).
  useEffect(() => {
    if (!theater) return;
    cameraRig.setAmbient(0.3);
    document.documentElement.dataset.theater = '';
    return () => {
      cameraRig.setAmbient(1);
      delete document.documentElement.dataset.theater;
    };
  }, [theater]);

  useEffect(() => () => void player.current?.destroy(), []);


  const toggleTheater = (on: boolean) => {
    // Mobile landscape: native fullscreen (spec §8). Portrait and iOS (no element fullscreen) keep the inset layout.
    if (on && matchMedia('(max-width: 1023px) and (orientation: landscape)').matches && frame.current?.requestFullscreen) {
      frame.current.requestFullscreen().catch(() => {});
      return;
    }
    history.replaceState(history.state, '', on ? '?theater=1' : location.pathname);
    startTransition(() => setTheater(on));
  };

  // T toggles theater; Esc leaves theater first (capture phase, before the panel's Esc closes it).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target as Element).closest?.('input, textarea')) return;
      if (e.key === 'Escape' && theater) {
        e.preventDefault();
        e.stopPropagation();
        toggleTheater(false);
      }
      if (e.key === 't' || e.key === 'T') toggleTheater(!theater);
    };
    addEventListener('keydown', onKey, true);
    return () => removeEventListener('keydown', onKey, true);
  });

  const start = async () => {
    if (player.current) return void player.current.play();
    setStatus('loading');
    const { default: Player } = await import('@vimeo/player');
    const p = new Player(host.current!, {
      id: Number(vimeoId),
      autoplay: true,
      controls: !VIMEO_NATIVE_CONTROLS,
      dnt: true,
      title: false,
      byline: false,
      portrait: false,
    });
    player.current = p;
    p.on('play', () => setPlaying(true));
    p.on('pause', () => setPlaying(false));
    p.on('ended', () => setPlaying(false));
    p.on('timeupdate', (d: { seconds: number; duration: number }) => setTime({ seconds: d.seconds, duration: d.duration }));
    p.on('volumechange', (d: { volume: number }) => setMuted(d.volume === 0));
    p.ready().then(() => setStatus('ready'), () => setStatus('poster'));
  };

  const playPause = () => (playing ? player.current?.pause() : start());
  // One set of controls (see VIMEO_NATIVE_CONTROLS): ours until Vimeo's take over.
  const custom = !(VIMEO_NATIVE_CONTROLS && status === 'ready');

  return (
    <div className={`${styles.root} ${theater ? styles.theater : ''}`}>
      {theater && (
        <div className={`label ${styles.theaterBar}`}>
          <span>The Filmmaker</span>
          <button type="button" className={styles.textButton} onClick={() => toggleTheater(false)}>
            Esc to exit theater
          </button>
        </div>
      )}
      <div className={styles.stage}>
        <ViewTransition name={`film-still-${slug}`} share="vt-frame" update="vt-frame" default="none">
          <div ref={frame} className={styles.frame}>
            <div ref={host} className={styles.host} />
            <div className={styles.poster} data-hidden={status === 'ready'} aria-hidden={status === 'ready'}>
              {still ? (
                <Image src={still} width={1280} height={720} sizes="(max-width: 1023px) 100vw, 1000px" priority alt={`Still from ${title}`} />
              ) : (
                <span className={styles.titleCard}>{title}</span>
              )}
              {/* Without JS this is a plain link to Vimeo. */}
              <a
                href={vimeoUrl}
                className={styles.bigPlay}
                aria-label={`Play ${title}`}
                onClick={(e) => {
                  e.preventDefault();
                  start();
                }}
              >
                <span aria-hidden="true" />
              </a>
            </div>
          </div>
        </ViewTransition>
        <div className={styles.controls}>
          {custom && (
            <input
              type="range"
              className={styles.scrub}
              aria-label="Seek"
              min={0}
              max={time.duration || 1}
              step={0.1}
              value={time.seconds}
              disabled={status === 'poster'}
              style={{ '--p': `${time.duration ? (time.seconds / time.duration) * 100 : 0}%` } as React.CSSProperties}
              onChange={(e) => {
                const seconds = Number(e.target.value);
                setTime((t) => ({ ...t, seconds }));
                player.current?.setCurrentTime(seconds);
              }}
            />
          )}
          <div className={`label ${styles.row}`}>
            {custom && (
              <button type="button" className={styles.iconButton} onClick={playPause} aria-label={playing ? 'Pause' : 'Play'}>
                <span aria-hidden="true" className={playing ? styles.pauseIcon : styles.playIcon} />
              </button>
            )}
            {theater && (
              <span className={styles.theaterTitle} aria-hidden="true">
                <span className={styles.theaterName}>{title}</span>
                <span className="label">{roles.join(', ')}</span>
              </span>
            )}
            {custom && (
              <>
                <span className={styles.time}>
                  {clock(time.seconds)} / {time.duration ? clock(time.duration) : '—'}
                </span>
                <button
                  type="button"
                  className={styles.textButton}
                  disabled={status === 'poster'}
                  aria-pressed={muted}
                  onClick={() => player.current?.setVolume(muted ? 1 : 0)}
                >
                  {muted ? 'Unmute' : 'Mute'}
                </button>
              </>
            )}
            <a href={vimeoUrl} className={styles.vimeo}>
              Watch on Vimeo <span aria-hidden="true">↗</span>
            </a>
            <button
              type="button"
              className={styles.iconButton}
              aria-pressed={theater}
              aria-label={theater ? 'Exit theater' : 'Theater mode'}
              onClick={() => toggleTheater(!theater)}
            >
              <span aria-hidden="true" className={styles.expandIcon} />
            </button>
          </div>
        </div>
        <div className={styles.upNext}>{children}</div>
      </div>
      <aside className={styles.info} aria-label="Film details">
        {theater && (
          <div className={`label ${styles.drawerHead}`}>
            <span>
              <span aria-hidden="true">● </span>Credits
            </span>
            <button type="button" className={styles.textButton} aria-label="Exit theater" onClick={() => toggleTheater(false)}>
              <span aria-hidden="true">×</span>
            </button>
          </div>
        )}
        <div className={styles.infoBody} data-lenis-prevent>
          {info}
        </div>
        {theater && (
          <div className={`label ${styles.drawerFoot}`}>
            <a href={vimeoUrl}>
              Watch on Vimeo <span aria-hidden="true">↗</span>
            </a>
            <span>{counter}</span>
          </div>
        )}
      </aside>
    </div>
  );
}
