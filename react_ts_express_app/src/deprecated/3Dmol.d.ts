declare module $3Dmol {

  module Gradient {
    class ROYGB {
      constructor(range);
    }
    class RWB {
      constructor(range);
    }
    class Sinebow {
      constructor(range);
    }
  }

  type ColorSpec = number | string;

  interface LabelSpec {
    font?: string;
    fontSize?: number;
    fontColor?: ColorSpec;
    fontOpacity?: number;
    borderThickness?: number;
    borderColor?: ColorSpec;
    borderOpacity?: string|number;
    backgroundColor?: ColorSpec;
    backgroundOpacity?: number;
    position: { x: number; y: number; z: number };
    inFront?: boolean;
    showBackground?: boolean;
    fixed?: boolean;
  }

  /**
   * A renderable label
   */
  class Label {
    /**
     * tag: Label text
     * parameters: Label style and font specifications
     */
    constructor(tag: string, parameters: LabelSpec);
  }

  class Vector3 {
    constructor(x?: number, y?: number, z?: number);
  }

  class VolumeData {
    constructor(str: string, format: string, options?: {});
  }


  interface ShapeSpec {
    color?: ColorSpec;
    alpha?: number;
    wireframe?: boolean;
    linewidth?: number;
    clickable?: boolean;
    callback?: () => any;
  }

  interface ArrowSpec extends ShapeSpec {
    start?: Vector3;
    end?: Vector3;
    radius?: number;
    radiusRatio?: number
    mid?: number;
  }

  interface AtomSelectionSpec extends AtomSpec {
    bonds?: number,
    expand?: number,
    and?: Array<AtomSelectionSpec>,
    or?: Array<AtomSelectionSpec>,
    not?: AtomSelectionSpec
  }

  interface AtomSpec {
    /**
     * Parent residue name.
     */
    resn?: string;
    /**
     * 
     */
    x?: number;
    y?: number;
    z?: number;
    color?: ColorSpec;
    surfaceColor?: ColorSpec;
    elem?: string;
    hetflag?: boolean;
    chain?: string;
    resi?: number|Array<string>|string;
    icode?: number;
    rescode?: number;
    serial?: number;
    atom?: string;
    bonds?: number[];
    ss?: string;
    singleBonds?: boolean;
    bondOrder?: number[];
    properties?: any;
    b?: number;
    pdbline?: string;
    clickable?: boolean;
    callback?: () => any;
    invert?: boolean;
  }

  interface AtomStyleSpec {

  }

  interface CustomShapeSpec {
    vertexArr: Vector3[];
    normalArr: Vector3[];
    faceArr: number[];
    color: { r: number; g: number; b: number }[];
  }

  interface CylinderSpec extends ShapeSpec {
    start?: Vector3;
    end?: Vector3;
    radius?: number;
    fromCap?: boolean;
    toCap?: boolean;
  }

  /**
   * Isosurface style specification.
   */
  interface IsoSurfaceSpec {
    isoval: number;
    color: ColorSpec;
    opacity: number;
    wireframe?: boolean;
    linewidth?: number;
    smoothness?: number;
    sel?: AtomSelectionSpec;
    coords?;
    seldist?: number;
    clickable?: boolean;
    callback?: () => any;
  }

  interface LineSpec extends ShapeSpec {
    /**
     * The starting position (vector) of the line. Defaults to the origin.
     */
    start?: Vector3;
    /**
     * The ending position (vector) of the line. Defaults to the origin.
     */
    end?: Vector3;
  }

  interface SphereSpec extends ShapeSpec {
    center: Vector3;
    radius: number;
  }

  /**
   * A group of related atoms.
   */
  class GLModel {
    constructor(mid?: number, defaultcolors?: number);
    /**
     * Add list of new atoms to the model. Adjust bonds appropriately.
     */
    addAtoms(atoms: AtomSpec[]): void;
    /**
     * atom: atoms to 
     */
    addFrame(atom: AtomSpec);
    // Remove specified atoms from model
    removeAtoms(badatoms: AtomSpec[]);
    /**
     * Returns a list of atoms selected by sel.
     */
    selectedAtoms(sel: AtomSelectionSpec): AtomSpec[];
    /**
     * Set atom style of selected atoms.
     * sel:
     * style:
     * add: If true, add to current style, don't replace.'
     */
    setClickable(sel: AtomSelectionSpec, clickable: boolean, callback: () => any): void;
    setHoverable(sel: AtomSelectionSpec, hoverable: boolean, hover_callback: () => any, 
    unhover_callback: () => any): void;
    setStyle(sel: AtomSelectionSpec, style: AtomStyleSpec, add?: boolean): void;
    /**
     * Convert the model into an object in the format of a ChemDoodle JSON model.
     * whether: or not to include style information. Defaults to false.
     */
    toCDObject(whether?: boolean): Object;
    /**
     * 
     */
    vibrate(numFrames: number, amplitude): void;
  }

  class GLShape {
    constructor(stylespec);
  }

  class GLViewer {
    constructor(element, callback, defaultcolors);
    addArrow(spec?: ArrowSpec): GLShape;
    /**
     * Create and add model to viewer. Given multimodel file and its format, all atoms are added to one model.
     */
    addAsOneMolecule(data: string, format: string): GLModel;
    /**
     * Add custom shape component from user supplied function.
     * spec: Style specification.
     */
    addCustom(spec: CustomShapeSpec): GLShape;
    /**
     * Create and add cylinder shape.
     * spec: Style specification.
     */
    addCylinder(spec: CylinderSpec): GLShape;
    /**
     * Construct isosurface from volumetric data.
     * data: volumetric data.
     * spec: Shape style specification.
     */
    addIsosurface(data: VolumeData, spec: IsoSurfaceSpec): GLShape;
    /**
     * Add label to viewer.
     */
    addLabel(text: string, data: LabelSpec, sel?: AtomSelectionSpec): Label;
    /**
     * Create and add line shape.
     * spec: Style specification, can specify dashed, fashLength, and gapLength.
     */
    addLine(spec?: LineSpec): GLShape;
    /**
     * Create and add model to viewer,
     * given molecular data and its format (pdb, sdf, xyz, or mol2)
     */
    addModel(data?: string, format?: string): GLModel;
    addSphere(spec: SphereSpec);
    /**
     * Animate all models in viewer from their respective frames.
     * interval: speed of animation e.g. 75.
     * loop: 'backward', 'forward', or 'backAndForth'.
     * reps: number of repetitions, 0 indicates infinite loop.
     */
    animate(options: { interval?: number; loop?: string, reps?: number });
    /**
     * Returns the specified model.
     * id: The identifier of the model. Defaults to the last model id.
     */
    getModel(id?: number): GLModel;
    /* Delete all existing models */
    removeAllModels();
    // Remove all shape objects from viewer
    removeAllShapes()
    // Remove all surfaces.
    removeAllSurfaces()
    // Remove label from viewer
    removeLabel(label: Label)
    // Delete specified model from viewer
    removeModel(model: GLModel)
    /* render models */
    render();

    //  Rotate scene by angle degress around axis.    
    rotate(angle: number, axis: string, animationFuration: number): void;
    
    //  Returns a list of atoms selected by sel.    
    selectedAtoms(sel?: AtomSelectionSpec): any[];
    /**
     * Sets the background color. Default is white.
     * hex: Hexcode specified background color, or standard color spec.
     * a: Alpha level. Default is 1.0
     */
    setBackgroundColor(hex: number, a?: number): void;
    /**
     * Set viewer height
     * h: Height in pixels.
     */
    setHeight(h: number): void;
    /**
     * Modify existing labels' text.
     */
    setLabelText(label: Label, text: string): Label;
    /**
     * Set view projection scheme. Either 'orthographic' or 'perspective'.
     */
    setProjection(kind: string): void
    /**
     * Set style properties to all selected atoms.
     * sel: Atom selection specification.
     * style: Style spec to apply to specified atoms.
     */
    setStyle(sel: AtomSelectionSpec, style: AtomStyleSpec);
    /**
     * Set viewer width.
     * w: Width in pixels.
     */
    setWidth(w: number): void;
    /**
     * Set global view styles.
     */
    setViewStyle(options: { style?: string; color?: ColorSpec; width?: number });
    stopAnimate(): void;
    /**
     * Translate the current view by x,y screen coordinates. This pans the camera rather than translating the model.
     * x:
     * y:
     * animationDuration: The duration of the animation in milliseconds.
     */
    translate(x: number, y: number, animationDuration?: number): void;

    /**
     * Zoom current view by a constant factor.
     * factor: Magnification factor. Values greater than 1 will zoom in, less than one will zoom out. Default 2.
     * animationDuration Denotes the duration of a zoom animation.
     */
    zoom(factor?: number, animationDuration?: number): void;
    zoomTo(sel?: AtomSelectionSpec, animationDuration?: number);
  }

  function createViewer(element, config): GLViewer;

  /**
   * Load a PDB/PubChem structure into existing viewer.
   * Automatically calls 'zoomTo' and 'render' on viewer after loading model.
   * query: String specifying pdb or pubchem id; must be prefaced with "pdb:" or "cid:", respectively.
   * viewer: Add new model to existing viewer.
   * options: Specify additional options.
   * callback: Function to call with model as argument after data is loaded.
   */
  function download(query: string, viewer: GLViewer, options: {}, callback: (model: GLModel) => any): GLModel;

  function getPropertyRange(atoms, s: string): any;
}
