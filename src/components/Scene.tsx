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
}

export default function Scene({ voxels, autoRotate, onEngineReady, onCameraReady }: SceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<VoxelEngine | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7f7f7); // 理想"家"的暖调白空间
    scene.fog = new THREE.Fog(0xf7f7f7, 40, 80); // 指数级雾化，只影响远方地平线

    // 创建相机 - 提高初始位置，更好的俯视角度
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(25, 20, 25);
    camera.lookAt(0, 5, 0); // 看向模型中心偏上位置

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 创建地面 - 理想品牌高质感展厅效果
    const groundGeometry = new THREE.CircleGeometry(50, 64);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xe5e7eb, // 浅灰色哑光漆面质感
      roughness: 0.9, // 哑光效果
      metalness: 0.0,
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
      if (engine.startDrag(camera, mouse.x, mouse.y)) {
        isDraggingRef.current = true;
        controls.enabled = false; // 拖动时禁用相机控制
      }
    }

    function handleMouseMove(event: MouseEvent) {
      if (isDraggingRef.current) {
        const mouse = getMousePosition(event);
        engine.updateDrag(camera, mouse.x, mouse.y);
      }
    }

    function handleMouseUp() {
      if (isDraggingRef.current) {
        engine.endDrag();
        isDraggingRef.current = false;
        controls.enabled = true; // 恢复相机控制
      }
    }

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('mouseleave', handleMouseUp);

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
