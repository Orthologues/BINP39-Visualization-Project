#! /usr/local/Caskroom/miniconda/base/bin/python

import Bio.PDB
import re
import sys
import numpy as np
import subprocess # to run stride
from sklearn.neighbors import KDTree # to calculate close atoms
import urllib.request
import importlib
from program_paths import STRIDE_PATH, SCRIPT_PATH
from rotamers1 import rotamers1
from rotamers2 import rotamers2
from rotamers3 import rotamers3
from rotamers4 import rotamers4
from rotamers5 import rotamers5
rotamers = rotamers1.copy()
rotamers.update(rotamers2)
rotamers.update(rotamers3)
rotamers.update(rotamers4)
rotamers.update(rotamers5)


ind = sys.argv[2]
list_positions_file = open(f'{SCRIPT_PATH}/extra_files/pos{ind}.txt', 'r')
list_filenames = {}
if sys.argv[1] == 'file':
  list_filenames = {f'{SCRIPT_PATH}/extra_files/{ind}.pdb': []}
  for line in list_positions_file:
    line = line.rstrip()
    list_filenames[f'{SCRIPT_PATH}/extra_files/{ind}.pdb'].append(line)
else:
  for line in list_positions_file:
    line = line.rstrip()
    if re.match('>', line):
      filename = re.search('>(.*)', line).group(1).upper() + '.pdb'
      url = 'http://files.rcsb.org/download/' + filename
      filename = f'{SCRIPT_PATH}/extra_files/' + filename
      urllib.request.urlretrieve(url, filename)
      list_filenames[filename] = []
    else:
      list_filenames[filename].append(line)
list_positions_file.close()

  

backbone = {"N":1.64, "C":1.61, "CA":1.76, "O":1.42, "CB":1.88} # backbone atoms and their radii
backbone_hydrogen = {"N":'d', "C":'n', "CA":'n', "O":'a', "CB":'n'} # backbone atoms and their hydrogen bond abilities
specials = ['GLY', 'PRO'] # to apply different calculations
branchy = ['LEU', 'PHE', 'TYR', 'TRP']
small_branchy = ['THR', 'CYS', 'VAL', 'ILE']
# The set of information about amino acids
amino_acids = {"ALA":"A", "ARG":"R", "ASN":"N",
   "ASP":"D", "CYS":"C", "GLN":"Q", 
   "GLU":"E", "GLY":"G", "HIS":"H", 
   "ILE":"I", "LEU":"L", "LYS":"K", 
   "MET":"M", "PHE":"F", "PRO":"P",
   "SER":"S", "THR":"T", "TRP":"W", 
   "TYR":"Y", "VAL":"V"}
# from http://prowl.rockefeller.edu/aainfo/volume.htm
amino_acids_surface = {"ALA":115, "ARG":225, "ASN":150, 
   "ASP":160, "CYS":135, "GLN":190, 
   "GLU":180, "GLY":75, "HIS":195, 
   "ILE":175, "LEU":170, "LYS":200, 
   "MET":185, "PHE":210, "PRO":145, 
   "SER":115, "THR":140, "TRP":255, 
   "TYR":230, "VAL":155}
# lists of atoms (by their PDB names) of every side chain (excluding CB)
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
   "THR":['CG2', 'OG1'], 
   "TRP":['CG', 'CD1', 'CD2', 'NE1', 'CE2', 'CZ2', 'CH2', 'CZ3', 'CE3'], 
   "TYR":['CG', 'CD1', 'CD2', 'CE1', 'CZ', 'OH', 'CE2'], 
   "VAL":['CG1', 'CG2']}
# vdW radii from Chimera documentation
sidechain_radii = {"ARG":[1.88, 1.88, 1.64, 1.61, 1.64, 1.64], 
   "ASN":[1.61, 1.42, 1.64], 
   "ASP":[1.61, 1.46, 1.46], 
   "CYS":[1.77], 
   "GLN":[1.88, 1.61, 1.42, 1.64], 
   "GLU":[1.88, 1.61, 1.46, 1.46], 
   "HIS":[1.61, 1.64, 1.61, 1.61, 1.64], 
   "ILE":[1.88, 1.88, 1.88], 
   "LEU":[1.88, 1.88, 1.88], 
   "LYS":[1.88, 1.88, 1.88, 1.64], 
   "MET":[1.88, 1.77, 1.88], 
   "PHE":[1.88, 1.61, 1.76, 1.76, 1.76, 1.76], 
   "PRO":[1.88, 1.88], 
   "SER":[1.46], 
   "THR":[1.88, 1.46], 
   "TRP":[1.61, 1.76, 1.61, 1.64, 1.61, 1.76, 1.76, 1.76, 1.76], 
   "TYR":[1.61, 1.76, 1.76, 1.76, 1.61, 1.46, 1.76], 
   "VAL":[1.88, 1.88]}
# ability to form hydrogen bonds http://www.imgt.org/IMGTeducation/Aide-memoire/_UK/aminoacids/charge/
sidechain_hydrogen = {"ARG":['n', 'n', 'n', 'n', 'd', 'd'], 
   "ASN":['n', 'a', 'd'], 
   "ASP":['n', 'a', 'a'], 
   "CYS":['n'], 
   "GLN":['n', 'n', 'a', 'd'], 
   "GLU":['n', 'n', 'a', 'a'], 
   "HIS":['n', 'b', 'n', 'n', 'b'], 
   "ILE":['n', 'n', 'n'], 
   "LEU":['n', 'n', 'n'], 
   "LYS":['n', 'n', 'n', 'd'], 
   "MET":['n', 'n', 'n'], 
   "PHE":['n', 'n', 'n', 'n', 'n', 'n'], 
   "PRO":['n', 'n'], 
   "SER":['b'], 
   "THR":['n', 'b'], 
   "TRP":['n', 'n', 'n', 'd', 'n', 'n', 'n', 'n', 'n'], 
   "TYR":['n', 'n', 'n', 'n', 'n', 'b', 'n'], 
   "VAL":['n', 'n']}

# calculate stride file for accessibility and phi/psi angles
def get_stride(structure_id, filename):
  stride_proc = subprocess.Popen([f'{STRIDE_PATH}/stride', filename], stdout=subprocess.PIPE, universal_newlines=True)
  stride_file = repr(stride_proc.communicate()[0])
  pattern = re.compile('(nASG.*?\\\\)')
  lines = re.findall(pattern, stride_file)
  phis = {} # phi angles for every aa position: phis[chain][position] = phi angle
  psis = {} # psi angles for every aa position
  accs = {} # accessibility for every aa position
  structure_id_real = ''
  for line in lines:
      info = line.split()
      if len(info) == 1: continue
      chain = info[2]
      position = info[3]
      if not re.match('^\d+$', position): continue
      if chain not in phis:
        phis[chain] = {}
        psis[chain] = {}
        accs[chain] = {}
      phis[chain][position] = info[7]
      psis[chain][position] = info[8]
      accs[chain][position] = float(info[9])
      if not structure_id_real: structure_id_real = info[10][:4]
  if not re.match('\w', structure_id_real): structure_id_real = structure_id
  return(phis, psis, accs, structure_id_real)

# create a kd tree of all atoms to look for close ones later
def collect_atoms(structure):
  all_atoms = [] # atom objects for all atoms
  all_coordinates = [] # coordinates for all atoms
  for o in structure[0]: # for every chain in the structure
    for k in o:        # for every residue in the chain
      if k.get_resname() != 'HOH': # water molecules don't count
        for atom in k:
          coordinates = atom.get_coord()
          all_coordinates.append(coordinates)
          resname = k.get_resname()
          all_atoms.append(atom)
  tree = KDTree(np.array(all_coordinates), leaf_size=2)
  return tree, all_atoms
          

# Find surroundings of the residue
def find_closeby_atoms(chain, position, tree, all_atoms):
  closeby_atoms = [] # every atom in proximity of the residue
  closeby_atoms_hydrogen_check = [] # ability to form hydrogen bonds
  closeby_atom_radii = []
  all_coordinates = [] # coordinates of closeby atoms
  aa_in_position = structure[0][chain][int(position)] # position in the structure that is being examined
  coordinates =  aa_in_position['CA'].get_coord()
  inds = tree.query_radius(coordinates.reshape(1, -1), r=10.5) # distance between CA and the far end of NH in Arg is maximum (7.29 + 1.64 =) 8.93, distance to the nearest possible clash is (1.88 - 0.4)
  for i in inds:
    for k in i:  # i is a list inside the array inds
      atom = all_atoms[k] # k index matches the index in all_atoms list for the atom
      if re.match('H', atom.get_name()): continue # ignore hydrogens
      pos_aa_atom = atom.get_parent().get_id()[1]
      if pos_aa_atom == position: continue # if the atom is a part of the position being examined, skip
      resname = atom.get_parent().get_resname() # name of the amino acid of the atom
      all_coordinates.append(atom.get_coord())
      closeby_atoms.append(all_atoms[k]) # add the atom to the list
      if resname in sidechain_atoms:  # if not heteroatom
        check = 0
        for m in range(len(sidechain_atoms[resname])): # check every atom of the side chain
          if sidechain_atoms[resname][m] == atom.get_name(): # once find the right atom
            check = 1
            closeby_atom_radii.append(sidechain_radii[resname][m]) # the radius of the atom
            closeby_atoms_hydrogen_check.append(sidechain_hydrogen[resname][m]) # the ability to form hydrogen bonds
        if not check and atom.get_name() in backbone: 
            check = 1
            closeby_atom_radii.append(backbone[atom.get_name()])
            closeby_atoms_hydrogen_check.append(backbone_hydrogen[atom.get_name()])
        elif not check: 
          closeby_atom_radii.append(1.4) # the smallest possible radius
          closeby_atoms_hydrogen_check.append('n')
      else: 
        closeby_atom_radii.append(1.4)
        closeby_atoms_hydrogen_check.append('n')
  closeby_tree = KDTree(np.array(all_coordinates), leaf_size=2)
  return closeby_atoms, closeby_atoms_hydrogen_check, closeby_atom_radii, closeby_tree

# Find the rotamers for the phi and psi angles
def find_rotamers_by_angle(phi, psi, ind2, angles):
  angles[ind2] = []
  suitable_rotamers = {}
  phi_check1 = re.match("[^\.]+", phi).group()
  phi_check1 = str(phi_check1[:-1]) + '0'
  psi_check1 = re.match("[^\.]+", psi).group()
  psi_check1 = str(psi_check1[:-1]) + '0'
  phi_check0 = int(phi_check1) - 10
  psi_check0 = int(psi_check1) - 10
  phi_check2 = int(phi_check1) + 10
  psi_check2 = int(psi_check1) + 10
  psis = [psi_check0, psi_check1, psi_check2]
  phis = [phi_check0, phi_check1, phi_check2]
  for phi in phis:
    if int(phi) >= 180:
      phi = int(phi) - 360
    elif int(phi) <= -180:
      phi = int(phi) + 360
    for psi in psis:
      if int(psi) > 180:
        psi = int(psi) - 360
      elif int(psi) < -180:
        psi = int(psi) + 360
      if str(phi) == '-0': phi = 0
      if str(psi) == '-0': psi = 0
      pair = str(phi) + ' ' + str(psi)
      angles[ind2].append(pair)
      suitable_rotamers[pair] = rotamers[pair]
  return suitable_rotamers, angles

# Finding coordinates by angles and length
def rotating(axis, vector, angle):
  naxis = axis/(np.linalg.norm(axis))
  newvector = naxis*(np.dot(naxis, vector)) + (np.cos(angle)*(np.cross(np.cross(naxis, vector), naxis)) + np.sin(angle)*(np.cross(naxis, vector)))
  return newvector


from Bio.PDB.vectors import calc_dihedral
# Find the backbone coordinates of the position and the rotation matrix to apply to rotamers
def find_rotation_and_backbone(chain, position, U0t, V0):
  position = int(position)
  # Get coordinates of necessary points
  N_coord = structure[0][chain][position]["N"].get_coord()
  N_vector = structure[0][chain][position]["N"].get_vector()
  CA_coord = structure[0][chain][position]["CA"].get_coord()
  CA_vector = structure[0][chain][position]["CA"].get_vector()
  O_coord = structure[0][chain][position]["O"].get_coord()
  O_vector = structure[0][chain][position]["O"].get_vector()
  C_coord = structure[0][chain][position]["C"].get_coord()
  C_vector = structure[0][chain][position]["C"].get_vector()
  resname = structure[0][chain][position].get_resname()
  
  if resname not in specials and "CB" in structure[0][chain][position]: # except Gly and Pro
    CB_coord = structure[0][chain][position]["CB"].get_coord()
    CB_vector = structure[0][chain][position]["CB"].get_vector()
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
  if position-1 in structure[0][chain]:
    C1_coord = structure[0][chain][position-1]["C"].get_coord()
    C1_vector = structure[0][chain][position-1]["C"].get_vector()
  else: # create coordinates for C1
    x = CA_coord - CB_coord
    y = CA_coord - N_coord
    z = np.cross(x, y)
    C1_coord = rotating(z, y, 1) # anything, just to adjust the length of CB later
    C1_vector = Bio.PDB.Vector(C1_coord)
  backbone_coordinates = {'N  ':N_coord, 'CA ':CA_coord, 'O  ':O_coord, 'C  ':C_coord}
  
  N_CA_distance = structure[0][chain][position]["N"] - structure[0][chain][position]["CA"]
  Nnew = ((N_coord - CA_coord)/N_CA_distance).round(3) # in rotamer dictionary N is in distance of 1 from CA which is zero
  x = N_coord - C1_coord
  y = N_coord - CA_coord
  z = np.cross(x, y)
  angle1 = np.deg2rad(109.5)
  angle2 = calc_dihedral(C1_vector, N_vector, CA_vector, CB_vector)
  a = rotating(z, y, angle1)
  b = rotating(-y, a, angle2)
  CB_coord = CA_coord + 1.52*(b/(np.linalg.norm(b))) # CB with the same orientation but adjusted length
  CBnew = CB_coord - CA_coord # if CA was zero, as in rotamer dictionary
  X = np.transpose(np.array([Nnew, CA0, CBnew]))
  U, S, Vt = np.linalg.svd(X) # singular value decomposition
  R = np.dot(np.dot(U, Vt), np.dot(V0, U0t)) # the rotation matrix for the rotamers
  return backbone_coordinates, CB_coord, CA_coord, R

# To identify if hydrogen bond forms
def check_for_hydrogen_bond(ra, ri, h_check):
  atom1 = sidechain_hydrogen[ra][ri]
  atom2 = h_check
  if atom1 == 'b' and atom2 != 'n':
    return True
  elif atom2 == 'b' and atom1 != 'n':
    return True
  elif atom1 == 'a' and atom2 == 'd':
    return True
  elif atom2 == 'a' and atom1 == 'd':
    return True
  else:
    return False

# Calculate rotamer positions
def calculate_positions(suitable_rotamers,closeby_atoms,closeby_atom_radii,closeby_tree,sidechain_radii,rotation_matrix,CA_coord,CB_coord,pos_acid,position,chain,needed_acids):
  rotamer_coordinates = {} # coordinates of all fitting sidechains to be printed
  rotamer_coordinates['GLY'] = [] # no sidechain there
  bad_matches = [] # all the rotamer names that don't fit
  good_matches = ['GLY'] # amino acids that fit
  bad_acids = []
  possible_rotamers = {}
  if pos_acid == 'GLY': # if Gly is in the position
    inds = closeby_tree.query_radius(CB_coord.reshape(1, -1), r=3.4) # the closest possible clash distance r(CB) + r(max) - 0.4
    if inds[0].size:
      for o in inds:
        for h in o: # for every atom in range
          distance = float(np.linalg.norm(CB_coord-closeby_atoms[h].get_coord()))
          safe = backbone['CB'] + closeby_atom_radii[h]
          clash = safe - distance - 0.4
          if clash > 0.05: # if the atoms clash
            #print('No possible substitutions at position {} found.'.format(position))
            return rotamer_coordinates, good_matches
  if pos_acid == 'ARG' or pos_acid == 'LYS':
    good_matches.append('CYS')
    good_matches.append('SER')
    if pos_acid == 'LYS':
      good_matches.append('MET')
  elif pos_acid in branchy:
    good_matches.append('LEU')
    good_matches.append('ASP')
    good_matches.append('ASN')
    if pos_acid == 'TRP':
      good_matches.append('HIS')
    elif pos_acid == 'TYR':
      good_matches.append('PHE')
    if pos_acid != 'LEU': 
      good_matches.append('MET')
  elif pos_acid in small_branchy:
    good_matches.append('SER')
    if pos_acid == 'VAL' or pos_acid == 'ILE':
      good_matches.append('THR')
      good_matches.append('CYS')
      good_matches.append('SER')
      good_matches.append('VAL')
  elif pos_acid == 'GLN' or pos_acid == 'GLU':
    good_matches.append('GLU')
    good_matches.append('MET')
  good_matches.append('ALA')
  rotamer_coordinates['ALA'] = [CB_coord]
  if pos_acid not in good_matches: good_matches.append(pos_acid)
  for pair in suitable_rotamers:
    for aa in sorted(suitable_rotamers[pair]): # aa is accession code of the rotamer, for example 'ARG1' or 'GLU25'
      coordinates = [] # to store the coordinates of the atoms of sidechain to be fitted
      acid = re.match('\w\w\w', aa).group() # which amino acid is being tried
      if acid in good_matches or amino_acids[acid] not in needed_acids: continue
      C_check = 0 # to check for S-S bridges only once
      for i in range(len(suitable_rotamers[pair][aa])): # for every atom
        if aa in bad_matches: break # if at least one atom of this rotamer clashes already
        new_coord = np.dot(rotation_matrix,suitable_rotamers[pair][aa][i]) + CA_coord
        coordinates.append(new_coord)
        search_radius = sidechain_radii[acid][i] + 1.5 # the furthest possible clash r(CB) - 0.4
        inds = closeby_tree.query_radius(new_coord.reshape(1, -1), r=search_radius)
        if not inds[0].size: continue # if no atoms nearby, continue, no clashes to be found
        for o in inds:
          for h in o:
            if aa in bad_matches: break
            closeby_atom = closeby_atoms[h]
            allowance = 0.4 # allowed overlap
            distance = float(np.linalg.norm(new_coord-closeby_atom.get_coord()))
            if check_for_hydrogen_bond(acid, i, closeby_atoms_hydrogen_check[h]): safe = 2.5 # Jeffrey: 2.5-3.2 Å as "moderate, mostly electrostatic"
            else: safe = sidechain_radii[acid][i] + closeby_atom_radii[h]
            if acid == 'PRO' and (len(suitable_rotamers[pair][aa]) - 1) == i: # for CD of Pro, might "clash" with C-1
              pos_minus1 = int(position) - 1
              if pos_minus1 in structure[0][chain]:
                pos_closeby_atom = int(closeby_atom.get_parent().get_id()[1])
                chain_closeby_atom = closeby_atom.get_parent().get_parent()
                if chain_closeby_atom == structure[0][chain] and pos_closeby_atom == pos_minus1 and closeby_atom.get_name() == 'C':
                  safe =  2.2 # 1.35 both C-N and N-CD, angle 110 and bigger
                  allowance = 0
            if acid == 'CYS' and closeby_atom.get_parent().get_resname() == 'CYS' and not C_check:
              distance = float(np.linalg.norm(CA_coord-closeby_atom.get_parent()['CA'].get_coord()))
              safe = 4 # minimal S-S bridge length
              C_check = 1
            clash = safe - distance - allowance
            if clash >= 0.05: # if the atoms clash
              bad_matches.append(aa)
              break
      if aa not in bad_matches:
        good_matches.append(acid)
        possible_rotamers[acid] = aa
  #print('{} possible substitutions at position {} found,'.format(len(good_matches),position))
  return good_matches, possible_rotamers

# These coordinates correspond to the rotamer dictionary

CA0 = np.array([0, 0, 0])
'''
CB0 = np.array([1.52, 0, 0])
v = float(np.cos(np.deg2rad(109.5)))
u = float(np.sin(np.deg2rad(109.5)))
N0 = np.array([v, u, 0])
X0 = np.transpose(np.array([N0, CA0, CB0]))
U0, S0, V0t = np.linalg.svd(X0)
U0t = np.transpose(U0)
V0 = np.transpose(V0t)
'''
U0t = [[0.98109798, -0.19351162, 0],
 [-0.19351162, -0.98109798, 0],
 [0, 0, 1]]
V0 = [[-0.32353906, -0.94621482, 0],
 [0, 0, 1],
 [0.94621482, -0.32353906, 0]]



# Import the structure
from Bio.PDB.PDBParser import PDBParser
parser = PDBParser(PERMISSIVE=1)
from Bio.PDB.PDBIO import *
io = PDBIO()
w = 0
'''
outfile_name =  'results.tsv' # not universal
file_for_comparison = open(outfile_name, 'w')
'''

class atomSelect(Select):
  def accept_residue(self, residue):
    if residue.get_id()[0] != "W":
      return True
      
    else:
      return False


for filename in sorted(list_filenames):
  angles = {}
  good_matches_all = {}
  bad_matches_all = {}
  matrices = {}
  structure_id = '1111'
  structure = parser.get_structure(structure_id, filename)
  if 0 not in structure: continue
  tree, all_atoms = collect_atoms(structure)
  phis, psis, accs, structure_id_real = get_stride(structure_id, filename)
  io.set_structure(structure)
  end = ind + '_' + structure_id_real
  io.save(f'{SCRIPT_PATH}/templates/pdbfile{end}', atomSelect())
  positions = {}
  for word in list_filenames[filename]:
    number = re.search('\d+', word).group()
    if re.search('\d+$', word):
      positions[number] = []
    else:
      if number not in positions: positions[number] = [word[-1]]
      else: positions[number].append(word[-1])
  for chain in sorted(accs):
    for position in sorted(map(int, accs[chain])):
      if list_filenames[filename] and str(position) not in positions: continue
      position = int(position)
      error = 0
      acid = structure[0][chain][int(position)].get_resname()
      if acid == 'UNK': continue
      #print('calculating {}{} in chain {} of structure {}...'.format(position,acid, chain, structure_id_real))
      for atom in backbone:
        if atom not in structure[0][chain][int(position)] and atom != 'CB':
          error = 1
          break
      if error: 
        #print("Residue skipped: missing atoms.")
        continue
      ind20 = chain + '_' + str(position)
      good_matches_all[ind20] = {}
      bad_matches_all[ind20] = []
      suitable_rotamers, angles = find_rotamers_by_angle(phis[chain][str(position)], psis[chain][str(position)], ind20, angles)
      backbone_coordinates, CB_coord, CA_coord, rotation_matrix = find_rotation_and_backbone(chain, position, U0t, V0)
      matrices[ind20] = np.ndarray.tolist(rotation_matrix)
      if (float(accs[chain][str(position)])/amino_acids_surface[acid])  > 0.5 and len(sidechain_atoms[acid]) > 1: 
        for aa in sorted(amino_acids):
          if not positions[str(position)] or amino_acids[aa] in positions[str(position)]:
            if acid != aa:
              good_matches_all[ind20][aa] = ''
              ind2 = str(end) + '_' + chain + '_' + str(position) + amino_acids[aa]
              print('{} {} {}{}{} {} +'.format(structure_id_real,chain,amino_acids[acid],position,amino_acids[aa],ind2), end = '@') #, file = file_for_comparison
        continue
      closeby_atoms, closeby_atoms_hydrogen_check, closeby_atom_radii, closeby_tree = find_closeby_atoms(chain, position, tree, all_atoms)
      
      if len(positions[str(position)]) == 0: 
        for amino_acid in amino_acids:
          positions[str(position)].append(amino_acids[amino_acid])
          
      possible_amino_acids, possible_rotamers = calculate_positions(suitable_rotamers,closeby_atoms,closeby_atom_radii,closeby_tree,sidechain_radii,rotation_matrix, CA_coord, CB_coord, acid, position,chain, positions[str(position)])
      filenames = {}
      for aa in sorted(amino_acids):
        if acid == aa: continue
        if not positions[str(position)] or amino_acids[aa] in positions[str(position)]:
          subst = '{}{}{}'.format(amino_acids[acid],position,amino_acids[aa])
          ind2 = str(end) + '_' + chain + '_' + str(position) + amino_acids[aa]
          if subst in filenames:
            print('{} {} {} {}'.format(structure_id_real,chain,subst,ind2), end = ' ') #, file = file_for_comparison)
          else: print('{} {} {} {}'.format(structure_id_real,chain,subst,ind2), end = ' ') #, file = file_for_comparison)
          if aa in possible_amino_acids: 
            print('+', end = '@') #, file = file_for_comparison)
            if aa in possible_rotamers: good_matches_all[ind20][aa] = possible_rotamers[aa]
            else: good_matches_all[ind20][aa] = ''
          else: 
            print('-', end = '@') #, file = file_for_comparison)
            bad_matches_all[ind20].append(aa)
  subprocess.call(['rm', filename])
  info_file = open(f'{SCRIPT_PATH}/extra_files/info{end}.py', 'w')
  print('angles = ', end = '', file =info_file)
  print(angles, file =info_file)
  print('good_acids = ', end = '', file =info_file)
  print(good_matches_all, file =info_file)
  print('bad_acids = ', end = '', file =info_file)
  print(bad_matches_all, file =info_file)
  print('matrices = ', end = '', file =info_file)
  print(matrices, file =info_file)
  info_file.close()

  

#file_for_comparison.close()

