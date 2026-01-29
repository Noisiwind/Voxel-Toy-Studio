import { useEffect, useRef, useState } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { Video, VideoOff } from 'lucide-react';

interface HandGestureControlProps {
  onDismantle: () => void;
  onRebuild: () => void;
  onZoom: (delta: number) => void;
  onRotate: (deltaX: number, deltaY: number) => void;
  onGrab: (handX: number, handY: number, handZ: number) => void;
  onGrabMove: (handX: number, handY: number, handZ: number) => void;
  onGrabRelease: () => void;
}

// 手势识别逻辑
function detectGesture(landmarks: any): string {
  if (!landmarks || landmarks.length === 0) return 'none';

  const hand = landmarks[0];

  // 计算手指伸展状态
  const thumbUp = hand[4].y < hand[3].y;
  const indexUp = hand[8].y < hand[6].y;
  const middleUp = hand[12].y < hand[10].y;
  const ringUp = hand[16].y < hand[14].y;
  const pinkyUp = hand[20].y < hand[18].y;

  // 拳头 - 拆解
  if (!indexUp && !middleUp && !ringUp && !pinkyUp) {
    return 'fist'; // 拆解
  }

  // 张开手掌 - 重组
  if (indexUp && middleUp && ringUp && pinkyUp) {
    return 'open'; // 重组
  }

  // V字手势（食指和中指伸展，其他收起）- 缩放
  if (indexUp && middleUp && !ringUp && !pinkyUp) {
    return 'peace'; // V字手势用于缩放
  }

  return 'none';
}

// 检测双手合拢手势
function detectTwoHandsGrab(landmarks: any): boolean {
  if (!landmarks || landmarks.length < 2) return false;

  const leftHand = landmarks[0];
  const rightHand = landmarks[1];

  // 获取两手的手掌中心位置（关键点9）
  const leftPalm = leftHand[9];
  const rightPalm = rightHand[9];

  // 计算两手之间的距离
  const distance = Math.sqrt(
    Math.pow(leftPalm.x - rightPalm.x, 2) +
    Math.pow(leftPalm.y - rightPalm.y, 2) +
    Math.pow(leftPalm.z - rightPalm.z, 2)
  );

  // 当两手距离小于0.15时视为合拢（抓取）
  return distance < 0.15;
}

export default function HandGestureControl({
  onDismantle,
  onRebuild,
  onZoom,
  onRotate,
  onGrab,
  onGrabMove,
  onGrabRelease,
}: HandGestureControlProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string>('none');
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const lastGestureRef = useRef<string>('none');
  const gestureTimeRef = useRef<number>(0);
  const lastHandPositionRef = useRef<{ x: number; y: number } | null>(null);
  const peaceStartYRef = useRef<number | null>(null);
  const isGrabbingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isActive) return;

    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 2, // 检测2只手
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results: Results) => {
      if (!canvasRef.current) return;

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // 绘制视频帧
      ctx.save();
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

      // 绘制手部标记
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        // 绘制所有手的关键点
        results.multiHandLandmarks.forEach((landmarks, handIndex) => {
          ctx.fillStyle = handIndex === 0 ? '#00FF00' : '#0088FF'; // 左手绿色，右手蓝色
          landmarks.forEach((landmark) => {
            ctx.beginPath();
            ctx.arc(
              landmark.x * canvasRef.current!.width,
              landmark.y * canvasRef.current!.height,
              5,
              0,
              2 * Math.PI
            );
            ctx.fill();
          });
        });

        const landmarks = results.multiHandLandmarks[0];

        // 检测单手手势
        const gesture = detectGesture(results.multiHandLandmarks);

        // 检测双手合拢
        const isTwoHandsGrab = detectTwoHandsGrab(results.multiHandLandmarks);

        if (isTwoHandsGrab) {
          setCurrentGesture('grab');
        } else {
          setCurrentGesture(gesture);
        }

        const now = Date.now();

        // 手势触发（避免频繁触发）
        if (gesture !== lastGestureRef.current && now - gestureTimeRef.current > 1000) {
          if (gesture === 'fist') {
            onDismantle();
            gestureTimeRef.current = now;
          } else if (gesture === 'open') {
            onRebuild();
            gestureTimeRef.current = now;
          }
          lastGestureRef.current = gesture;
        }

        // 手部位置用于旋转视角（只在单手且无特殊手势时）
        const handCenter = {
          x: landmarks[9].x, // 手掌中心
          y: landmarks[9].y,
        };

        if (lastHandPositionRef.current && gesture === 'none' && !isTwoHandsGrab) {
          const deltaX = (handCenter.x - lastHandPositionRef.current.x) * 500;
          const deltaY = (handCenter.y - lastHandPositionRef.current.y) * 500;
          if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
            onRotate(deltaX, deltaY);
          }
        }

        lastHandPositionRef.current = handCenter;

        // 双手合拢用于抓取
        if (isTwoHandsGrab) {
          // 计算两手的中心位置
          let centerX = 0;
          let centerY = 0;
          let centerZ = 0;

          if (results.multiHandLandmarks.length >= 2) {
            const leftPalm = results.multiHandLandmarks[0][9];
            const rightPalm = results.multiHandLandmarks[1][9];

            centerX = (leftPalm.x + rightPalm.x) / 2;
            centerY = (leftPalm.y + rightPalm.y) / 2;
            centerZ = (leftPalm.z + rightPalm.z) / 2;
          } else {
            centerX = handCenter.x;
            centerY = handCenter.y;
            centerZ = 0;
          }

          // 计算手的中心位置（归一化坐标，-1到1）
          const handX = (centerX * 2 - 1);
          const handY = -(centerY * 2 - 1); // Y轴反转

          // 使用Z坐标作为深度提示（0到1）
          const handZ = Math.max(0, Math.min(1, (1 + centerZ) / 2));

          if (!isGrabbingRef.current) {
            // 开始抓取
            onGrab(handX, handY, handZ);
            isGrabbingRef.current = true;
          } else {
            // 更新抓取位置
            onGrabMove(handX, handY, handZ);
          }
        } else {
          // 松开抓取
          if (isGrabbingRef.current) {
            onGrabRelease();
            isGrabbingRef.current = false;
          }
        }

        // V字手势用于缩放
        if (gesture === 'peace') {
          const indexTipY = landmarks[8].y;

          if (peaceStartYRef.current === null) {
            peaceStartYRef.current = indexTipY;
          } else {
            const deltaY = (peaceStartYRef.current - indexTipY) * 20;
            if (Math.abs(deltaY) > 0.5) {
              onZoom(deltaY);
              peaceStartYRef.current = indexTipY;
            }
          }
        } else {
          peaceStartYRef.current = null;
        }
      }

      ctx.restore();
    });

    handsRef.current = hands;

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await hands.send({ image: videoRef.current });
          }
        },
        width: 320,
        height: 240,
      });
      cameraRef.current = camera;
      camera.start();
    }

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, [isActive, onDismantle, onRebuild, onZoom, onRotate]);

  return (
    <>
      {/* 手势控制按钮 - 将被放置在左侧按钮组中 */}
      <button
        onClick={() => setIsActive(!isActive)}
        className={`w-full text-left transition-all ${
          isActive ? 'opacity-100' : 'opacity-100'
        }`}
      >
        <div
          className={`px-6 py-3 rounded-2xl font-bold text-white transition-all border-b-[6px] border-[#002D28] shadow-lg active:border-b-0 active:translate-y-1.5 ${
            isActive
              ? 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
              : 'bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
          }`}
        >
          {isActive ? <Video className="inline mr-2" size={20} /> : <VideoOff className="inline mr-2" size={20} />}
          手势控制
        </div>
      </button>

      {/* 摄像头窗口 - 固定在屏幕右侧 */}
      {isActive && (
        <div className="fixed top-32 right-8 z-20">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="relative">
              <video
                ref={videoRef}
                className="hidden"
                playsInline
              />
              <canvas
                ref={canvasRef}
                width={320}
                height={240}
                className="w-80 h-60"
              />
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                手势: {currentGesture === 'fist' ? '✊ 拆解' :
                       currentGesture === 'open' ? '🖐 重组' :
                       currentGesture === 'peace' ? '✌️ 缩放' :
                       currentGesture === 'grab' ? '🙌 抓取' : '👋 移动视角'}
              </div>
            </div>
            <div className="p-3 bg-gray-50 text-xs text-gray-600">
              <p>✊ 握拳 = 拆解</p>
              <p>🖐 张开手掌 = 重组</p>
              <p>✌️ V字手势上下移动 = 缩放</p>
              <p>🙌 双手合拢 = 抓取抛掷</p>
              <p>👋 移动手 = 旋转视角</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
