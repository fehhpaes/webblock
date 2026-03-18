@echo off
setlocal enabledelayedexpansion

:: ==========================================
:: WebBlock - Instalador do Agente
:: ==========================================

echo.
echo  ==========================================
echo   WebBlock - Instalador do Agente v1.0
echo  ==========================================
echo.
echo  Este script ira instalar e configurar o
echo  agente de monitoramento neste computador.
echo.

set API_URL=https://webblock-api.onrender.com
set AGENT_DIR=C:\ProgramData\SecuritySaaS

:: 1. Criar pasta no sistema
if not exist "%AGENT_DIR%" (
    mkdir "%AGENT_DIR%"
    echo [OK] Pasta do agente criada em %AGENT_DIR%
)

:: 2. Copiar executável
if exist "webblock-agent.exe" (
    copy /Y "webblock-agent.exe" "%AGENT_DIR%\webblock-agent.exe" >nul
) else if exist "dist\webblock-agent.exe" (
    copy /Y "dist\webblock-agent.exe" "%AGENT_DIR%\webblock-agent.exe" >nul
) else (
    echo [ERRO] Arquivo webblock-agent.exe nao encontrado!
    echo        Coloque o instalador na mesma pasta do .exe
    pause
    exit /b 1
)
echo [OK] Executavel instalado.

:: 3. Credenciais e descoberta automática via curl
echo.
echo ------------------------------------------
echo  Autenticacao do Administrador
echo ------------------------------------------
set /p ADMIN_EMAIL="Email do Admin: "
set /p ADMIN_PASS="Senha do Admin: "

:: Obter JWT do admin
echo [..] Autenticando no servidor...
for /f "delims=" %%A in ('curl -s -X POST "%API_URL%/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"%ADMIN_EMAIL%\",\"senha\":\"%ADMIN_PASS%\"}" 2^>nul') do set AUTH_RESP=%%A

:: Extrair token (simples - pega valor após "token":")
for /f "tokens=2 delims=:" %%T in ('echo !AUTH_RESP! ^| findstr /i "token"') do (
    set TOKEN_RAW=%%T
)
set ADMIN_TOKEN=!TOKEN_RAW:"=!
set ADMIN_TOKEN=!ADMIN_TOKEN:,=!
set ADMIN_TOKEN=!ADMIN_TOKEN:}=!
set ADMIN_TOKEN=!ADMIN_TOKEN: =!

if "!ADMIN_TOKEN!"=="" (
    echo [ERRO] Falha na autenticacao. Verifique email e senha.
    pause
    exit /b 1
)
echo [OK] Login bem-sucedido!

:: 4. Listar ambientes e pedir seleção
echo.
echo ------------------------------------------
echo  Selecao da Sala (Ambiente)
echo ------------------------------------------
echo [..] Buscando suas salas...
for /f "delims=" %%B in ('curl -s "%API_URL%/api/ambiente/meus" -H "Authorization: Bearer !ADMIN_TOKEN!" 2^>nul') do set SALAS_RESP=%%B
echo.
echo Resposta das salas:
echo !SALAS_RESP!
echo.
echo ------------------------------------------
set /p AMBIENTE_ID="Digite o ID da Sala (campo id): "

:: 5. Obter a chave de instalação do ambiente
for /f "delims=" %%C in ('curl -s "%API_URL%/api/ambiente/%AMBIENTE_ID%/installkey" -H "Authorization: Bearer !ADMIN_TOKEN!" 2^>nul') do set KEY_RESP=%%C
for /f "tokens=2 delims=:" %%K in ('echo !KEY_RESP! ^| findstr /i "installKey"') do set KEY_RAW=%%K
set INSTALL_KEY=!KEY_RAW:"=!
set INSTALL_KEY=!INSTALL_KEY:,=!
set INSTALL_KEY=!INSTALL_KEY:}=!
set INSTALL_KEY=!INSTALL_KEY: =!

if "!INSTALL_KEY!"=="" (
    :: Fallback: pede manualmente
    set /p INSTALL_KEY="Chave de instalacao nao encontrada. Digite manualmente: "
)

:: 6. Gravar arquivo .env
echo API_URL=%API_URL%> "%AGENT_DIR%\.env"
echo BACKEND_URL=%API_URL%>> "%AGENT_DIR%\.env"
echo AMBIENTE_ID=%AMBIENTE_ID%>> "%AGENT_DIR%\.env"
echo INSTALL_KEY=!INSTALL_KEY!>> "%AGENT_DIR%\.env"
echo [OK] Configuracoes gravadas.

:: 7. Adicionar ao startup do Windows
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "WebBlockAgent" /t REG_SZ /d "\"%AGENT_DIR%\webblock-agent.exe\"" /f >nul
echo [OK] Agente configurado para iniciar com o Windows.

:: 8. Iniciar o agente agora
start "" "%AGENT_DIR%\webblock-agent.exe"
echo [OK] Agente iniciado em background.

echo.
echo  ==========================================
echo   INSTALACAO CONCLUIDA!
echo   Este computador esta sendo monitorado.
echo  ==========================================
echo.
pause
