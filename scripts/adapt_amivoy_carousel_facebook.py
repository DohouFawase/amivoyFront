import re
from pathlib import Path


ASSETS = Path(__file__).resolve().parents[1] / "assets" / "carrousel-amivoy"
SOURCE = ASSETS
OUT = ASSETS / "facebook"
OUT.mkdir(parents=True, exist_ok=True)

images = []
for index in range(1, 10):
    original = (SOURCE / f"slide-{index:02d}.svg").read_text(encoding="utf-8")
    opening_end = original.index(">") + 1
    closing_start = original.rfind("</svg>")
    contents = original[opening_end:closing_start]
    bg = re.search(r'<rect width="1080" height="1350" fill="([^"]+)"', original).group(1)
    square = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080" role="img">
      <rect width="1080" height="1080" fill="{bg}"/>
      <svg x="108" y="0" width="864" height="1080" viewBox="0 0 1080 1350" preserveAspectRatio="xMidYMid meet">{contents}</svg>
    </svg>'''
    filename = f"slide-{index:02d}"
    (OUT / f"{filename}.svg").write_text(square, encoding="utf-8")
    images.append(f'<image href="{filename}.svg" x="0" y="{(index-1)*1080}" width="1080" height="1080"/>')

sheet = f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1080" height="9720" viewBox="0 0 1080 9720">{"".join(images)}</svg>'
(OUT / "contact-sheet.svg").write_text(sheet, encoding="utf-8")
