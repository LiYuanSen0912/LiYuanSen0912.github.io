@echo off
setlocal
title Lys 的数字花园 - 本地预览

set "BLOG_DIR=%~dp0"
set "NODE_EXE=C:\Users\Lys\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if not exist "%NODE_EXE%" (
  echo.
  echo 未找到博客运行环境。请打开 Codex 后再双击此文件，或联系我重新配置。
  pause
  exit /b 1
)

echo 正在生成博客页面，请稍候...
"%NODE_EXE%" "%BLOG_DIR%node_modules\hexo-cli\bin\hexo" clean
"%NODE_EXE%" "%BLOG_DIR%node_modules\hexo-cli\bin\hexo" server

pause
