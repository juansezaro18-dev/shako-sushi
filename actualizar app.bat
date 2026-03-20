@echo off
echo.
echo =============================
echo   SHAKO SUSHI - Deploy rapido
echo =============================
echo.

:: Buscar el App.jsx mas reciente en Descargas
set DOWNLOADS=%USERPROFILE%\Downloads
set DEST=%~dp0src\App.jsx

:: Buscar App.jsx o App (1).jsx o App (2).jsx etc - el mas reciente
for /f "delims=" %%f in ('dir /b /o-d "%DOWNLOADS%\App*.jsx" 2^>nul') do (
    set NEWEST=%DOWNLOADS%\%%f
    goto found
)

echo No se encontro ningun App.jsx en Descargas.
echo Descarga el archivo primero desde Claude.
pause
exit /b

:found
echo Encontrado: %NEWEST%
echo Reemplazando src\App.jsx...
copy /y "%NEWEST%" "%DEST%" >nul
echo OK

echo.
echo Subiendo a GitHub...
git add .
git commit -m "update app"
git push

echo.
echo ===========================
echo   Listo! Vercel deployando
echo ===========================
echo.
pause
