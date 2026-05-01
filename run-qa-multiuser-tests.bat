@echo off
REM Veribee QA Multi-User Test Suite Runner
REM Tests Seller, Buyer, and Rider flows against QA Test Plan
REM Verifies workflow.md compliance (SUBMIT → AUTHENTICATE → ASSURE)

setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ========================================
echo  Veribee QA Multi-User Test Suite
echo ========================================
echo.

REM Check for npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm not found. Please install Node.js
    exit /b 1
)

echo [1/5] Installing dependencies...
call npm install --save-dev @playwright/test >nul 2>&1

echo [2/5] Installing Chromium...
call npx playwright install chromium >nul 2>&1

echo [3/5] Starting test suite...
echo.
echo Using config: playwright.qa-multiuser.config.ts
echo Test file:   veribee_qa_multiuser.spec.ts
echo.

REM Run the tests
call npx playwright test veribee_qa_multiuser.spec.ts --config=playwright.qa-multiuser.config.ts

set TEST_EXIT=%ERRORLEVEL%

echo.
echo [4/5] Opening HTML report...
timeout /t 2 >nul

if exist "qa-multiuser-report\index.html" (
    start "" "qa-multiuser-report\index.html"
)

echo [5/5] Cleaning up...
REM Optional: Keep config and test file for re-running, delete only if needed
REM del playwright.qa-multiuser.config.ts
REM del veribee_qa_multiuser.spec.ts

echo.
if %TEST_EXIT% EQU 0 (
    echo ✓ Tests completed successfully!
) else (
    echo ⚠ Some tests failed. Check report for details.
)

echo.
echo Artifacts saved to: qa-multiuser-artifacts\
echo Report:            qa-multiuser-report\index.html
echo Results JSON:      qa-multiuser-results.json
echo.

exit /b %TEST_EXIT%
