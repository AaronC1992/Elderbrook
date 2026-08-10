from PIL import Image
import numpy as np
import os, glob

portrait_dir = r'c:\Users\jenna\Desktop\Portfolio projects\Elderbrook\assets\portraits'
files = sorted(glob.glob(os.path.join(portrait_dir, '*.png')))

print(f'Analyzing {len(files)} portraits...\n')

suspects = []
for f in files:
    img = Image.open(f).convert('RGB')
    name = os.path.basename(f)
    w, h = img.size
    arr = np.array(img)
    
    # Detect background color from corners (sample 20x20 from each corner)
    corners = [
        arr[:20, :20],      # top-left
        arr[:20, -20:],     # top-right
    ]
    bg_color = np.median(np.concatenate([c.reshape(-1, 3) for c in corners]), axis=0)
    
    # For each row, count pixels that differ significantly from background
    # A pixel is "content" if it differs from bg by more than 30 in any channel
    threshold = 30
    diff = np.abs(arr.astype(float) - bg_color.reshape(1, 1, 3))
    content_mask = np.any(diff > threshold, axis=2)  # h x w boolean
    
    # For each row, what fraction is content?
    row_content = content_mask.mean(axis=1)  # fraction of content per row
    
    # Find the lowest row with at least 3% content
    lowest_content_row = 0
    for y in range(h - 1, -1, -1):
        if row_content[y] > 0.03:
            lowest_content_row = y
            break
    
    # Also find the highest row with content (top of character)
    highest_content_row = 0
    for y in range(h):
        if row_content[y] > 0.03:
            highest_content_row = y
            break
    
    content_pct = round((lowest_content_row / h) * 100, 1)
    char_height = lowest_content_row - highest_content_row
    char_height_pct = round((char_height / h) * 100, 1)
    
    # Full body = content extends to at least 88% of image height
    # AND character occupies a good portion of the image
    status = 'OK' if content_pct >= 88 else 'SUSPECT'
    if content_pct < 88:
        suspects.append((name, content_pct, char_height_pct))
    
    print(f'{name:45s} bottom:{content_pct:5.1f}%  charH:{char_height_pct:5.1f}%  {status}')
    
    img.close()

print(f'\n{"="*60}')
print(f'NOT FULL BODY (content ends before 88% of image height):')
print(f'{"="*60}')
for name, pct, chpct in sorted(suspects, key=lambda x: x[1]):
    print(f'  {name:45s} content ends at {pct}% (char height: {chpct}%)')
print(f'\nTotal suspects: {len(suspects)} out of {len(files)}')
