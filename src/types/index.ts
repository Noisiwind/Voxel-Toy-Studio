export interface Voxel {
  x: number;
  y: number;
  z: number;
  color: string;
}

export type EngineState = 'stable' | 'dismantling' | 'rebuilding';

export interface VoxelPhysics {
  velocity: { x: number; y: number; z: number };
  angularVelocity: { x: number; y: number; z: number };
}
