# Jujitsu Video Analysis Backend

This is the FastAPI backend for the Jujitsu Video Analysis application. It provides endpoints for video analysis and processing.

## Prerequisites

Before you begin, ensure you have:

1. Python 3.8 or higher installed
2. A Supabase account (free tier is fine)
3. An OpenAI API key
4. Basic knowledge of Python and API development

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Pinaire1/FastAPI-backend.git
cd FastAPI-backend
```

### 2. Set Up Python Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Supabase Setup

You can use our setup script to help you configure Supabase:

```bash
python scripts/setup_supabase.py
```

This script will:

1. Guide you through creating a Supabase project
2. Help you create the required storage bucket
3. Get your API credentials
4. Set up your `.env` file

Alternatively, you can set up Supabase manually:

1. Create a new project at [Supabase](https://supabase.com)
2. Create a new bucket named "videos" in Storage
3. Get your project URL and service role key from Project Settings > API

### 4. OpenAI Setup

1. Create an account at [OpenAI](https://openAI.com)
2. Generate an API key from your account settings
3. Add funds to your account (API calls are not free)

### 5. Environment Configuration

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Edit `.env` and add your credentials:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE=your_supabase_service_role
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=http://localhost:5173
PORT=8000
```

### 6. Check Prerequisites

Run the prerequisites check script to ensure everything is set up correctly:

```bash
python scripts/check_prerequisites.py
```

This script will verify:

- Python version
- Required packages
- Environment variables
- Virtual environment setup

### 7. Run the Server

```bash
python main.py
```

The server will start at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
fastapi-backend/
├── main.py              # Main application entry point
├── analyze_video.py     # Video analysis logic
├── requirements.txt     # Python dependencies
├── supabase_setup.sql   # Database schema and setup
├── temp_videos/         # Temporary video storage
└── scripts/            # Utility scripts
    ├── setup_supabase.py
    └── check_prerequisites.py
```

## API Endpoints

### Video Analysis

- `POST /analyze-video`: Upload and analyze a video
- `GET /analysis/{analysis_id}`: Get analysis results
- `GET /videos`: List all analyzed videos

### Authentication

- `POST /auth/login`: User login
- `POST /auth/register`: User registration
- `GET /auth/me`: Get current user info

## Troubleshooting

### Common Issues:

1. **ModuleNotFoundError**: Make sure you've activated the virtual environment and installed all dependencies
2. **Supabase Connection Error**: Verify your Supabase URL and service role key
3. **OpenAI API Error**: Check your API key and account balance
4. **CORS Error**: Ensure FRONTEND_URL in .env matches your frontend's URL

### Getting Help

If you encounter any issues:

1. Run the prerequisites check script:
   ```bash
   python scripts/check_prerequisites.py
   ```
2. Check the error message in the terminal
3. Verify all environment variables are set correctly
4. Check the API documentation at `/docs` endpoint

## Security Notes

- Never commit your `.env` file
- Keep your API keys secure
- Don't share your Supabase service role key
- Monitor your OpenAI API usage

## Deployment

The application is configured for deployment on Render.com using the `render.yaml` configuration file.

## Contributing

1. Create a new branch for your feature
2. Follow PEP 8 style guide
3. Write meaningful commit messages
4. Submit a pull request

## Dependencies

Key dependencies include:

- FastAPI: Web framework
- Uvicorn: ASGI server
- OpenAI: AI model integration
- Supabase: Database and storage
- Python-multipart: File upload handling
- Pydantic: Data validation 