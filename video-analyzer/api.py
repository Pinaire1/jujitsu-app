from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests, os, tempfile, cv2
import openai
import mediapipe as mp
from dotenv import load_dotenv

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:5173"),
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VideoAnalysisRequest(BaseModel):
    video_url: str
    user_id: str
    video_id: str

@app.post("/analyze")
def analyze_video(req: VideoAnalysisRequest):
    try:
        # 1. Download video
        video_data = requests.get(req.video_url).content
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            tmp.write(video_data)
            video_path = tmp.name

        # 2. Pose Analysis (MediaPipe)
        mp_pose = mp.solutions.pose
        pose = mp_pose.Pose()
        cap = cv2.VideoCapture(video_path)
        insights = []
        frame_num = 0
        frame_rate = cap.get(cv2.CAP_PROP_FPS)

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            results = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            if results.pose_landmarks:
                hips = results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP]
                shoulders = results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]

                if hips.y < shoulders.y - 0.1:
                    timecode = seconds_to_timestamp(frame_num / frame_rate)
                    insights.append({
                        "timestamp": timecode,
                        "tip": "Your hips appear too high in this frame. Lower them for better balance."
                    })

            frame_num += 1

        cap.release()
        os.remove(video_path)

        # 3. GPT Summary Feedback
        gpt_summary = get_gpt_feedback(req.video_url)

        # 4. Combine both feedback types
        insights.append({
            "timestamp": "00:00",
            "tip": f"GPT Feedback: {gpt_summary}"
        })

        return {
            "video_id": req.video_id,
            "insights": insights
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def get_gpt_feedback(video_url: str) -> str:
    prompt = f"""
You are a Brazilian Jiu-Jitsu coach. Provide general feedback on the video below:
- Highlight mistakes or improvements in timing, control, positioning, transitions
- Give positive encouragement and coaching points
- Speak clearly and helpfully

Video URL: {video_url}
"""
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )

    return response['choices'][0]['message']['content'].strip()


def seconds_to_timestamp(seconds: float) -> str:
    mins = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{mins:02}:{secs:02}"

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 