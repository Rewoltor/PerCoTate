import json
import glob
import traceback

for f in sorted(glob.glob("NB*.ipynb")):
    print(f"\\n{'='*50}\\nExecuting {f}\\n{'='*50}")
    with open(f, 'r') as file:
        nb = json.load(file)
    
    for i, cell in enumerate(nb['cells']):
        if cell['cell_type'] == 'code':
            source = "".join(cell['source'])
            if not source.strip():
                continue
            print(f"--- Running Cell {i} ---")
            try:
                exec(source, globals())
            except Exception as e:
                print(f"ERROR in {f} cell {i}: {e}")
                traceback.print_exc()
                break
    print(f"Finished {f}")
