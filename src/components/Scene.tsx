import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VoxelEngine } from '../engine/VoxelEngine';
import { Voxel } from '../types';

interface SceneProps {
  voxels: Voxel[];
  autoRotate: boolean;
  onEngineReady: (engine: VoxelEngine) => void;
  onCameraReady?: (camera: THREE.Camera, controls: OrbitControls) => void;
  isPaintMode?: boolean;
  onVoxelClick?: (x: number, y: number, z: number) => void;
}

export default function Scene({ voxels, autoRotate, onEngineReady, onCameraReady, isPaintMode, onVoxelClick }: SceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<VoxelEngine | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const isDraggingRef = useRef(false);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const currentMouseRef = useRef<{ x: number; y: number } | null>(null);
  const isMouseDownRef = useRef(false); // 记录鼠标是否按下
  const lastPaintedInstanceRef = useRef<number | null>(null); // 记录上次涂色的instanceId
  const lastPaintTimeRef = useRef<number>(0); // 记录上次涂色时间

  // 保存初始相机位置和目标点（正面视角）
  const initialCameraPosition = useRef(new THREE.Vector3(0, 10, 35));
  const initialTargetPosition = useRef(new THREE.Vector3(0, 5, 0));

  // 用ref保存最新的isPaintMode和onVoxelClick值
  const isPaintModeRef = useRef(isPaintMode);
  const onVoxelClickRef = useRef(onVoxelClick);

  // 更新ref值
  useEffect(() => {
    isPaintModeRef.current = isPaintMode;
    onVoxelClickRef.current = onVoxelClick;
  }, [isPaintMode, onVoxelClick]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFAF0); // 暖色米白背景
    scene.fog = new THREE.Fog(0xFFFAF0, 40, 80); // 指数级雾化，只影响远方地平线

    // 创建相机 - 正面视角
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 35);
    camera.lookAt(0, 5, 0);

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 创建地面 - 暖金色质感
    const groundGeometry = new THREE.CircleGeometry(50, 64);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xD4A574, // 暖金色
      roughness: 0.7,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // 添加灯光 - 理想"家"的温暖照明
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 0.8); // 高亮度暖色环境光
    scene.add(ambientLight);

    // 主光源 - 微黄调平行光，清晰但柔和的投影
    const directionalLight = new THREE.DirectionalLight(0xfffaed, 1.5); // 微黄调
    directionalLight.position.set(15, 25, 15);
    directionalLight.castShadow = true;

    // 高质量柔和阴影设置
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.bias = -0.0001;
    directionalLight.shadow.radius = 3; // 增加软阴影效果
    scene.add(directionalLight);

    // 添加补光，模拟自然采光
    const fillLight = new THREE.DirectionalLight(0xfff8f0, 0.4);
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);

    // 创建控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 60;
    controls.maxPolarAngle = Math.PI / 2.2; // 限制角度，不能看到地板下面
    controls.target.set(0, 5, 0); // 设置旋转中心点在模型中心
    controls.enablePan = false; // 禁用平移
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN as any,  // 左键：禁用（使用 PAN 然后 enablePan 已经false）
      MIDDLE: THREE.MOUSE.DOLLY,     // 中键：缩放
      RIGHT: THREE.MOUSE.ROTATE      // 右键：旋转
    };
    controlsRef.current = controls;

    // 创建引擎
    const engine = new VoxelEngine(scene);
    engineRef.current = engine;
    cameraRef.current = camera;
    onEngineReady(engine);

    // 通知相机准备好
    if (onCameraReady) {
      onCameraReady(camera, controls);
    }

    // === 鼠标拖动事件 ===
    function getMousePosition(event: MouseEvent): { x: number; y: number } {
      const rect = renderer.domElement.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((event.clientY - rect.top) / rect.height) * 2 + 1,
      };
    }

    function handleMouseDown(event: MouseEvent) {
      const mouse = getMousePosition(event);

      // 涂色模式下，左键点击涂色
      if (event.button === 0 && isPaintModeRef.current && onVoxelClickRef.current) {
        isMouseDownRef.current = true;
        const raycaster = raycasterRef.current;
        raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);

        // 获取VoxelEngine中的体素网格
        const voxelMesh = engine.getVoxelMesh();
        if (voxelMesh) {
          const intersects = raycaster.intersectObject(voxelMesh);
          if (intersects.length > 0) {
            const instanceId = intersects[0].instanceId;
            if (instanceId !== undefined) {
              const voxelData = engine.getVoxelByInstanceId(instanceId);
              if (voxelData) {
                onVoxelClickRef.current(voxelData.x, voxelData.y, voxelData.z);
                lastPaintedInstanceRef.current = instanceId;
                lastPaintTimeRef.current = Date.now();
              }
            }
          }
        }
        return; // 涂色后不执行其他操作
      }
    }

    function handleMouseMove(event: MouseEvent) {
      const mouse = getMousePosition(event);

      // 始终记录鼠标位置
      currentMouseRef.current = mouse;

      // 涂色模式下，按住左键移动时持续涂色
      if (isMouseDownRef.current && isPaintModeRef.current && onVoxelClickRef.current) {
        const now = Date.now();
        // 节流：每16ms（约60fps）最多触发一次
        if (now - lastPaintTimeRef.current < 16) {
          return;
        }

        const raycaster = raycasterRef.current;
        raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);

        const voxelMesh = engine.getVoxelMesh();
        if (voxelMesh) {
          const intersects = raycaster.intersectObject(voxelMesh);
          if (intersects.length > 0) {
            const instanceId = intersects[0].instanceId;
            // 只有当instanceId不同时才涂色（避免重复涂同一个体素）
            if (instanceId !== undefined && instanceId !== lastPaintedInstanceRef.current) {
              const voxelData = engine.getVoxelByInstanceId(instanceId);
              if (voxelData) {
                onVoxelClickRef.current(voxelData.x, voxelData.y, voxelData.z);
                lastPaintedInstanceRef.current = instanceId;
                lastPaintTimeRef.current = now;
              }
            }
          }
        }
        return;
      }

      // 非涂色模式下的拖动逻辑
      if (isDraggingRef.current) {
        engine.updateDrag(camera, mouse.x, mouse.y);
      }
    }

    function handleMouseUp() {
      isMouseDownRef.current = false;
      lastPaintedInstanceRef.current = null; // 重置
      if (isDraggingRef.current) {
        engine.endDrag();
        isDraggingRef.current = false;
        controls.enabled = true; // 恢复相机控制
      }
    }

    // 空格键重置相机视角
    function handleKeyDown(event: KeyboardEvent) {
      // 只在非输入元素上拦截空格键
      const target = event.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' ||
                            target.tagName === 'TEXTAREA' ||
                            target.isContentEditable;

      if (event.code === 'Space' && !isInputFocused) {
        event.preventDefault(); // 防止页面滚动

        if (cameraRef.current && controlsRef.current) {
          // 重置相机位置
          cameraRef.current.position.copy(initialCameraPosition.current);

          // 重置控制器目标点
          controlsRef.current.target.copy(initialTargetPosition.current);

          // 更新控制器
          controlsRef.current.update();
        }
      }
    }

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('mouseleave', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    // 动画循环
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      engine.update();
      renderer.render(scene, camera);
    }
    animate();

    // 处理窗口大小变化
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', handleResize);

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('mouseleave', handleMouseUp);
      engine.dispose();
      renderer.dispose();
      controls.dispose();
    };
  }, [onEngineReady, onCameraReady]);

  // 更新 autoRotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = 2.0;
    }
  }, [autoRotate]);

  // 更新模型
  useEffect(() => {
    if (engineRef.current && voxels.length > 0) {
      engineRef.current.createModel(voxels);
    }
  }, [voxels]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
