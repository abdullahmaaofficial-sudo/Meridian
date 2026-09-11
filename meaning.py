import requests
import time

REQUEST_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json',
}
 
def get_response(word : str):
    clean_word = word.strip().lower()
 
    url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{clean_word}"
 
    for attempt in range(2):  # try once, retry once on failure
        try:
            response = requests.get(url, headers = REQUEST_HEADERS, timeout = 35)
            if response.ok:
                data = response.json()
                if isinstance(data, list) and data:
                    return {'status': True, 'data': data[0]}
                # API responded but had nothing for this word - no point retrying
                break
            if response.status_code == 404:
                # Word genuinely not found - no point retrying
                break
        except requests.exceptions.Timeout as e:
            print(f"[Dictionary API] Timeout on attempt {attempt + 1} for '{clean_word}': {e}")
        except requests.exceptions.RequestException as e:
            print(f"[Dictionary API] Request error on attempt {attempt + 1} for '{clean_word}': {e}")
 
        if attempt == 0:
            time.sleep(1)  # brief backoff before retrying a slow/overloaded server
 
    return {'status': False, 'error': f"Could not find definition for '{clean_word}'."}

def get_meaning_data(response_data : dict) -> dict:
    word = response_data.get('word', '')
    phonetic = response_data.get('phonetic', '')
    phonetics_list = response_data.get('phonetics', [])

    audio = ''
    for p in phonetics_list:
        if not phonetic and p.get('text'):
            phonetic = p.get('text')
        if p.get('audio') and not audio:
            audio = p.get('audio')

    if not phonetic:
        phonetic = "Not Found"

    meanings = response_data.get('meanings', [])
    all_meanings = []

    for meaning in meanings:
        part_speech = meaning.get('partOfSpeech', 'unknown')
        definitons = {idx: {'def': entry.get('definition'), 'exa': entry.get('example')} 
                            for idx, entry in enumerate(meaning.get('definitions', []))}
        synonyms = meaning.get('synonyms', [])
        antonyms = meaning.get('antonyms', [])

        all_meanings.append({
            'part_speech': part_speech, 
            'definitions': definitons, 
            'synonyms': synonyms,
            'antonyms': antonyms
        })

    return {
        'word': word,
        'phonetic': phonetic,
        'audio': audio,
        'meanings': all_meanings
    }