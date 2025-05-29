#!/usr/bin/env python3
import sys
import subprocess
import pkg_resources
import os
from pathlib import Path

def check_python_version():
    """Check if Python version is 3.8 or higher."""
    print("Checking Python version...")
    if sys.version_info >= (3, 8):
        print("✅ Python version is 3.8 or higher")
        return True
    else:
        print("❌ Python version must be 3.8 or higher")
        return False

def check_pip():
    """Check if pip is installed."""
    print("\nChecking pip installation...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "--version"], 
                      capture_output=True, check=True)
        print("✅ pip is installed")
        return True
    except subprocess.CalledProcessError:
        print("❌ pip is not installed")
        return False

def check_virtualenv():
    """Check if virtualenv is installed."""
    print("\nChecking virtualenv...")
    try:
        subprocess.run([sys.executable, "-m", "venv", "--help"], 
                      capture_output=True, check=True)
        print("✅ virtualenv is available")
        return True
    except subprocess.CalledProcessError:
        print("❌ virtualenv is not available")
        return False

def check_requirements():
    """Check if all required packages are installed."""
    print("\nChecking required packages...")
    required = {
        'fastapi',
        'uvicorn',
        'python-multipart',
        'python-dotenv',
        'openai',
        'supabase',
        'mediapipe',
        'opencv-python',
        'requests'
    }
    
    installed = {pkg.key for pkg in pkg_resources.working_set}
    missing = required - installed
    
    if not missing:
        print("✅ All required packages are installed")
        return True
    else:
        print("❌ Missing packages:", ", ".join(missing))
        print("\nTo install missing packages, run:")
        print("pip install -r requirements.txt")
        return False

def check_env_file():
    """Check if .env file exists and has required variables."""
    print("\nChecking .env file...")
    env_path = Path(".env")
    required_vars = {
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE',
        'OPENAI_API_KEY',
        'FRONTEND_URL',
        'PORT'
    }
    
    if not env_path.exists():
        print("❌ .env file not found")
        print("Create a .env file with the following variables:")
        for var in required_vars:
            print(f"- {var}")
        return False
    
    with env_path.open() as f:
        content = f.read()
        missing = [var for var in required_vars if var not in content]
        
    if not missing:
        print("✅ .env file contains all required variables")
        return True
    else:
        print("❌ .env file is missing variables:", ", ".join(missing))
        return False

def main():
    """Run all checks."""
    print("🔍 Starting prerequisites check...\n")
    
    checks = [
        check_python_version,
        check_pip,
        check_virtualenv,
        check_requirements,
        check_env_file
    ]
    
    results = [check() for check in checks]
    
    print("\n" + "="*50)
    if all(results):
        print("✅ All prerequisites are met! You're ready to run the application.")
    else:
        print("❌ Some prerequisites are not met. Please fix the issues above.")
    print("="*50)

if __name__ == "__main__":
    main() 