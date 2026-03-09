import nbformat

nb_path = '/Users/martonbaltay/Documents/FeelGoodAI/Code/PerCoTate/public/scripts/dataAnalysis/NB4_psychometrics.ipynb'
try:
    with open(nb_path, 'r', encoding='utf-8') as f:
        nb = nbformat.read(f, as_version=4)
except Exception as e:
    pass

for i, cell in enumerate(nb.cells):
    if '=== Highlight:' in cell.source or 'Neuroticism' in cell.source or 'IQ' in cell.source:
        print(f"Cell {i} ({cell.cell_type}): {cell.source.splitlines()[0] if cell.source else ''}")
