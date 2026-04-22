import pingouin as pg
import inspect

sig = inspect.signature(pg.mediation_analysis)
print(sig)
