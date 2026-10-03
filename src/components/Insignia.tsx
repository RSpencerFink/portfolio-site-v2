import type { Job } from '@/content/work';

/** Company tile: rounded square, 22% radius, 1 px hairline (spec §4). */
export function Insignia({ job, size = 44 }: { job: Job; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export, images unoptimized
    <img
      src={job.insignia.src}
      alt=""
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        border: `1px solid ${job.slug === 'dbox' ? 'rgb(255 255 255 / 0.18)' : 'rgb(255 255 255 / 0.14)'}`,
        background: job.insignia.tile,
        objectFit: 'contain',
        flexShrink: 0,
      }}
    />
  );
}
