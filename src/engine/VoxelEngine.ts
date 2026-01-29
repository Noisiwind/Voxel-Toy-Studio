import * as THREE from 'three';
import { Voxel, EngineState, VoxelPhysics } from '../types';

export class VoxelEngine {
  private scene: THREE.Scene;
  private instancedMesh: THREE.InstancedMesh | null = null;
  private voxels: Voxel[] = [];
  private state: EngineState = 'stable';
  private physics: VoxelPhysics[] = [];
  private targetPositions: THREE.Vector3[] = [];
  private currentPositions: THREE.Vector3[] = [];
  private currentRotations: THREE.Euler[] = [];
  private lerpSpeed = 0.05;
  private gravity = -0.02;
  private groundY = 0.5;

  // 用于拖动交互
  private raycaster = new THREE.Raycaster();
  private draggedIndex: number | null = null;
  private dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private dragOffset = new THREE.Vector3();

  // 用于手势抓取交互
  private grabbedIndices: Set<number> = new Set();
  private grabCenter = new THREE.Vector3();
  private lastGrabPosition = new THREE.Vector3();
  private grabVelocity = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  createModel(voxels: Voxel[]) {
    // 移除旧模型
    if (this.instancedMesh) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh.geometry.dispose();
      if (Array.isArray(this.instancedMesh.material)) {
        this.instancedMesh.material.forEach(m => m.dispose());
      } else {
        this.instancedMesh.material.dispose();
      }
    }

    // 计算最小 Y 值，确保模型底部在地板上方
    const minY = Math.min(...voxels.map(v => v.y));
    const yOffset = minY < 0 ? -minY + 0.5 : 0.5; // 至少抬高 0.5，避免与地板重叠

    // 应用 Y 轴偏移
    this.voxels = voxels.map(v => ({
      ...v,
      y: v.y + yOffset
    }));

    this.state = 'stable';

    // 创建 InstancedMesh - 使用更好的材质
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.6,
      metalness: 0.15,
      envMapIntensity: 1.0,
    });

    this.instancedMesh = new THREE.InstancedMesh(
      geometry,
      material,
      this.voxels.length
    );
    this.instancedMesh.castShadow = true;
    this.instancedMesh.receiveShadow = true;

    // 设置每个实例的位置和颜色
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();

    this.voxels.forEach((voxel, i) => {
      matrix.setPosition(voxel.x, voxel.y, voxel.z);
      this.instancedMesh!.setMatrixAt(i, matrix);
      color.set(voxel.color);
      this.instancedMesh!.setColorAt(i, color);
    });

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }

    this.scene.add(this.instancedMesh);

    // 初始化物理和位置数组
    this.physics = [];
    this.targetPositions = [];
    this.currentPositions = voxels.map(v => new THREE.Vector3(v.x, v.y, v.z));
    this.currentRotations = voxels.map(() => new THREE.Euler(0, 0, 0));
  }

  dismantle() {
    if (!this.instancedMesh || this.state !== 'stable') return;

    this.state = 'dismantling';

    // 为每个方块生成随机速度
    this.physics = this.voxels.map(() => ({
      velocity: {
        x: (Math.random() - 0.5) * 0.3,
        y: Math.random() * 0.2 + 0.1,
        z: (Math.random() - 0.5) * 0.3,
      },
      angularVelocity: {
        x: (Math.random() - 0.5) * 0.2,
        y: (Math.random() - 0.5) * 0.2,
        z: (Math.random() - 0.5) * 0.2,
      },
    }));
  }

  rebuild(newVoxels: Voxel[]) {
    if (!this.instancedMesh) return;

    this.state = 'rebuilding';

    // 计算新模型的最小 Y 值并应用偏移
    const minY = Math.min(...newVoxels.map(v => v.y));
    const yOffset = minY < 0 ? -minY + 0.5 : 0.5;

    this.voxels = newVoxels.map(v => ({
      ...v,
      y: v.y + yOffset
    }));

    // 设置目标位置（使用调整后的坐标）
    this.targetPositions = this.voxels.map(v => new THREE.Vector3(v.x, v.y, v.z));

    // 重置旋转为零（消除拆解时的旋转）
    this.currentRotations = this.voxels.map(() => new THREE.Euler(0, 0, 0));

    // 更新颜色
    const color = new THREE.Color();
    this.voxels.forEach((voxel, i) => {
      if (i < this.instancedMesh!.count) {
        color.set(voxel.color);
        this.instancedMesh!.setColorAt(i, color);
      }
    });

    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
  }

  update() {
    if (!this.instancedMesh) return;

    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3(1, 1, 1);

    if (this.state === 'dismantling') {
      let allSettled = true;

      for (let i = 0; i < this.voxels.length; i++) {
        const phys = this.physics[i];
        const pos = this.currentPositions[i];
        const rot = this.currentRotations[i];

        // 应用速度
        pos.x += phys.velocity.x;
        pos.y += phys.velocity.y;
        pos.z += phys.velocity.z;

        // 应用重力
        phys.velocity.y += this.gravity;

        // 地面碰撞
        if (pos.y <= this.groundY) {
          pos.y = this.groundY;
          phys.velocity.y = -phys.velocity.y * 0.2; // 减少反弹
          phys.velocity.x *= 0.6; // 增加摩擦力
          phys.velocity.z *= 0.6;

          // 立即停止所有旋转
          phys.angularVelocity.x = 0;
          phys.angularVelocity.y = 0;
          phys.angularVelocity.z = 0;

          if (Math.abs(phys.velocity.y) < 0.01) {
            phys.velocity.y = 0;
            phys.velocity.x = 0;
            phys.velocity.z = 0;
          } else {
            allSettled = false;
          }
        } else {
          allSettled = false;
        }

        // 旋转（只在空中旋转）
        rot.x += phys.angularVelocity.x;
        rot.y += phys.angularVelocity.y;
        rot.z += phys.angularVelocity.z;
        quaternion.setFromEuler(rot);

        // 更新矩阵
        matrix.compose(pos, quaternion, scale);
        this.instancedMesh.setMatrixAt(i, matrix);
      }

      this.instancedMesh.instanceMatrix.needsUpdate = true;

      if (allSettled) {
        this.state = 'stable';
      }
    } else if (this.state === 'rebuilding') {
      let allReached = true;

      for (let i = 0; i < this.voxels.length; i++) {
        const current = this.currentPositions[i];
        const target = this.targetPositions[i];
        const rot = this.currentRotations[i];

        // Lerp 插值
        current.lerp(target, this.lerpSpeed);

        // Lerp 旋转回到零
        rot.x *= (1 - this.lerpSpeed);
        rot.y *= (1 - this.lerpSpeed);
        rot.z *= (1 - this.lerpSpeed);

        const distance = current.distanceTo(target);
        if (distance > 0.01) {
          allReached = false;
        }

        // 更新矩阵（包含旋转）
        quaternion.setFromEuler(rot);
        matrix.compose(current, quaternion, scale);
        this.instancedMesh.setMatrixAt(i, matrix);
      }

      this.instancedMesh.instanceMatrix.needsUpdate = true;

      if (allReached) {
        // 强制设置精确的最终状态，消除任何浮点误差
        const identity = new THREE.Quaternion(0, 0, 0, 1); // 无旋转
        for (let i = 0; i < this.voxels.length; i++) {
          // 精确设置到目标位置，零旋转
          matrix.compose(this.targetPositions[i], identity, scale);
          this.instancedMesh.setMatrixAt(i, matrix);

          // 确保位置和旋转数组也是精确值
          this.currentPositions[i].copy(this.targetPositions[i]);
          this.currentRotations[i].set(0, 0, 0);
        }
        this.instancedMesh.instanceMatrix.needsUpdate = true;
        this.state = 'stable';
      }
    }
  }

  getState(): EngineState {
    return this.state;
  }

  // === 鼠标拖动交互功能 ===

  /**
   * 开始拖动体素（鼠标按下时调用）
   */
  startDrag(camera: THREE.Camera, mouseX: number, mouseY: number): boolean {
    // 只在拆解状态下允许拖动
    if (this.state !== 'dismantling' || !this.instancedMesh) return false;

    // 设置射线
    this.raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

    // 临时创建包围盒用于拾取
    const tempMatrix = new THREE.Matrix4();
    const tempBox = new THREE.Box3();
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

    let closestDistance = Infinity;
    let closestIndex = -1;

    // 遍历所有体素，找到最近的被点击体素
    for (let i = 0; i < this.voxels.length; i++) {
      this.instancedMesh.getMatrixAt(i, tempMatrix);

      const position = new THREE.Vector3();
      position.setFromMatrixPosition(tempMatrix);

      // 创建临时几何体用于射线检测
      tempBox.setFromCenterAndSize(position, new THREE.Vector3(1, 1, 1));

      const ray = this.raycaster.ray;
      const intersectionPoint = new THREE.Vector3();

      if (ray.intersectsBox(tempBox)) {
        const distance = position.distanceTo(camera.position);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }
    }

    if (closestIndex !== -1) {
      this.draggedIndex = closestIndex;

      // 计算拖动平面（与地面平行，经过被拖动体素）
      const draggedPos = this.currentPositions[closestIndex];
      this.dragPlane.setFromNormalAndCoplanarPoint(
        new THREE.Vector3(0, 1, 0),
        draggedPos
      );

      // 计算拖动偏移
      const intersectionPoint = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(this.dragPlane, intersectionPoint);
      this.dragOffset.copy(intersectionPoint).sub(draggedPos);

      return true;
    }

    return false;
  }

  /**
   * 更新拖动位置（鼠标移动时调用）
   */
  updateDrag(camera: THREE.Camera, mouseX: number, mouseY: number): void {
    if (this.draggedIndex === null || !this.instancedMesh) return;

    // 更新射线
    this.raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

    // 计算新位置
    const intersectionPoint = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.dragPlane, intersectionPoint)) {
      const newPos = intersectionPoint.sub(this.dragOffset);

      // 限制高度不低于地面
      newPos.y = Math.max(newPos.y, this.groundY);

      // 更新当前位置
      this.currentPositions[this.draggedIndex].copy(newPos);

      // 停止该体素的物理运动
      this.physics[this.draggedIndex].velocity = { x: 0, y: 0, z: 0 };
      this.physics[this.draggedIndex].angularVelocity = { x: 0, y: 0, z: 0 };

      // 更新矩阵
      const matrix = new THREE.Matrix4();
      const quaternion = new THREE.Quaternion();
      quaternion.setFromEuler(this.currentRotations[this.draggedIndex]);
      matrix.compose(newPos, quaternion, new THREE.Vector3(1, 1, 1));
      this.instancedMesh.setMatrixAt(this.draggedIndex, matrix);
      this.instancedMesh.instanceMatrix.needsUpdate = true;
    }
  }

  /**
   * 结束拖动（鼠标释放时调用）
   */
  endDrag(): void {
    if (this.draggedIndex !== null) {
      // 给体素一个小的下落速度
      this.physics[this.draggedIndex].velocity.y = -0.1;
      this.draggedIndex = null;
    }
  }

  // === 手势抓取交互功能 ===

  /**
   * 开始抓取体素（手势捏合时调用）
   * @param camera 相机对象
   * @param handX 手的2D屏幕X坐标（-1到1）
   * @param handY 手的2D屏幕Y坐标（-1到1）
   * @param handZ 手的深度（0到1，0是近，1是远）
   */
  startGrab(camera: THREE.Camera, handX: number, handY: number, handZ: number): boolean {
    if (this.state !== 'dismantling' || !this.instancedMesh) return false;

    // 将2D手部坐标转换为3D世界坐标
    const handPos = new THREE.Vector3(handX, handY, 0.5);
    handPos.unproject(camera);

    // 计算从相机到手部位置的方向
    const direction = handPos.clone().sub(camera.position).normalize();

    // 使用handZ来确定抓取点的深度（距离相机的距离）
    const grabDistance = 15 + handZ * 30; // 15到45之间
    this.grabCenter.copy(camera.position).addScaledVector(direction, grabDistance);

    // 找到抓取中心附近的所有体素（半径5个单位内）
    const grabRadius = 5;
    this.grabbedIndices.clear();

    for (let i = 0; i < this.voxels.length; i++) {
      const pos = this.currentPositions[i];
      const distance = pos.distanceTo(this.grabCenter);

      if (distance < grabRadius) {
        this.grabbedIndices.add(i);
      }
    }

    if (this.grabbedIndices.size > 0) {
      this.lastGrabPosition.copy(this.grabCenter);
      this.grabVelocity.set(0, 0, 0);
      return true;
    }

    return false;
  }

  /**
   * 更新抓取位置（手移动时调用）
   */
  updateGrab(camera: THREE.Camera, handX: number, handY: number, handZ: number): void {
    if (this.grabbedIndices.size === 0 || !this.instancedMesh) return;

    // 将2D手部坐标转换为3D世界坐标
    const handPos = new THREE.Vector3(handX, handY, 0.5);
    handPos.unproject(camera);

    const direction = handPos.clone().sub(camera.position).normalize();
    const grabDistance = 15 + handZ * 30;
    const newGrabCenter = new THREE.Vector3().copy(camera.position).addScaledVector(direction, grabDistance);

    // 计算移动量和速度
    const movement = newGrabCenter.clone().sub(this.grabCenter);
    this.grabVelocity.copy(newGrabCenter).sub(this.lastGrabPosition).multiplyScalar(0.5);

    // 更新所有被抓取的体素位置
    for (const index of this.grabbedIndices) {
      this.currentPositions[index].add(movement);

      // 停止物理运动
      this.physics[index].velocity = { x: 0, y: 0, z: 0 };
      this.physics[index].angularVelocity = { x: 0, y: 0, z: 0 };

      // 更新矩阵
      const matrix = new THREE.Matrix4();
      const quaternion = new THREE.Quaternion();
      quaternion.setFromEuler(this.currentRotations[index]);
      matrix.compose(this.currentPositions[index], quaternion, new THREE.Vector3(1, 1, 1));
      this.instancedMesh.setMatrixAt(index, matrix);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;

    this.lastGrabPosition.copy(this.grabCenter);
    this.grabCenter.copy(newGrabCenter);
  }

  /**
   * 结束抓取（手势松开时调用）
   */
  releaseGrab(): void {
    if (this.grabbedIndices.size === 0) return;

    // 给所有被抓取的体素施加速度（抛掷效果）
    for (const index of this.grabbedIndices) {
      // 应用抓取时的速度，加上额外的抛掷力
      this.physics[index].velocity = {
        x: this.grabVelocity.x * 2,
        y: Math.max(this.grabVelocity.y * 2, 0.3), // 确保有向上的力
        z: this.grabVelocity.z * 2,
      };

      // 添加随机旋转
      this.physics[index].angularVelocity = {
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
        z: (Math.random() - 0.5) * 0.1,
      };
    }

    this.grabbedIndices.clear();
  }

  dispose() {
    if (this.instancedMesh) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh.geometry.dispose();
      if (Array.isArray(this.instancedMesh.material)) {
        this.instancedMesh.material.forEach(m => m.dispose());
      } else {
        this.instancedMesh.material.dispose();
      }
    }
  }
}
