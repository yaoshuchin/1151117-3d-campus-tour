@echo off
chcp 65001 >nul
echo ========================================================
echo   啟動 世新大學・漫遊校園 3D 導覽 本機伺服器
echo   網址: http://localhost:8099/
echo ========================================================
start "" "http://localhost:8099/"
python -m http.server 8099
pause