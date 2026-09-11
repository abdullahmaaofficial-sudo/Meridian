import requests

def get_response(word : str):
    clean_word = word.strip().lower()

    url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{clean_word}"
    try:
        response = requests.get(url, timeout = 8)
        if response.ok:
            data = response.json()
            if isinstance(data, list) and data:
                return {'status': True, 'data': data[0]}
    except Exception as e:
        print(f"Primary dictionary API note for '{clean_word}': {e}.")

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