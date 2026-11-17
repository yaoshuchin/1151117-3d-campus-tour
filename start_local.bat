@echo off
chcp 65001 >nul
echo ========================================================
echo   啟動 3D 互動校園與教育應用 本機伺服器
echo   網址: http://localhost:8099/
echo ========================================================
start "" "http://localhost:8099/#/campus-tour"
python -m http.server 8099
pause
