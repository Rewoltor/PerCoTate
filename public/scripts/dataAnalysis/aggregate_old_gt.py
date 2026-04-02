import os
import json

def get_notebook_outputs(filepath):
    if not os.path.exists(filepath):
        return f"File {filepath} not found.\n\n"
    
    with open(filepath, 'r') as f:
        nb = json.load(f)
    
    content = f"# {os.path.basename(filepath)}\n\n"
    for cell in nb.get('cells', []):
        cell_type = cell.get('cell_type')
        source = "".join(cell.get('source', []))
        
        if cell_type == 'markdown':
            content += source + "\n\n"
        elif cell_type == 'code':
            # Skip code source
            outputs = cell.get('outputs', [])
            if outputs:
                content += "#### Output\n"
                for output in outputs:
                    output_type = output.get('output_type')
                    if output_type == 'stream':
                        text = "".join(output.get('text', []))
                        content += f"```text\n{text}\n```\n"
                    elif output_type in ['execute_result', 'display_data']:
                        data = output.get('data', {})
                        if 'text/plain' in data:
                            text = "".join(data['text/plain'])
                            content += f"```text\n{text}\n```\n"
                content += "\n"
    return content

notebooks = [
    "NB0_data_loading.ipynb",
    "NB1_performance_accuracy.ipynb",
    "NB2_human_ai_interaction.ipynb",
    "NB3_temporal_dynamics.ipynb",
    "NB4_psychometrics.ipynb",
    "NB5_integrated_models.ipynb",
    "NB6_label_noise_audit.ipynb"
]

full_content = ""
for nb in notebooks:
    full_content += get_notebook_outputs(nb)
    full_content += "\n---\n\n"

with open("all_analysis_results_old_gt.md", "w") as f:
    f.write(full_content)

print("Created all_analysis_results_old_gt.md")
