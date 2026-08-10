"""
Scan assets/ for PNGs with white/solid backgrounds and remove them using rembg.
Originals are backed up to assets/_originals/ before overwriting.
"""

import os
import shutil
import sys
from PIL import Image
import numpy as np

ASSETS_ROOT = os.path.join(os.path.dirname(__file__), "..", "assets")
BACKUP_DIR = os.path.join(ASSETS_ROOT, "_originals")
# Backgrounds are intentionally opaque — skip them
SKIP_DIRS = {"_originals", "backgrounds"}

CORNER_THRESHOLD = 240  # RGB values above this in corners = likely white bg
CORNER_MIN_RATIO = 0.6  # At least 60% of corner pixels must be "white"


def has_white_background(img_path):
    """Check if a PNG either lacks alpha or has white-ish background."""
    img = Image.open(img_path).convert("RGBA")
    w, h = img.size
    arr = np.array(img)

    # If image already has meaningful transparency, skip it
    alpha = arr[:, :, 3]
    transparent_ratio = np.sum(alpha < 240) / alpha.size
    if transparent_ratio > 0.01:
        return False

    # Fully opaque images with no transparency are likely white-bg portraits
    # Check overall brightness of edge pixels (top/bottom rows, left/right cols)
    edge_top = arr[:max(1, h//20), :, :3].reshape(-1, 3)
    edge_bot = arr[-max(1, h//20):, :, :3].reshape(-1, 3)
    edge_left = arr[:, :max(1, w//20), :3].reshape(-1, 3)
    edge_right = arr[:, -max(1, w//20):, :3].reshape(-1, 3)
    edges = np.concatenate([edge_top, edge_bot, edge_left, edge_right])

    white_pixels = np.all(edges > CORNER_THRESHOLD, axis=1)
    ratio = np.sum(white_pixels) / len(white_pixels)
    return ratio >= CORNER_MIN_RATIO


def process_image(img_path, rel_path):
    """Remove background from a single image, backing up the original."""
    from rembg import remove

    print(f"  Processing: {rel_path}")

    # Create backup preserving subfolder structure
    backup_path = os.path.join(BACKUP_DIR, rel_path)
    os.makedirs(os.path.dirname(backup_path), exist_ok=True)
    shutil.copy2(img_path, backup_path)

    # Remove background
    with open(img_path, "rb") as f:
        input_data = f.read()
    output_data = remove(input_data)

    with open(img_path, "wb") as f:
        f.write(output_data)

    print(f"  Done (original backed up)")


def main():
    os.makedirs(BACKUP_DIR, exist_ok=True)
    candidates = []

    # Scan for PNGs
    for root, dirs, files in os.walk(ASSETS_ROOT):
        # Skip backup dir and backgrounds
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for fname in files:
            if not fname.lower().endswith(".png"):
                continue
            full_path = os.path.join(root, fname)
            rel_path = os.path.relpath(full_path, ASSETS_ROOT)
            candidates.append((full_path, rel_path))

    print(f"Scanning {len(candidates)} PNG files for white backgrounds...\n")

    needs_fix = []
    for full_path, rel_path in candidates:
        try:
            if has_white_background(full_path):
                print(f"  [WHITE BG] {rel_path}")
                needs_fix.append((full_path, rel_path))
            else:
                print(f"  [OK]       {rel_path}")
        except Exception as e:
            print(f"  [SKIP]     {rel_path} ({e})")

    if not needs_fix:
        print("\nNo images with white backgrounds found!")
        return

    print(f"\nFound {len(needs_fix)} image(s) with white backgrounds.")
    print(f"Originals will be backed up to: assets/_originals/\n")

    auto_yes = "--yes" in sys.argv
    if not auto_yes:
        confirm = input("Proceed with background removal? [y/N] ").strip().lower()
        if confirm not in ("y", "yes"):
            print("Aborted.")
            return

    print()
    for full_path, rel_path in needs_fix:
        try:
            process_image(full_path, rel_path)
        except Exception as e:
            print(f"  [ERROR] {rel_path}: {e}")

    print(f"\nDone! {len(needs_fix)} image(s) processed.")
    print(f"Originals saved in: assets/_originals/")


if __name__ == "__main__":
    main()
