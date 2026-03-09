import json

with open('NB3_temporal_dynamics.ipynb', 'r') as f:
    nb = json.load(f)

for i, cell in enumerate(nb.get('cells', [])):
    if 'Carry-Over Effects by Treatment Group' in ''.join(cell.get('source', [])):
        print(f"Cell {i} outputs:")
        for out in cell.get('outputs', []):
            if out.get('name') == 'stdout':
                print(f"STDOUT: {out.get('text')}")
            else:
                print(f"OTHER OUTPUT TYPE: {out.get('output_type')}")
