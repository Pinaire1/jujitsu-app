import os
import cv2
import mediapipe as mp
import openai
import json
from datetime import datetime
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# Setup clients
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE"))
openai.api_key = os.getenv("OPENAI_API_KEY")

# Video config
VIDEO_BUCKET = "videos"
OUTPUT_ANALYSIS_TABLE = "video_analysis"

def download_video(video_path, save_as="temp_video.mp4"):
    response = supabase.storage.from_(VIDEO_BUCKET).download(video_path)
    with open(save_as, "wb") as f:
        f.write(response)
    return save_as

def analyze_pose(video_file):
    mp_pose = mp.solutions.pose
    cap = cv2.VideoCapture(video_file)
    pose = mp_pose.Pose()
    frame_count = 0
    actions_detected = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Reduce frame rate analysis for speed (every 10th frame)
        if frame_count % 10 == 0:
            results = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            if results.pose_landmarks:
                # Simplified detection example
                actions_detected.append(f"Frame {frame_count}: Pose detected")

        frame_count += 1

    cap.release()
    return actions_detected

def generate_ai_feedback(actions):
    prompt = (
        "You're a Brazilian Jiu-Jitsu coach analyzing a student's roll. "
        "Here’s a list of observed positions and transitions:\n"
        + "\n".join(actions)
        + "\n\nProvide 3 tips or areas to improve based on the observed sequence."
    )

    res = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
    )

    return res.choices[0].message.content

def save_to_supabase(user_id, video_path, insights):
    supabase.table(OUTPUT_ANALYSIS_TABLE).insert({
        "user_id": user_id,
        "video_path": video_path,
        "insights": json.dumps(insights),
        "analyzed_at": datetime.utcnow().isoformat()
    }).execute()

def run(video_path, user_id):
    local_file = download_video(video_path)
    actions = analyze_pose(local_file)
    ai_feedback = generate_ai_feedback(actions)
    insights = [{"timestamp": "N/A", "tip": tip.strip()} for tip in ai_feedback.split("\n") if tip.strip()]
    save_to_supabase(user_id, video_path, insights)
    os.remove(local_file)

# Example call
if __name__ == "__main__":
    run("user-abc123/jiu-roll-01.mp4", "user-uuid-from-auth")
