#!/usr/bin/env python3
import os
import sys
import json
import requests
from pathlib import Path
from getpass import getpass
import webbrowser
from time import sleep

def print_step(step_num, total_steps, message):
    """Print a formatted step message."""
    print(f"\n[{step_num}/{total_steps}] {message}")
    print("-" * 50)

def create_supabase_project():
    """Guide user through creating a Supabase project."""
    print_step(1, 4, "Creating Supabase Project")
    print("1. Opening Supabase website...")
    webbrowser.open("https://supabase.com")
    print("\n2. Please:")
    print("   - Sign up or log in to Supabase")
    print("   - Click 'New Project'")
    print("   - Choose a name for your project")
    print("   - Set a secure database password")
    print("   - Choose a region close to you")
    print("   - Wait for the project to be created")
    
    input("\nPress Enter when you've created the project...")
    return True

def create_storage_bucket():
    """Guide user through creating a storage bucket."""
    print_step(2, 4, "Creating Storage Bucket")
    print("1. In your Supabase project dashboard:")
    print("   - Click on 'Storage' in the left sidebar")
    print("   - Click 'Create a new bucket'")
    print("   - Name it 'videos'")
    print("   - Make it public")
    print("   - Click 'Create bucket'")
    
    input("\nPress Enter when you've created the bucket...")
    return True

def get_api_credentials():
    """Guide user through getting API credentials."""
    print_step(3, 4, "Getting API Credentials")
    print("1. In your Supabase project dashboard:")
    print("   - Click on 'Project Settings' (gear icon)")
    print("   - Click on 'API' in the sidebar")
    print("   - You'll need two things:")
    print("     a. Project URL (under 'Project Configuration')")
    print("     b. service_role key (under 'Project API keys')")
    
    project_url = input("\nEnter your Project URL: ").strip()
    service_role = input("Enter your service_role key: ").strip()
    
    return project_url, service_role

def create_env_file(project_url, service_role):
    """Create or update .env file with Supabase credentials."""
    print_step(4, 4, "Creating .env file")
    
    env_path = Path(".env")
    env_content = []
    
    # Read existing .env if it exists
    if env_path.exists():
        with env_path.open() as f:
            env_content = f.readlines()
    
    # Update or add Supabase credentials
    supabase_vars = {
        "SUPABASE_URL": project_url,
        "SUPABASE_SERVICE_ROLE": service_role
    }
    
    new_content = []
    vars_updated = set()
    
    # Update existing variables
    for line in env_content:
        for var, value in supabase_vars.items():
            if line.startswith(f"{var}="):
                new_content.append(f"{var}={value}\n")
                vars_updated.add(var)
                break
        else:
            new_content.append(line)
    
    # Add any missing variables
    for var, value in supabase_vars.items():
        if var not in vars_updated:
            new_content.append(f"{var}={value}\n")
    
    # Write the file
    with env_path.open("w") as f:
        f.writelines(new_content)
    
    print("✅ .env file has been created/updated with Supabase credentials")
    return True

def main():
    """Run the Supabase setup process."""
    print("🚀 Starting Supabase Setup Process")
    print("This script will help you set up your Supabase project for the Jujitsu Video Analysis app.\n")
    
    try:
        if create_supabase_project():
            if create_storage_bucket():
                project_url, service_role = get_api_credentials()
                if create_env_file(project_url, service_role):
                    print("\n" + "="*50)
                    print("✅ Supabase setup completed successfully!")
                    print("="*50)
                    print("\nNext steps:")
                    print("1. Make sure to add your OpenAI API key to the .env file")
                    print("2. Run the prerequisites check script:")
                    print("   python scripts/check_prerequisites.py")
                    print("3. Start the application:")
                    print("   python main.py")
    except KeyboardInterrupt:
        print("\n\nSetup cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nAn error occurred: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 