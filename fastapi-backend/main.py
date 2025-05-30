from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import requests, os, tempfile, cv2
import openai
import mediapipe as mp
from dotenv import load_dotenv
from analyze_video import run as async_analysis
import shutil
from typing import Optional, List, Dict

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

# Create temp directory if it doesn't exist
TEMP_VIDEO_DIR = "temp_videos"
os.makedirs(TEMP_VIDEO_DIR, exist_ok=True)

class VideoAnalysisRequest(BaseModel):
    video_url: str
    user_id: str
    video_id: str
    analysis_prompt: Optional[str] = None

@app.post("/upload-video/")
async def upload_video(
    file: UploadFile = File(...),
    user_id: Optional[str] = None
):
    try:
        # Validate file type
        if not file.content_type.startswith('video/'):
            raise HTTPException(
                status_code=400,
                detail="File must be a video"
            )

        # Create a unique filename
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{user_id or 'anonymous'}_{os.urandom(8).hex()}{file_ext}"
        file_location = os.path.join(TEMP_VIDEO_DIR, unique_filename)

        # Save the file
        try:
            with open(file_location, "wb") as f:
                shutil.copyfileobj(file.file, f)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save file: {str(e)}"
            )
        finally:
            file.file.close()

        # Start analysis in background
        try:
            # Create a temporary URL for the file
            file_url = f"file://{os.path.abspath(file_location)}"
            
            # Start analysis in background
            import threading
            threading.Thread(
                target=async_analysis,
                args=(file_url, user_id or "anonymous"),
                kwargs={"temp_file": file_location}  # Pass file location for cleanup
            ).start()

            return JSONResponse(content={
                "status": "success",
                "message": "Video uploaded and analysis started",
                "filename": unique_filename
            })
        except Exception as e:
            # Clean up file if analysis fails to start
            os.remove(file_location)
            raise HTTPException(
                status_code=500,
                detail=f"Failed to start analysis: {str(e)}"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )

@app.post("/analyze")
async def analyze_video_endpoint(request: VideoAnalysisRequest):
    try:
        # Download video from URL
        response = requests.get(request.video_url)
        if response.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail="Failed to download video from URL"
            )

        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            tmp.write(response.content)
            tmp_path = tmp.name

        try:
            # Run the analysis
            feedback = async_analysis(tmp_path, request.user_id)
            
            # If we have a specific analysis prompt, get GPT feedback
            if request.analysis_prompt:
                gpt_feedback = get_gpt_feedback(request.video_url, request.analysis_prompt)
                feedback.append({
                    "timestamp": "N/A",
                    "tip": gpt_feedback
                })

            return JSONResponse(content={"insights": feedback})
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Analysis failed: {str(e)}"
            )
        finally:
            # Clean up the temporary file
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )

def get_gpt_feedback(video_url: str, analysis_prompt: str) -> str:
    prompt = f"""
You are a Brazilian Jiu-Jitsu coach analyzing a student's technique. The student has requested specific feedback on:

{analysis_prompt}

Please provide detailed feedback on the video below, focusing on the requested aspects:
- Be specific about timing, control, positioning, and transitions
- Give positive encouragement and actionable coaching points
- Speak clearly and helpfully
- If you notice any safety concerns, highlight them

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