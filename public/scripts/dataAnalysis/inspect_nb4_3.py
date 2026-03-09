import nbformat

nb_path = '/Users/martonbaltay/Documents/FeelGoodAI/Code/PerCoTate/public/scripts/dataAnalysis/NB4_psychometrics.ipynb'
try:
    with open(nb_path, 'r', encoding='utf-8') as f:
        nb = nbformat.read(f, as_version=4)
except Exception as e:
    pass

for i in [5, 7, 8, 10, 14, 15]:
    try:
        print(f"--- CELL {i} ---")
        print(nb.cells[i].source)
    except:
        pass
