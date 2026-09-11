import translators as ts

def Translate(text : str, target_lang : str , engine : str = 'google') -> dict:
    if not text or not text.strip():
        return {'status': False, 'error': 'No text provided for translation.'}
    if not target_lang or not target_lang.strip():
        return {'status': False, 'error': 'No target language specified.'}

    # Attempt primary engine, then fall back if needed
    candidate_engines = [engine]
    for fallback in ['google', 'bing']:
        if fallback not in candidate_engines:
            candidate_engines.append(fallback)

    last_error = "Unknown error"
    for eng in candidate_engines:
        try:
            translation = ts.translate_text(query_text = text.strip(), to_language = target_lang.strip(), translator = eng)
            return {'status': True, 'translation': translation, 'engine': eng}
        except ts.server.TranslatorError as e:
            last_error = f"Translation engine '{eng}' error: {e}"
            print(f"[Translation Engine Error] {eng} failed: {e}")
        except TimeoutError as e:
            last_error = f"Connection timeout using '{eng}': {e}"
            print(f"[Network Error] Could not connect to translation server: {e}")
        except Exception as e:
            last_error = f"Error with '{eng}': {e}"
            print(f"[Unexpected Error] {eng} failed: {e}")

    return {'status': False, 'error': last_error}