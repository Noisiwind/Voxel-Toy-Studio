export interface Voxel {
  x: number;
  y: number;
  z: number;
  c: string; // color (缩短以节省JSON空间)
}

export type EngineState = 'stable' | 'dismantling' | 'rebuilding';

export interface VoxelPhysics {
  velocity: { x: number; y: number; z: number };
  angularVelocity: { x: number; y: number; z: number };
}
