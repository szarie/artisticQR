# Artistic QR

Next.js frontend for generating QR codes with optional artwork.

## Run locally

1. Install backend dependencies:

   ```bash
   cd ../backendqr
   python -m pip install -r requirements.txt
   ```

2. Start the FastAPI backend:

   ```bash
   uvicorn main:app --reload --port 8000
   ```

3. Install frontend dependencies:

   ```bash
   cd ../artisticQR
   npm install
   ```

4. Copy `.env.example` to `.env.local` and set `API_URL` to the URL of the
   FastAPI backend. For local development, use:

   ```text
   API_URL=http://127.0.0.1:8000
   ```

5. Start the frontend:

   ```bash
   npm run dev
   ```

The frontend proxies uploads through `/api/upload` to the backend endpoint
`/api/qrcode/upload`.
