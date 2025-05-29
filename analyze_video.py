import os
import cv2
import mediapipe as mp
import openai
import json
from datetime import datetime
from dotenv import load_dotenv
import requests
import tempfile

load_dotenv()

# Setup clients
try:
    from supabase import create_client
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE"))
    SUPABASE_ENABLED = True
except:
    print("Warning: Supabase not configured. Analysis results will not be saved to database.")
    SUPABASE_ENABLED = False

openai.api_key = os.getenv("OPENAI_API_KEY")

# Video config
VIDEO_BUCKET = "videos"
OUTPUT_ANALYSIS_TABLE = "video_analysis"

def download_video(video_path, save_as="temp_video.mp4"):
    # Handle both Supabase storage paths and URLs
    if video_path.startswith("file://"):
        # Local file path
        return video_path.replace("file://", "")
    elif video_path.startswith(("http://", "https://")):
        # Download from URL
        response = requests.get(video_path)
        with open(save_as, "wb") as f:
            f.write(response.content)
        return save_as
    else:
        # If Supabase is not configured, treat as local file
        if not SUPABASE_ENABLED:
            return video_path
        # Supabase storage path
        response = supabase.storage.from_(VIDEO_BUCKET).download(video_path)
        with open(save_as, "wb") as f:
            f.write(response)
        return save_as

def analyze_pose(video_file):
    cap = cv2.VideoCapture(video_file)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_number = 0
    feedback = []

    mp_pose = mp.solutions.pose.Pose()
    
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break

        frame_number += 1
        result = mp_pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

        if result.pose_landmarks:
            # Example: Check if hands are too low (just mock logic)
            left_wrist = result.pose_landmarks.landmark[mp.solutions.pose.PoseLandmark.LEFT_WRIST]
            if left_wrist.y > 0.6:
                timestamp = frame_number / fps
                feedback.append({
                    "timestamp": round(timestamp, 2),
                    "tip": "Keep your hands higher to defend better."
                })

    cap.release()
    return feedback

def generate_ai_feedback(actions):
    # If we have specific feedback from pose analysis, use that instead of generating new feedback
    if actions and isinstance(actions, list) and len(actions) > 0:
        return actions
    
    # Fallback to AI generation if no specific feedback was found
    prompt = (
        "You're a Brazilian Jiu-Jitsu coach analyzing a student's roll. "
        "Here's a list of observed positions and transitions:\n"
        + "\n".join(actions)
        + "\n\nProvide 3 tips or areas to improve based on the observed sequence."
    )

    res = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
    )

    return res.choices[0].message.content

def save_to_supabase(user_id, video_path, insights):
    if not SUPABASE_ENABLED:
        print("Skipping Supabase save - not configured")
        return
    
    try:
        supabase.table(OUTPUT_ANALYSIS_TABLE).insert({
            "user_id": user_id,
            "video_path": video_path,
            "insights": json.dumps(insights),
            "analyzed_at": datetime.utcnow().isoformat()
        }).execute()
    except Exception as e:
        print(f"Warning: Failed to save to Supabase: {str(e)}")

def run(video_path, user_id, temp_file=None):
    try:
        # Download or get local file path
        local_file = download_video(video_path)
        
        # Analyze video
        feedback = analyze_pose(local_file)
        
        # If no specific feedback was found, generate AI feedback
        if not feedback:
            actions = ["No specific pose issues detected"]
            ai_feedback = generate_ai_feedback(actions)
            feedback = [{"timestamp": "N/A", "tip": tip.strip()} for tip in ai_feedback.split("\n") if tip.strip()]
        
        # Save results
        save_to_supabase(user_id, video_path, feedback)
        
        # Cleanup
        if temp_file and os.path.exists(temp_file):
            os.remove(temp_file)
        elif local_file != video_path.replace("file://", ""):  # Only remove if it's a downloaded file
            os.remove(local_file)
            
        return feedback
            
    except Exception as e:
        # Ensure cleanup on error
        if temp_file and os.path.exists(temp_file):
            os.remove(temp_file)
        raise e

# Example call
if __name__ == "__main__":
    run("user-abc123/jiu-roll-01.mp4", "user-uuid-from-auth")
