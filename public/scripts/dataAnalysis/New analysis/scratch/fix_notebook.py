import json

notebook_path = 'NB4_integrated_models.ipynb'
with open(notebook_path, 'r') as f:
    nb = json.load(f)

# Find the cell with mediation_analysis and remove logistic=True
for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        source = "".join(cell['source'])
        if 'pg.mediation_analysis' in source and 'logistic=True' in source:
            new_source = source.replace(', logistic=True', '')
            cell['source'] = [line + '\n' for line in new_source.split('\n')]
            # Clean up potential double newlines if needed, but simple split/join is usually okay
            if cell['source'][-1] == '\n':
                cell['source'].pop()

with open(notebook_path, 'w') as f:
    json.dump(nb, f, indent=1)

print("Notebook updated.")
