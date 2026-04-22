import json
import os
import sys
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import pandas as pd
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import io
import sys
import os
sys.path.append(os.path.abspath("."))
sys.path.append(os.path.abspath(".."))
import helpers

# 1. Config
NOTEBOOKS = [
    "NB0_data_quality.ipynb",
    "NB1_ground_truth_comparison.ipynb",
    "NB2_annotation_experiment.ipynb",
    "NB3_psychometrics.ipynb",
    "NB4_integrated_models.ipynb",
    "NB5_figures.ipynb"
]
OUTPUT_PDF = "Full_Analysis_Report.pdf"

# 2. PDF Buffer
pages = []

def text_to_image(text, title=None, fontsize=12):
    """Renders text to a PIL image (A4-like proportions)"""
    # A4 at 72dpi is 595x842. Let's use 1200x1600 for better quality.
    img = Image.new('RGB', (1200, 1600), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Try to load a font, fallback to default
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Courier.dfont", fontsize * 2)
    except:
        font = ImageFont.load_default()

    y_offset = 50
    if title:
        draw.text((50, y_offset), title.upper(), fill=(0,0,0), font=font)
        y_offset += 100
        draw.line((50, y_offset-20, 1150, y_offset-20), fill=(0,0,0), width=2)

    # Wrap text and draw
    for line in text.split('\n'):
        if y_offset > 1500: break # Page full
        draw.text((50, y_offset), line, fill=(0,0,0), font=font)
        y_offset += fontsize * 2 + 5
        
    return img

def fig_to_image(fig):
    """Converts a matplotlib figure to a PIL image"""
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', dpi=150)
    buf.seek(0)
    img = Image.open(buf)
    # Resize to fit A4-like width while maintaining aspect ratio
    w, h = img.size
    new_w = 1100
    new_h = int(h * (new_w / w))
    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Place on white canvas
    canvas = Image.new('RGB', (1200, 1600), color=(255, 255, 255))
    canvas.paste(img, (50, 50))
    return canvas

def plotly_to_image(fig):
    """Converts a plotly figure to a PIL image using kaleido"""
    img_data = fig.to_image(format="png", scale=2)
    img = Image.open(io.BytesIO(img_data))
    w, h = img.size
    new_w = 1100
    new_h = int(h * (new_w / w))
    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    canvas = Image.new('RGB', (1200, 1600), color=(255, 255, 255))
    canvas.paste(img, (50, 50))
    return canvas

# 3. Execution Wrapper
print(f"Starting PDF generation: {OUTPUT_PDF}")

# Global state for capturing
text_buffer = []

def custom_print(*args, **kwargs):
    text_buffer.append(" ".join(map(str, args)))
    # Also print to terminal for progress
    # print(*args, **kwargs)

# Override plt.show
original_plt_show = plt.show
def custom_plt_show(*args, **kwargs):
    global pages, text_buffer
    # Flush text buffer first
    if text_buffer:
        pages.append(text_to_image("\n".join(text_buffer)))
        text_buffer = []
    # Capture current figure
    pages.append(fig_to_image(plt.gcf()))
    plt.close()

# Override plotly show if possible
import plotly.graph_objects as go
def custom_plotly_show(self, *args, **kwargs):
    global pages, text_buffer
    if text_buffer:
        pages.append(text_to_image("\n".join(text_buffer)))
        text_buffer = []
    try:
        pages.append(plotly_to_image(self))
    except:
        text_buffer.append("[Plotly figure could not be rendered in PDF]")

# Monkeypatch
import builtins
builtins.print = custom_print
plt.show = custom_plt_show
go.Figure.show = custom_plotly_show

# 4. Main Loop
for nb_file in NOTEBOOKS:
    if not os.path.exists(nb_file):
        custom_print(f"Skipping {nb_file} - not found.")
        continue
    
    pages.append(text_to_image(f"Notebook: {nb_file}", title="Section Heading", fontsize=24))
    
    with open(nb_file, 'r') as f:
        nb = json.load(f)
    
    for cell in nb['cells']:
        if cell['cell_type'] == 'markdown':
            text = "".join(cell['source'])
            pages.append(text_to_image(text, title="Markdown Description", fontsize=10))
        
        elif cell['cell_type'] == 'code':
            source = "".join(cell['source'])
            if not source.strip(): continue
            
            try:
                # Reset figure for each code cell to avoid overlaps
                plt.figure() 
                exec(source, globals())
                # If the cell finished and left something in text buffer, we will flush it later or at next show
            except Exception as e:
                custom_print(f"Error in {nb_file}: {e}")
                # traceback.print_exc()

    # Flush remaining text at end of notebook
    if text_buffer:
        pages.append(text_to_image("\n".join(text_buffer)))
        text_buffer = []

# 5. Save PDF
if pages:
    pages[0].save(OUTPUT_PDF, save_all=True, append_images=pages[1:])
    # Restore print
    builtins.print = print
    print(f"Success! {OUTPUT_PDF} created with {len(pages)} pages.")
else:
    builtins.print = print
    print("Failed to generate any pages.")
