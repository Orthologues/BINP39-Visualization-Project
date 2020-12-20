import sys
import re
import importlib
import Bio
from Bio.PDB.PDBParser import PDBParser
import numpy as np
from Bio.PDB.vectors import calc_dihedral
from program_paths import STRIDE_PATH, SCRIPT_PATH


amino_acids2 = {"ALA":"A", "ARG":"R", "ASN":"N","ASP":"D", "CYS":"C", "GLN":"Q", "GLU":"E", "GLY":"G", "HIS":"H", "ILE":"I", "LEU":"L", "LYS":"K", "MET":"M", "PHE":"F", "PRO":"P","SER":"S", "THR":"T", "TRP":"W", "TYR":"Y", "VAL":"V"}
amino_acids = {v: k for k, v in amino_acids2.items()}

# sys.argv[1] should be like '1_6VXX-A_50R'
subst_id = re.search('-(\w_\d+)\w$', sys.argv[1]).group(1)
job_id = re.match('\d+_\w\w\w\w', sys.argv[1]).group()
position = int(re.search('\d+', subst_id).group())
chain = re.match('\w', subst_id).group()
sys.path.append(f'{SCRIPT_PATH}/extra_files')
info = importlib.import_module(f'info{job_id}')
angles = info.angles[subst_id]
good_acids = info.good_acids[subst_id]
bad_acids = info.bad_acids[subst_id]
if subst_id in info.matrices: matrix = np.array(info.matrices[subst_id])

order = ''
subst_aa = amino_acids[re.search('\w$', sys.argv[1]).group()]
if subst_aa in good_acids:
  if good_acids[subst_aa]: order = good_acids[subst_aa]
  else: order = 'calc'
elif subst_aa in bad_acids:
  order = 'first'
if not bad_acids: order = 'first'

def rotating(axis, vector, angle):
  naxis = axis/(np.linalg.norm(axis))
  newvector = naxis*(np.dot(naxis, vector)) + (np.cos(angle)*(np.cross(np.cross(naxis, vector), naxis)) + np.sin(angle)*(np.cross(naxis, vector)))
  return newvector


parser = PDBParser(PERMISSIVE=1)
structure = parser.get_structure('1111', f'{SCRIPT_PATH}/templates/pdbfile{job_id}')
pos_aa_obj = structure[0][chain][position]
pos_acid = pos_aa_obj.get_resname()
CA_coord = pos_aa_obj["CA"].get_coord()
N_coord = pos_aa_obj["N"].get_coord()
N_vector = pos_aa_obj["N"].get_vector()
CA_coord = pos_aa_obj["CA"].get_coord()
CA_vector = pos_aa_obj["CA"].get_vector()
O_coord = pos_aa_obj["O"].get_coord()
O_vector = pos_aa_obj["O"].get_vector() 
C_coord = pos_aa_obj["C"].get_coord()
C_vector = pos_aa_obj["C"].get_vector()
backbone_coordinates = {'N  ':N_coord, 'CA ':CA_coord, 'O  ':O_coord, 'C  ':C_coord}
if "CB" in pos_aa_obj: # except Gly and Pro
  CB_coord = pos_aa_obj["CB"].get_coord()
  CB_vector = pos_aa_obj["CB"].get_vector()
else: # create coordinates for CB
  x = C_coord - O_coord
  y = C_coord - CA_coord
  z = np.cross(x, y)
  angle1 = np.deg2rad(109.5) # an angle C_CA_CB
  angle2 = calc_dihedral(O_vector, C_vector, CA_vector, N_vector) + np.deg2rad(123) # a diangle N_C_CA_CB
  a = rotating(z, y, angle1)
  b = rotating(-y, a, angle2)
  CB_coord = CA_coord + 1.52*(b/(np.linalg.norm(b)))
  CB_vector =  Bio.PDB.Vector(CB_coord)

branchy = ['LEU', 'PHE', 'TYR', 'TRP']
small_branchy = ['THR', 'CYS', 'VAL', 'ILE']
sidechain_atoms = {"ALA":[], 
   "ARG":['CG', 'CD', 'NE', 'CZ', 'NH1', 'NH2'], 
   "ASN":['CG', 'OD1', 'ND2'], 
   "ASP":['CG', 'OD1', 'OD2'], 
   "CYS":['SG'], 
   "GLY":[],
   "GLN":['CG', 'CD', 'OE1', 'NE2'], 
   "GLU":['CG', 'CD', 'OE1', 'OE2'], 
   "HIS":['CG', 'ND1', 'CD2', 'CE1', 'NE2'], 
   "ILE":['CG1', 'CG2', 'CD1'], 
   "LEU":['CG', 'CD1', 'CD2'],  
   "LYS":['CG', 'CD', 'CE', 'NZ'], 
   "MET":['CG', 'SD', 'CE'], 
   "PHE":['CG', 'CD1', 'CD2', 'CE1', 'CZ', 'CE2'],  
   "PRO":['CG', 'CD'], 
   "SER":['OG'], 
   "THR":['OG1', 'CG2'], 
   "TRP":['CG', 'CD1', 'CD2', 'NE1', 'CE2', 'CZ2', 'CH2', 'CZ3', 'CE3'],  
   "TYR":['CG', 'CD1', 'CD2', 'CE1', 'CZ', 'OH', 'CE2'],  
   "VAL":['CG1', 'CG2']} 

sys.path.append(f'{SCRIPT_PATH}/libraries')
rotamer_coordinates = []
if subst_aa == 'GLY':
  rotamer_coordinates = []
elif subst_aa == 'ALA':
  rotamer_coordinates = [CB_coord]
elif order == 'calc':
  rotamer_coordinates = [CB_coord]
  if pos_acid == 'ARG' or pos_acid == 'LYS':
    if subst_aa == 'CYS' or subst_aa == 'SER':
      rotamer_coordinates.append(pos_aa_obj["CG"].get_coord())
    elif subst_aa == 'MET':
      rotamer_coordinates.append(pos_aa_obj["CG"].get_coord())
      rotamer_coordinates.append(pos_aa_obj["CD"].get_coord())
      rotamer_coordinates.append(pos_aa_obj["CE"].get_coord())
  elif pos_acid in branchy:
    if subst_aa == 'LEU' or subst_aa == 'ASP' or ubst_aa == 'ASN':
      rotamer_coordinates.append(pos_aa_obj["CG"].get_coord())
      rotamer_coordinates.append(pos_aa_obj["CD1"].get_coord())
      rotamer_coordinates.append(pos_aa_obj["CD2"].get_coord())
    if subst_aa == 'HIS':
      rotamer_coordinates.append(pos_aa_obj['CG'].get_coord())
      rotamer_coordinates.append(pos_aa_obj['CD1'].get_coord())
      rotamer_coordinates.append(pos_aa_obj['CD2'].get_coord())
      rotamer_coordinates.append(pos_aa_obj['NE1'].get_coord())
      rotamer_coordinates.append(pos_aa_obj['CE2'].get_coord())
    elif subst_aa == 'PHE':
      rotamer_coordinates.append(pos_aa_obj['CG'].get_coord())
      rotamer_coordinates.append(pos_aa_obj['CD1'].get_coord())
      rotamer_coordinates.append(pos_aa_obj['CD2'].get_coord())
      rotamer_coordinates.append(pos_aa_obj['CE1'].get_coord())
      rotamer_coordinates.append(pos_aa_obj['CZ'].get_coord())
      rotamer_coordinates.append(pos_aa_obj['CE2'].get_coord())
    if subst_aa == 'MET':
      rotamer_coordinates.append(pos_aa_obj["CG"].get_coord())
      rotamer_coordinates.append(pos_aa_obj["CD1"].get_coord())
      if pos_acid == 'PHE' or pos_acid == 'TYR':
        rotamer_coordinates.append(pos_aa_obj["CE1"].get_coord())
      elif pos_acid == 'TRP':
        rotamer_coordinates.append(pos_aa_obj["NE1"].get_coord())
  elif pos_acid in small_branchy:
    if subst_aa == 'SER' or subst_aa == 'CYS':
      if pos_acid == 'CYS': rotamer_coordinates.append(pos_aa_obj["SG"].get_coord())
      elif pos_acid == 'SER': rotamer_coordinates.append(pos_aa_obj["OG"].get_coord())
      elif pos_acid == 'VAL' or pos_acid == 'ILE': rotamer_coordinates.append(pos_aa_obj["CG1"].get_coord())
    elif pos_acid == 'VAL' or pos_acid == 'ILE':
      if subst_aa == 'THR' or subst_aa == 'VAL':
        rotamer_coordinates.append(pos_aa_obj["CG1"].get_coord())
        rotamer_coordinates.append(pos_aa_obj["CG2"].get_coord())
  elif pos_acid == 'GLN' or pos_acid == 'GLU':
    if subst_aa == 'GLU': 
      rotamer_coordinates.append(pos_aa_obj['CG'].get_coord())
      rotamer_coordinates.append(pos_aa_obj['CD'].get_coord())
      rotamer_coordinates.append(pos_aa_obj['OE1'].get_coord())
      rotamer_coordinates.append(pos_aa_obj['NE2'].get_coord())
    elif subst_aa == 'MET':
      rotamer_coordinates.append(pos_aa_obj['CG'].get_coord())
      rotamer_coordinates.append(pos_aa_obj['CD'].get_coord())
      rotamer_coordinates.append(pos_aa_obj['OE1'].get_coord())
else:
  rotamers = {}
  rotamer_coordinates = [CB_coord]
  for angle in angles:
    angles_list = re.findall('-*\d+', angle)
    angles2 = 'phi' + re.sub('-', 'm', angles_list[0]) + 'psi' + re.sub('-', 'm', angles_list[1])
    rotamers2 = importlib.import_module(angles2).rotamers[subst_aa]
    for rotamer in rotamers2:
      rotamers[rotamer] = rotamers2[rotamer]
  if order == 'first': right_rotamer = sorted(rotamers)[0]
  else: right_rotamer = order
  for i in range(len(rotamers[right_rotamer])): # for every atom
    new_coord = np.dot(matrix,rotamers[right_rotamer][i]) + CA_coord
    rotamer_coordinates.append(new_coord)
  

def make_coord(coord): # to use in print_output function
  printcoord1 =  re.search('-*\d+\.\d+', str(float(coord))).group()
  printcoord2 = re.match('-*\d+\.\d\d\d', printcoord1)
  printcoord3 = ''
  if not printcoord2:
    length1 = len(re.search('\.\d+', printcoord1).group()) - 1
    for k in range(length1):
      printcoord3 = printcoord1 + '0'
  else:
    printcoord3 = printcoord2.group()
  length2 = len(re.match('-*\d+', printcoord1).group())
  if length2 < 3: 
    n = 3 - length2
    for m in range(n):
      printcoord3 = ' ' + printcoord3
  return printcoord3


w = 1
c = 1
outfilename = f'{SCRIPT_PATH}/templates/acids' + sys.argv[1]
outfile = open(outfilename, 'w')
acid = subst_aa
subst = amino_acids2[pos_acid] + str(position) + amino_acids2[subst_aa]
ccc = str(c)
if len(ccc) < 5:
  n = 5 - len(ccc)
  for m in range(n):
    ccc = ' ' + ccc
for i in range(len(rotamer_coordinates)+1):
  if i == 0:
    for atom in backbone_coordinates:
      www = str(w)
      if len(str(w)) == 1: w = '  ' + str(w)
      elif len(str(w)) == 2: w = ' ' + str(w)
      elif len(str(w)) == 3: w = str(w)
      coord1 = make_coord(backbone_coordinates[atom][0])
      coord2 = make_coord(backbone_coordinates[atom][1])
      coord3 = make_coord(backbone_coordinates[atom][2])
      if len(www) < 5:
        n = 5 - len(www)
        for m in range(n):
          www = ' ' + www
      print('ATOM  {}  {} {} {}     {} {} {}  1.00  0.00'.format(www,atom,acid,ccc,coord1,coord2,coord3), file = outfile)
      w = int(w) + 1
  else:
    www = str(w)
    k = i - 1
    j = k - 1
    if k == 0: atom = 'CB'
    else: atom = sidechain_atoms[acid][j]
    if len(atom) == 2: atom = atom + ' '
    coord1 = make_coord(rotamer_coordinates[k][0])
    coord2 = make_coord(rotamer_coordinates[k][1])
    coord3 = make_coord(rotamer_coordinates[k][2])
    if len(www) < 5:
      n = 5 - len(www)
      for m in range(n):
        www = ' ' + www
    print('ATOM  {}  {} {} {}     {} {} {}  1.00  0.00'.format(www,atom,acid,ccc,coord1,coord2,coord3), file = outfile)
    w = int(w) + 1
c = int(c) + 1
outfile.close()
