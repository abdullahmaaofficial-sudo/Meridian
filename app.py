from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from meaning import get_response, get_meaning_data
from translate import Translate

app = FastAPI(
    title="Meridian API",
    description="FastAPI backend for vocabulary meanings, pronunciations, and multilingual translation.",
    version="1.0.0"
)

# Enable CORS for browser access. allow_credentials must be False when
# allow_origins is a wildcard - the combination is invalid per the CORS spec
# and browsers will reject it if any request ever carries credentials.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# The frontend (index.html / script.js) lives in /public and is served
# directly by Vercel's CDN - it never reaches this function. This route is
# just a plain API health/info response for the rare case something hits
# "/" without a static file in front of it (e.g. local `uvicorn` runs).
@app.get("/", include_in_schema=False)
def api_root():
    return {
        'status': 'working',
        'app': 'Meridian API',
        'routes': {
            'route_1': '/get-meaning/hello',
            'route_2': '/get-translation?lang=ur&text=hello'
        },
        'description': 'FastAPI backend for translation and meaning.'
    }

@app.get('/health', include_in_schema=False)
def health():
    return {'status': 'ok'}

@app.get('/get-meaning/{word}')
def get_meaning(word : str):
    if not word or not word.strip():
        raise HTTPException(status_code = 400, detail = "Word was not provided for meaning.")
    response = get_response(word = word.strip())
    if not response['status']:
        raise HTTPException(status_code = 404, detail = response['error'])

    meaning_data = get_meaning_data(response_data = response['data'])
    return meaning_data

# Translation via Query parameters (handles sentences with punctuation, slashes, etc.)
@app.get('/get-translation')
def get_translation_by_query(
    lang: str = Query(..., description="Target language code, e.g. 'ur', 'es', 'fr'"),
    text: str = Query(..., description="Word or sentence to translate", max_length=1000)
):
    if not lang or not text:
        raise HTTPException(status_code = 400, detail = 'Required data (lang and text) was not provided.')

    translation = Translate(text = text, target_lang = lang)
    if not translation['status']:
        raise HTTPException(status_code = 500, detail = translation['error'])

    return {
        'translation': translation['translation'],
        'engine': translation.get('engine', 'unknown'),
        'target_lang': lang,
        'source_text': text
    }

if __name__ == '__main__':
    uvicorn.run(app = 'app:app', host='127.0.0.1', port = 8000, reload=True, log_level = 'info')