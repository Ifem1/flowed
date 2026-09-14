from pathlib import Path
import ast
p=Path('contracts/Flowed.py'); tree=ast.parse(p.read_text()); assert any(isinstance(n,ast.ClassDef) and n.name=='Flowed' for n in tree.body); print('Flowed.py syntax: PASS')
