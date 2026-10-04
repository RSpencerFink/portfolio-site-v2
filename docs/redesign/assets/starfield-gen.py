# Generates a 1440x900 absolutely-positioned starfield layer with spectral-class tints.
import random, sys
CLASSES = [  # (name, halo hex, weight)
    ("B", "#9BB0FF", 10), ("B", "#AABFFF", 10), ("A", "#CAD7FF", 20),
    ("F", "#F8F7FF", 15), ("G", "#FFF4EA", 15), ("K", "#FFD2A1", 22), ("M", "#FFB56C", 8)]
def rgba(h, a):
    h = h.lstrip('#'); r, g, b = (int(h[i:i+2], 16) for i in (0, 2, 4))
    return f"rgba({r},{g},{b},{a})"
def star(x, y, mag, halo):
    # mag 0 (brilliant) .. 1 (faint). Core always white.
    core = 1.1 + (1 - mag) * 2.6          # 0.8px .. 3.4px
    op = 0.5 + (1 - mag) * 0.5
    if mag > 0.75:   # faint pinprick: just a tinted dot
        return (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{core:.1f}px;height:{core:.1f}px;'
                f'border-radius:50%;background:{rgba(halo, round(op,2))};"></div>')
    sh = (f"0 0 {core*1.2:.1f}px {core*0.4:.1f}px rgba(255,255,255,{op:.2f}), "
          f"0 0 {core*3:.1f}px {core*1.2:.1f}px {rgba(halo, round(op*0.75,2))}, "
          f"0 0 {core*7:.1f}px {core*2.5:.1f}px {rgba(halo, round(op*0.28,2))}")
    s = (f'<div style="position:absolute;left:{x}px;top:{y}px;width:{core:.1f}px;height:{core:.1f}px;'
         f'border-radius:50%;background:#FFFFFF;box-shadow:{sh};"></div>')
    if mag < 0.12:   # glint for the brightest few
        L = int(10 + (0.12 - mag) * 160)
        for w, hgt, dx, dy in ((L, 1, -L/2 + core/2, core/2 - .5), (1, L, core/2 - .5, -L/2 + core/2)):
            s += (f'<div style="position:absolute;left:{x+dx:.1f}px;top:{y+dy:.1f}px;width:{w}px;height:{hgt}px;'
                  f'background:linear-gradient({"90deg" if w>1 else "180deg"},transparent,{rgba(halo,0.55)},transparent);"></div>')
    return s
def main(seed, n=220, w=1440, h=900):
    random.seed(seed)
    tot = sum(c[2] for c in CLASSES); out = []
    for _ in range(n):
        r = random.uniform(0, tot)
        for _, halo, wt in CLASSES:
            r -= wt
            if r <= 0: break
        mag = random.random() ** 0.3   # power law: mostly faint, few bright
        out.append(star(random.randint(0, w), random.randint(0, h), mag, halo))
    return (f'<div layer-name="Starfield · spectral" style="position:absolute;left:0;top:0;width:{w}px;height:{h}px;">'
            + "".join(out) + "</div>")
CONTENT_STAR_SPEC = '6px white core; box-shadow: 0 0 6px 2px #FFF, 0 0 16px 6px <tint>@0.8, 0 0 40px 14px <tint>@0.3'
if __name__ == "__main__":
    print(main(int(sys.argv[1]), int(sys.argv[2]) if len(sys.argv) > 2 else 170))
