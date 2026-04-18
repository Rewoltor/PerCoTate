# Data Analysis Projects

This directory contains two different versions of the data analysis for the medical imaging study.

## [New analysis](./New%20analysis) (Primary)
This is the current, rigorous analysis pipeline designed for final publication. 
- **Focus**: Validation of ground truth using a Platinum Standard (Radiologist Consensus).
- **Architecture**: Modular structure using `helpers.py` and sequential notebooks (`NB0`-`NB5`).
- **Statistical Standards**: Employs mixed-effects models, FDR correction, and directional noise audits.

## [Original Analysis](./Original%20Analysis) (Legacy/Reference)
This project contains the preliminary analysis conducted prior to the full platinum standard validation.
- **Usage**: Kept for historical reference and to compare how findings evolved after the ground truth cleanup.
