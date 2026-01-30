import { useEffect, useRef, useState } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { Video, VideoOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HandGestureControlProps {
  onDismantle: () => void;
  onRebuild: () => void;
  onZoom: (delta: number) => void;
  onRotate: (deltaX: number, deltaY: number) => void;
  onGrab: (handX: number, handY: number, handZ: number) => void;
  onGrabMove: (handX: number, handY: number, handZ: number) => void;
  onGrabRelease: () => void;
  onPointerMove: (handX: number, handY: number) => void;
  onPointerSelect: () => void;
}

// 检测单手手势
function detectHandGesture(hand: any): string {
  if (!hand) return 'none';

  // 计算手指伸展状态
  const indexUp = hand[8].y < hand[6].y;
  const middleUp = hand[12].y < hand[10].y;
  const ringUp = hand[16].y < hand[14].y;
  const pinkyUp = hand[20].y < hand[18].y;

  // 张开手掌（所有手指伸展）
  if (indexUp && middleUp && ringUp && pinkyUp) {
    return 'open';
  }

  // V字手势（食指和中指伸展）
  if (indexUp && middleUp && !ringUp && !pinkyUp) {
    return 'peace';
  }

  // 比"1"（只有食指伸出）
  if (indexUp && !middleUp && !ringUp && !pinkyUp) {
    return 'point';
  }

  // 握拳（所有手指收起）
  if (!indexUp && !middleUp && !ringUp && !pinkyUp) {
    return 'fist';
  }

  return 'none';
}

export default function HandGestureControl({
  onDismantle,
  onRebuild,
  onZoom,
  onRotate,
  onGrab,
  onGrabMove,
  onGrabRelease,
  onPointerMove,
  onPointerSelect,
}: HandGestureControlProps) {
  const { t } = useLanguage();
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
  const leftGestureRef = useRef<string>('none');
  const rightGestureRef = useRef<string>('none');
  const lastRightGestureRef = useRef<string>('none');
  const isPointingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isActive) return;

    console.log('Hand gesture control activated, initializing camera...');

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
        // 识别左右手
        let leftHand = null;
        let rightHand = null;
        let leftHandIndex = -1;
        let rightHandIndex = -1;

        results.multiHandLandmarks.forEach((landmarks, handIndex) => {
          const handedness = results.multiHandedness?.[handIndex]?.label;

          // MediaPipe的左右手是从摄像头角度（镜像），所以Left是右手，Right是左手
          if (handedness === 'Right') {
            leftHand = landmarks;
            leftHandIndex = handIndex;
          } else if (handedness === 'Left') {
            rightHand = landmarks;
            rightHandIndex = handIndex;
          }

          // 绘制关键点
          ctx.fillStyle = handedness === 'Right' ? '#00FF00' : '#0088FF';
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

        // 检测左手手势（控制模型状态）
        const leftGesture = leftHand ? detectHandGesture(leftHand) : 'none';
        leftGestureRef.current = leftGesture;

        // 检测右手手势（控制交互）
        const rightGesture = rightHand ? detectHandGesture(rightHand) : 'none';
        rightGestureRef.current = rightGesture;

        const now = Date.now();

        // === 左手控制：拆解和重组 ===
        if (leftGesture !== 'none' && now - gestureTimeRef.current > 1000) {
          if (leftGesture === 'fist') {
            onDismantle();
            gestureTimeRef.current = now;
            setCurrentGesture('left-fist');
          } else if (leftGesture === 'open') {
            onRebuild();
            gestureTimeRef.current = now;
            setCurrentGesture('left-open');
          }
        }

        // === 右手控制：指针选择、抓取、旋转、缩放 ===
        if (rightHand) {
          const handCenter = {
            x: rightHand[9].x,
            y: rightHand[9].y,
          };

          // 右手比"1" = 指针选择（随时可用）
          if (rightGesture === 'point') {
            // 反转X和Y方向，使手势与屏幕移动方向一致
            const handX = -(handCenter.x * 2 - 1);
            const handY = -(handCenter.y * 2 - 1); // Y方向也反转

            // 持续发送指针位置
            onPointerMove(handX, handY);
            isPointingRef.current = true;
            setCurrentGesture('right-point');

            // 如果之前在抓取，松开抓取
            if (isGrabbingRef.current) {
              onGrabRelease();
              isGrabbingRef.current = false;
            }
          }
          // 右手握拳 = 抓取（拆解状态下才生效）
          else if (rightGesture === 'fist') {
            // 如果刚从指针模式切换过来，先选中体素
            if (lastRightGestureRef.current === 'point' && isPointingRef.current) {
              onPointerSelect(); // 告诉引擎锁定选中的体素
              isPointingRef.current = false;
            }

            // 反转X和Y方向，使手势与屏幕移动方向一致
            const handX = -(handCenter.x * 2 - 1);
            const handY = -(handCenter.y * 2 - 1); // Y方向也反转
            const handZ = Math.max(0, Math.min(1, (1 + rightHand[9].z) / 2));

            if (!isGrabbingRef.current) {
              onGrab(handX, handY, handZ);
              isGrabbingRef.current = true;
              setCurrentGesture('right-grab');
            } else {
              onGrabMove(handX, handY, handZ);
            }
          } else {
            // 松开抓取
            if (isGrabbingRef.current) {
              onGrabRelease();
              isGrabbingRef.current = false;
            }

            // 不再是指针模式
            if (isPointingRef.current) {
              isPointingRef.current = false;
            }

            // 右手张开 = 旋转视角（随时可用）
            if (rightGesture === 'open') {
              if (lastHandPositionRef.current) {
                // 反转方向，使手势方向与屏幕移动方向一致
                const deltaX = (lastHandPositionRef.current.x - handCenter.x) * 500;
                const deltaY = (lastHandPositionRef.current.y - handCenter.y) * 500;
                if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
                  onRotate(deltaX, deltaY);
                }
              }
              lastHandPositionRef.current = handCenter;
              setCurrentGesture('right-rotate');
            }

            // 右手V字 = 缩放（随时可用）
            else if (rightGesture === 'peace') {
              const indexTipY = rightHand[8].y;

              if (peaceStartYRef.current === null) {
                peaceStartYRef.current = indexTipY;
              } else {
                // 反转方向：向上拉放大，向下拉缩小
                const deltaY = (indexTipY - peaceStartYRef.current) * 20;
                if (Math.abs(deltaY) > 0.5) {
                  onZoom(deltaY);
                  peaceStartYRef.current = indexTipY;
                }
              }
              setCurrentGesture('right-zoom');
            } else {
              peaceStartYRef.current = null;
            }
          }

          lastRightGestureRef.current = rightGesture;
        } else {
          // 没有右手，重置状态
          if (isGrabbingRef.current) {
            onGrabRelease();
            isGrabbingRef.current = false;
          }
          if (isPointingRef.current) {
            isPointingRef.current = false;
          }
          lastHandPositionRef.current = null;
          peaceStartYRef.current = null;
          lastRightGestureRef.current = 'none';
        }

        // 更新显示状态
        if (leftGesture === 'none' && rightGesture === 'none') {
          setCurrentGesture('none');
        }
      } else {
        // 没有检测到手，重置所有状态
        if (isGrabbingRef.current) {
          onGrabRelease();
          isGrabbingRef.current = false;
        }
        lastHandPositionRef.current = null;
        setCurrentGesture('none');
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
      camera.start().catch((error) => {
        console.error('Failed to start camera:', error);
        alert('无法访问摄像头，请确保：\n1. 浏览器有摄像头权限\n2. 没有其他应用正在使用摄像头\n3. 使用Chrome/Edge等支持的浏览器');
      });
    }

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, [isActive, onDismantle, onRebuild, onZoom, onRotate, onGrab, onGrabMove, onGrabRelease, onPointerMove, onPointerSelect]);

  return (
    <>
      {/* 手势控制按钮 - 将被放置在左侧按钮组中 */}
      <button
        onClick={() => {
          console.log('Gesture control button clicked, current state:', isActive);
          setIsActive(!isActive);
        }}
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
          {t('btn.gestureControl')}
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
                {currentGesture === 'left-fist' ? '✊ 左手拆解' :
                 currentGesture === 'left-open' ? '🖐 左手重组' :
                 currentGesture === 'right-point' ? '☝️ 右手选择' :
                 currentGesture === 'right-grab' ? '✊ 右手抓取' :
                 currentGesture === 'right-rotate' ? '🖐 右手旋转' :
                 currentGesture === 'right-zoom' ? '✌️ 右手缩放' :
                 '👋 待机'}
              </div>
            </div>
            <div className="p-3 bg-gray-50 text-xs text-gray-600">
              <p className="font-bold mb-1 text-green-600">左手（绿色）- 模型控制：</p>
              <p>✊ 握拳 = 拆解</p>
              <p>🖐 张开 = 重组</p>
              <p className="font-bold mt-2 mb-1 text-blue-600">右手（蓝色）- 视角交互：</p>
              <p>☝️ 比1 = 选择体素（光标模式）</p>
              <p>✊ 握拳移动 = 抓取拖拽</p>
              <p>🖐 张开移动 = 旋转视角</p>
              <p>✌️ V字上下 = 缩放</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
