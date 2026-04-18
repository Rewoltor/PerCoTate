import json

files = [
    'NB1_performance_accuracy.ipynb',
    'NB2_human_ai_interaction.ipynb',
    'NB5_integrated_models.ipynb',
    'NB6_label_noise_audit.ipynb'
]

for fp in files:
    with open(fp, 'r') as f:
        nb = json.load(f)
    print(f'\\n### `{fp}`')
    for cell in nb['cells']:
        if cell['cell_type'] == 'code':
            src = ''.join(cell['source'])
            original = src
            
            if "['healthy', 'mild', 'moderate', 'severe']" in src:
                src = src.replace("['healthy', 'mild', 'moderate', 'severe']", "['healthy', 'doubtful', 'mild', 'moderate', 'severe']")
                if "palette=['#4C72B0', '#DD8452', '#55A868', '#C44E52']" in src:
                    src = src.replace("palette=['#4C72B0', '#DD8452', '#55A868', '#C44E52']", "palette=['#4C72B0', '#A3C1AD', '#DD8452', '#55A868', '#C44E52']")
            
            if "kl_num_map = {'healthy': 0, 'mild': 1, 'moderate': 2, 'severe': 3}" in src:
                src = src.replace("kl_num_map = {'healthy': 0, 'mild': 1, 'moderate': 2, 'severe': 3}", "kl_num_map = {'healthy': 0, 'doubtful': 1, 'mild': 2, 'moderate': 3, 'severe': 4}")
                
            if "{'healthy': 'Clear', 'mild': 'Ambiguous', 'moderate': 'Clear', 'severe': 'Clear'}" in src:
                src = src.replace(
                    "{'healthy': 'Clear', 'mild': 'Ambiguous', 'moderate': 'Clear', 'severe': 'Clear'}", 
                    "{'healthy': 'Clear', 'doubtful': 'Ambiguous', 'mild': 'Ambiguous', 'moderate': 'Clear', 'severe': 'Clear'}"
                )
                
            if "'healthy': COLORS['correct'],\n        'mild': COLORS['neutral']" in src:
                src = src.replace(
                    "'healthy': COLORS['correct'],\n        'mild': COLORS['neutral']", 
                    "'healthy': COLORS['correct'],\n        'doubtful': '#A3C1AD',\n        'mild': COLORS['neutral']"
                )

            if src != original:
                print('---')
                print(f"```python\n{src.strip()}\n```")
