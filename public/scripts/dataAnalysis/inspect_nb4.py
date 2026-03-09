import nbformat
import sys

nb_path = '/Users/martonbaltay/Documents/FeelGoodAI/Code/PerCoTate/public/scripts/dataAnalysis/NB4_psychometrics.ipynb'
try:
    with open(nb_path, 'r', encoding='utf-8') as f:
        nb = nbformat.read(f, as_version=4)
except Exception as e:
    print(f"Error reading notebook: {e}")
    sys.exit(1)

# 1. Section 1 IQ score continuous predictor
for cell in nb.cells:
    if 'IQ score as a continuous predictor' in cell.source and 'overall_mean_duration' in cell.source:
        if 'pg.corr' not in cell.source and 'print' not in cell.source:
            # We want to insert the pg.corr or scipy.stats test
            # Let's see the current cell source:
            print("FOUND IQ CELL:")
            print(cell.source)

# 2. Section 2 Significant Correlations
for cell in nb.cells:
    if '=== Highlight: Significant Correlations ===' in cell.source:
        print("FOUND BIG 5 CORR CELL:")
        print(cell.source)
        
# 3. Section 3 Neuroticism & Performance Stability
for cell in nb.cells:
    if 'sns.regplot' in cell.source and 'Neuroticism' in cell.source:
        print("FOUND NEUROTICISM CELL:")
        print(cell.source)

# 4. ValueError in visualization regression coefficients
for cell in nb.cells:
    if "errors = np.abs(ci.values.T - coefs.values[:, None]).T" in cell.source:
        print("FOUND ERROR CELL:")
        print(cell.source)
