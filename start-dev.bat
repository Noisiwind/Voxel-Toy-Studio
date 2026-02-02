@echo off
echo ====================================
echo   Voxel Toy Studio - 启动开发服务器
echo ====================================
echo.
echo 正在启动服务器...
echo 浏览器将自动打开 http://localhost:5173
echo.
echo 提示：看到 "ready in" 后，浏览器会自动打开
echo 如果没有自动打开，请手动访问：http://localhost:5173
echo.
echo 关闭此窗口将停止服务器
echo ====================================
echo.

cd /d "%~dp0"

REM 启动浏览器（延迟3秒等待服务器启动）
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

REM 启动开发服务器
npm run dev
