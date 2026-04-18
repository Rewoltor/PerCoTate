import os
import nbformat
import glob

notebooks = sorted(glob.glob("NB*.ipynb"))

output_lines = ["# Comprehensive Analysis Results\n\nThis document contains the aggregated markdown and code outputs from all analysis notebooks.\n\n"]

for nb_file in notebooks:
    output_lines.append(f"## {nb_file}\n\n")
    try:
        with open(nb_file, "r", encoding="utf-8") as f:
            nb = nbformat.read(f, as_version=4)
        
        for cell in nb.cells:
            if cell.cell_type == "markdown":
                output_lines.append(cell.source + "\n\n")
            elif cell.cell_type == "code":
                # Only append output text if it exists
                if cell.outputs:
                    output_lines.append("```text\n")
                    for output in cell.outputs:
                        if output.output_type == "stream":
                            output_lines.append(output.text)
                        elif output.output_type == "execute_result" or output.output_type == "display_data":
                            if "text/plain" in output.data:
                                output_lines.append(output.data["text/plain"] + "\n")
                    output_lines.append("```\n\n")
    except Exception as e:
        output_lines.append(f"Error reading notebook {nb_file}: {e}\n\n")

with open("all_analysis_results.md", "w", encoding="utf-8") as out:
    out.writelines(output_lines)

print("Created all_analysis_results.md")
