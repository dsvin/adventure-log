"""
Generate Adventure Log icon as a raster PNG — bypasses SVG rendering issues.
Run with: python make-icon.py
Requires: Pillow (pip install pillow) — already included with Anaconda
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import math, os

SIZE = 1024

# ─── Background: tricolor zones ───────────────────────────────────────
x = np.linspace(0, 1, SIZE)
y = np.linspace(0, 1, SIZE)
xx, yy = np.meshgrid(x, y)

# Cyan zone — upper right
d_c = np.sqrt((xx - 0.78)**2 + (yy - 0.12)**2)
t_c = np.clip(1 - d_c / 0.68, 0, 1) ** 1.2

# Amber zone — left
d_a = np.sqrt((xx - 0.16)**2 + (yy - 0.50)**2)
t_a = np.clip(1 - d_a / 0.62, 0, 1) ** 1.2

# Ember zone — bottom centre
d_e = np.sqrt((xx - 0.50)**2 + (yy - 1.02)**2)
t_e = np.clip(1 - d_e / 0.62, 0, 1) ** 1.2

# Base dark
R = np.full((SIZE, SIZE), 7.0)
G = np.full((SIZE, SIZE), 8.0)
B = np.full((SIZE, SIZE), 8.0)

# Cyan  #2888b8 = (40,136,184)
R += t_c * (40  - 7);  G += t_c * (136 -  8);  B += t_c * (184 - 8)
# Amber #7a5820 = (122,88,32)
R += t_a * (122 - 7);  G += t_a * (88  -  8);  B += t_a * (32  - 8)
# Ember #7a3018 = (122,48,24)
R += t_e * (122 - 7);  G += t_e * (48  -  8);  B += t_e * (24  - 8)

R = np.clip(R, 0, 255).astype(np.uint8)
G = np.clip(G, 0, 255).astype(np.uint8)
B = np.clip(B, 0, 255).astype(np.uint8)

img = Image.fromarray(np.stack([R, G, B], axis=2), 'RGB').convert('RGBA')

# ─── Rounded corners mask ─────────────────────────────────────────────
mask = Image.new('L', (SIZE, SIZE), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, SIZE-1, SIZE-1], radius=180, fill=255)
img.putalpha(mask)

draw = ImageDraw.Draw(img, 'RGBA')

# ─── BotW GLOWING ENERGY BLADE ───────────────────────────────────────
# Pure pixel-by-pixel radial gradient — white core → cyan → deep blue
# No polygons, no lines, no hard edges. Just seamless light.
BT   = 32    # blade tip y — moved up for longer blade
BB   = 600   # blade base y
BW_B = 65    # half-width at base — medium width
BW_M = 52    # half-width at mid (y=370)
BW_U = 6     # half-width near tip (y=148)
TIP_FADE = 90  # px over which tip alpha fades in from transparent

blade_pts = [
    (512, BT),
    (512+BW_U, 148), (512+BW_M, 370), (512+BW_B, 565), (512+BW_B, BB),
    (512, BB+46),
    (512-BW_B, BB),  (512-BW_B, 565), (512-BW_M, 370), (512-BW_U, 148),
]

def local_hw(y):
    """Half-width of blade at row y."""
    if y <= BT: return 0.1
    if y <= 148:
        return BW_U * (y - BT) / max(148 - BT, 1)
    elif y <= 370:
        t = (y - 148) / (370 - 148)
        return BW_U + (BW_M - BW_U) * t
    elif y <= 565:
        t = (y - 370) / (565 - 370)
        return BW_M + (BW_B - BW_M) * t
    elif y <= BB:
        return BW_B
    elif y <= BB + 46:
        return max(1, BW_B * (1 - (y - BB) / 46))
    return 0.1

# ── Step 1: large outer aura ──
aura = Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))
ad = ImageDraw.Draw(aura)
for i in range(7):
    exp = (7-i) * 24
    ap = [(512, BT-6),
          (512+BW_U+exp//4, 140), (512+BW_M+exp, 360),
          (512+BW_B+exp, BB), (512, BB+52),
          (512-BW_B-exp, BB), (512-BW_M-exp, 360), (512-BW_U-exp//4, 140)]
    ad.polygon(ap, fill=(65, 145, 225, 16))
aura = aura.filter(ImageFilter.GaussianBlur(52))
img = Image.alpha_composite(img, aura)

# ── Step 2: medium glow halo ──
halo = Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))
ImageDraw.Draw(halo).polygon(blade_pts, fill=(90, 175, 245, 155))
halo = halo.filter(ImageFilter.GaussianBlur(28))
img = Image.alpha_composite(img, halo)

# ── Step 3: pixel-perfect radial gradient blade ──
blade_mask = Image.new('L', (SIZE, SIZE), 0)
ImageDraw.Draw(blade_mask).polygon(blade_pts, fill=255)
mask_arr = np.array(blade_mask, dtype=bool)

xs = np.arange(SIZE, dtype=np.float32)
ys = np.arange(SIZE, dtype=np.float32)
xx, yy = np.meshgrid(xs, ys)

# Half-width at each row
hw_row = np.array([local_hw(y) for y in range(SIZE)], dtype=np.float32)
hw_2d  = np.where(hw_row[:, None] > 0, hw_row[:, None], 1.0)

# Normalised distance from centre axis (0=centre, 1=edge)
dist = np.clip(np.abs(xx - 512) / hw_2d, 0.0, 1.0)

# Colour stops: centre=white → mid=bright cyan → edge=deep blue
d_pts = [0.00, 0.12, 0.32, 0.58, 0.80, 1.00]
r_pts = [255,  255,  200,  100,   45,   20]
g_pts = [255,  255,  238,  185,  138,   90]
b_pts = [255,  255,  255,  255,  228,  205]

R = np.interp(dist, d_pts, r_pts).astype(np.float32)
G = np.interp(dist, d_pts, g_pts).astype(np.float32)
B = np.interp(dist, d_pts, b_pts).astype(np.float32)

# Hotspot: brighten near guard
hot_boost = np.clip(1.3 - np.abs(yy - BB) / 260, 0, 1).astype(np.float32) * 60
R = np.clip(R + hot_boost, 0, 255)
G = np.clip(G + hot_boost, 0, 255)
B = np.clip(B + hot_boost, 0, 255)

# Tip fade: alpha ramps from 0 at tip to 255 over TIP_FADE pixels
tip_alpha = np.clip((yy - BT) / TIP_FADE, 0, 1).astype(np.float32)
A = np.where(mask_arr, (tip_alpha * 255).astype(np.uint8), 0).astype(np.uint8)
blade_arr = np.stack([R.astype(np.uint8), G.astype(np.uint8),
                      B.astype(np.uint8), A], axis=2)
blade_img = Image.fromarray(blade_arr, 'RGBA')
img = Image.alpha_composite(img, blade_img)
draw = ImageDraw.Draw(img, 'RGBA')

# ─── Cross-guard ──────────────────────────────────────────────────────
# Main gold bar
draw.rounded_rectangle([318,610, 706,665], radius=12, fill=(230,196,99,255))
# Wing tips
draw.ellipse([296,626, 340,660], fill=(240,208,100,255))
draw.ellipse([684,626, 728,660], fill=(240,208,100,255))
# Top highlight
draw.rounded_rectangle([318,610, 706,628], radius=8, fill=(247,224,122,200))
# Engraving lines
for x_line in [386, 428, 596, 638]:
    draw.line([(x_line, 614),(x_line, 660)], fill=(140,100,20,160), width=2)

# ─── Center gem (cyan diamond) ────────────────────────────────────────
gem = [(512,582),(540,636),(512,690),(484,636)]
draw.polygon(gem, fill=(70,214,224,255))
# Highlight facet
draw.polygon([(512,585),(540,636),(512,636)], fill=(180,250,255,180))
# Shine dot
draw.ellipse([520,606, 532,618], fill=(255,255,255,200))

# Gem glow
gem_glow = Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))
ImageDraw.Draw(gem_glow).polygon(gem, fill=(70,214,224,80))
gem_glow = gem_glow.filter(ImageFilter.GaussianBlur(18))
img = Image.alpha_composite(img, gem_glow)
draw = ImageDraw.Draw(img, 'RGBA')

# ─── Grip ─────────────────────────────────────────────────────────────
draw.rounded_rectangle([488,660, 536,838], radius=10, fill=(60,24,8,255))
# Amber wrap bands
for y_band in [680, 705, 755, 780]:
    draw.rounded_rectangle([488,y_band, 536,y_band+9], radius=3, fill=(230,196,99,235))
# Ember mid-band
draw.rounded_rectangle([488,730, 536,739], radius=3, fill=(232,128,74,225))

# ─── Pommel ───────────────────────────────────────────────────────────
pom_pts = [(512,838),(552,854),(566,892),(552,930),(512,945),(472,930),(458,892),(472,854)]
draw.polygon(pom_pts, fill=(230,196,99,255))
# Inner ring
draw.polygon([(512,853),(542,866),(554,892),(542,918),(512,931),(482,918),(470,892),(482,866)],
             outline=(154,120,24,160), width=2)
# Pommel gem
draw.ellipse([485,865, 539,919], fill=(70,214,224,255))
draw.ellipse([495,872, 512,889], fill=(200,252,255,180))  # shine

# ─── Ember sparks ─────────────────────────────────────────────────────
rng = np.random.default_rng(42)
spark_data = [
    # (x, y, radius, color, alpha)
    (555,560,6,(255,220,120),240), (468,530,5,(255,204, 80),220),
    (560,470,5,(255,188, 60),210), (460,445,4,(255,204, 80),205),
    (558,380,5,(255,220,120),215), (462,360,5,(255,204, 80),208),
    (555,290,4,(255,188, 60),200), (464,270,4,(255,200, 70),195),
    (550,210,4,(255,220,120),195), (470,195,4,(255,204, 80),190),
    # Mid sparks
    (590,540,4,(255,153, 50),180), (432,510,3,(255,136, 34),170),
    (600,440,3,(255,170, 68),165), (422,415,3,(255,153, 50),160),
    (605,335,4,(255,136, 34),168), (418,310,3,(255,170, 68),158),
    (598,245,3,(255,153, 50),158), (425,225,3,(255,136, 34),150),
    (586,165,3,(255,188, 68),155), (436,150,3,(255,153, 50),145),
    # Near tip
    (530,120,3,(255,220,100),175), (492,108,3,(255,204, 80),165),
    (546,152,2,(255,153, 50),155), (478,140,2,(255,170, 68),148),
    # White hot cores
    (556,480,3,(255,255,255),230), (466,450,3,(255,255,255),225),
    (552,310,3,(255,255,255),215), (468,285,3,(255,255,255),210),
    (531,128,2,(255,255,255),205),
]
spark_layer = Image.new('RGBA', (SIZE, SIZE), (0,0,0,0))
sd = ImageDraw.Draw(spark_layer)
for (sx, sy, sr, col, sa) in spark_data:
    sd.ellipse([sx-sr, sy-sr, sx+sr, sy+sr], fill=(*col, sa))
spark_glow = spark_layer.filter(ImageFilter.GaussianBlur(4))
img = Image.alpha_composite(img, spark_glow)
img = Image.alpha_composite(img, spark_layer)

# ─── Save ─────────────────────────────────────────────────────────────
out = os.path.join(os.path.dirname(__file__), 'icon-1024.png')
img.save(out, 'PNG')
print(f"Saved {out}")
print(f"Size: {os.path.getsize(out)//1024} KB")
