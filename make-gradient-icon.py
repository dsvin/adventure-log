"""Gradient sword icon with transparent background, matching the splash sword shape."""
import numpy as np
from PIL import Image, ImageDraw

SIZE = 1024
S = SIZE / 32

# Per-pixel gradient: ember→amber→cyan, diagonal
E, A, C = np.array([232,128,74]), np.array([230,196,99]), np.array([70,214,224])
xx, yy = np.meshgrid(np.arange(SIZE, dtype=np.float32), np.arange(SIZE, dtype=np.float32))
t = np.clip((xx + yy) / (2 * SIZE), 0, 1)
t2 = t * 2
R = np.where(t <= 0.5, E[0]+(A[0]-E[0])*t2, A[0]+(C[0]-A[0])*(t2-1)).astype(np.uint8)
G = np.where(t <= 0.5, E[1]+(A[1]-E[1])*t2, A[1]+(C[1]-A[1])*(t2-1)).astype(np.uint8)
B = np.where(t <= 0.5, E[2]+(A[2]-E[2])*t2, A[2]+(C[2]-A[2])*(t2-1)).astype(np.uint8)

# Build per-element masks
def mask_poly(pts):
    m = Image.new('L', (SIZE, SIZE), 0)
    ImageDraw.Draw(m).polygon([(int(x*S), int(y*S)) for x,y in pts], fill=255)
    return np.array(m, dtype=bool)

def mask_rect(x,y,w,h,rx):
    m = Image.new('L', (SIZE, SIZE), 0)
    ImageDraw.Draw(m).rounded_rectangle([int(x*S), int(y*S), int((x+w)*S), int((y+h)*S)], radius=int(rx*S), fill=255)
    return np.array(m, dtype=bool)

def mask_circ(cx,cy,rd):
    m = Image.new('L', (SIZE, SIZE), 0)
    r_ = int(rd*S)
    ImageDraw.Draw(m).ellipse([int(cx*S)-r_, int(cy*S)-r_, int(cx*S)+r_, int(cy*S)+r_], fill=255)
    return np.array(m, dtype=bool)

m_blade  = mask_poly([(16,2),(23,10),(23,17),(16,21),(9,17),(9,10)])
m_full   = mask_poly([(16,6),(20,11),(20,15),(16,18),(12,15),(12,11)])
m_guard  = mask_rect(2,20,28,3,1)
m_gem    = mask_poly([(16,24),(18.5,26),(16,28),(13.5,26)])
m_pommel = mask_circ(16,30,1.5)

# Blade area minus fuller area
m_blade_only = m_blade & ~m_full

# Composite onto transparent bg
out = np.zeros((SIZE, SIZE, 4), dtype=np.uint8)
for mask_arr, opacity in [
    (m_blade_only, 0.85),
    (m_full, 0.4),
    (m_guard, 1.0),
    (m_gem, 1.0),
    (m_pommel, 0.6),
]:
    fg = np.zeros((SIZE, SIZE, 4), dtype=np.uint8)
    fg[:,:,:3] = np.stack([R,G,B], axis=2)
    fg[:,:,3] = (mask_arr * 255 * opacity).astype(np.uint8)
    f = fg.astype(np.float32) / 255.0
    bg = out.astype(np.float32) / 255.0
    out_a = f[:,:,3] + bg[:,:,3] * (1 - f[:,:,3])
    out_rgb = np.zeros((SIZE, SIZE, 3), dtype=np.float32)
    for c in range(3):
        out_rgb[:,:,c] = (f[:,:,c]*f[:,:,3] + bg[:,:,c]*bg[:,:,3]*(1-f[:,:,3])) / np.maximum(out_a, 1e-10)
    out = (np.dstack([out_rgb, out_a]).clip(0, 1) * 255).astype(np.uint8)

Image.fromarray(out, 'RGBA').save('public/icon.png')
print("Saved public/icon.png")
