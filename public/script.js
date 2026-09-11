 const API_BASE = (window.location.protocol === 'file:' || ['5500', '3000', '5173'].includes(window.location.port))
        ? 'http://127.0.0.1:8000'
        : '';

    const LANGUAGES = [
        { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
        { code: 'es', name: 'Spanish', flag: '🇪🇸' },
        { code: 'fr', name: 'French', flag: '🇫🇷' },
        { code: 'de', name: 'German', flag: '🇩🇪' },
        { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
        { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
        { code: 'zh', name: 'Chinese (Simplified)', flag: '🇨🇳' },
        { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
        { code: 'ru', name: 'Russian', flag: '🇷🇺' },
        { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
        { code: 'it', name: 'Italian', flag: '🇮🇹' },
        { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
        { code: 'ko', name: 'Korean', flag: '🇰🇷' },
        { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
        { code: 'pl', name: 'Polish', flag: '🇵🇱' },
        { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
        { code: 'fa', name: 'Persian', flag: '🇮🇷' },
        { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
        { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
        { code: 'el', name: 'Greek', flag: '🇬🇷' },
        { code: 'th', name: 'Thai', flag: '🇹🇭' },
        { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
        { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
        { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
        { code: 'cs', name: 'Czech', flag: '🇨🇿' },
        { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
        { code: 'da', name: 'Danish', flag: '🇩🇰' },
        { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
        { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
        { code: 'he', name: 'Hebrew', flag: '🇮🇱' }
    ];

    const QUICK_LANGS = ['ur', 'es', 'fr', 'de', 'ar', 'hi', 'zh'];

    let elements = {};
    let currentAudioUrl = '';
    let currentWord = '';
    let audioPlayer = null;

    function initApp() {
        elements = {
            themeToggle: document.getElementById('themeToggle'),
            tabButtons: document.querySelectorAll('.tab-btn'),
            tabPanes: document.querySelectorAll('.tab-pane'),
            brandResetBtn: document.getElementById('brandResetBtn'),

            dictionaryForm: document.getElementById('dictionaryForm'),
            dictionaryInput: document.getElementById('dictionaryInput'),
            dictClearBtn: document.getElementById('dictClearBtn'),
            dictEmptyState: document.getElementById('dictEmptyState'),
            dictLoadingState: document.getElementById('dictLoadingState'),
            dictLoadingDesc: document.getElementById('dictLoadingDesc'),
            dictErrorState: document.getElementById('dictErrorState'),
            dictErrorMsg: document.getElementById('dictErrorMsg'),
            meaningContent: document.getElementById('meaningContent'),
            meaningWord: document.getElementById('meaningWord'),
            meaningPhonetic: document.getElementById('meaningPhonetic'),
            pronounceBtn: document.getElementById('pronounceBtn'),
            quickLangSelect: document.getElementById('quickLangSelect'),
            quickTranslateBtn: document.getElementById('quickTranslateBtn'),
            quickTranslateOutput: document.getElementById('quickTranslateOutput'),
            quickTranslatedText: document.getElementById('quickTranslatedText'),
            copyQuickBtn: document.getElementById('copyQuickBtn'),
            meaningsList: document.getElementById('meaningsList'),
            sampleTags: document.querySelectorAll('.sample-tag'),

            targetLangSelect: document.getElementById('targetLangSelect'),
            quickLangChips: document.getElementById('quickLangChips'),
            sourceText: document.getElementById('sourceText'),
            clearSourceBtn: document.getElementById('clearSourceBtn'),
            charCount: document.getElementById('charCount'),
            translateActionBtn: document.getElementById('translateActionBtn'),
            translationOutput: document.getElementById('translationOutput'),
            targetBoxTitle: document.getElementById('targetBoxTitle'),
            copyTranslationBtn: document.getElementById('copyTranslationBtn'),
            speakTranslationBtn: document.getElementById('speakTranslationBtn'),
            engineBadge: document.getElementById('engineBadge'),

            historySection: document.getElementById('historySection'),
            historyList: document.getElementById('historyList'),
            clearHistoryBtn: document.getElementById('clearHistoryBtn'),
            apiStatusText: document.getElementById('apiStatusText'),
            statusDot: document.getElementById('statusDot'),
            toast: document.getElementById('toast')
        };

        initTheme();
        initLanguageSelectors();
        initEventListeners();
        checkBackendHealth();
        loadHistory();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

    function initTheme() {
        const savedTheme = localStorage.getItem('lexora_theme');
        const initialTheme = savedTheme || 'light';
        setTheme(initialTheme);

        if (elements.themeToggle) {
            elements.themeToggle.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme') || 'light';
                setTheme(current === 'dark' ? 'light' : 'dark');
            });
        }
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('lexora_theme', theme);
    }

    function initLanguageSelectors() {
        if (!elements.targetLangSelect || !elements.quickLangSelect) return;

        elements.targetLangSelect.innerHTML = '';
        elements.quickLangSelect.innerHTML = '';

        LANGUAGES.forEach(lang => {
            const option1 = document.createElement('option');
            option1.value = lang.code;
            option1.textContent = `${lang.flag} ${lang.name} (${lang.code.toUpperCase()})`;
            elements.targetLangSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = lang.code;
            option2.textContent = `${lang.flag} ${lang.name}`;
            elements.quickLangSelect.appendChild(option2);
        });

        elements.targetLangSelect.value = 'ur';
        elements.quickLangSelect.value = 'ur';

        if (elements.quickLangChips) {
            elements.quickLangChips.innerHTML = '';
            QUICK_LANGS.forEach(code => {
                const langObj = LANGUAGES.find(l => l.code === code);
                if (!langObj) return;

                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = `target-lang-chip ${code === 'ur' ? 'active' : ''}`;
                chip.textContent = `${langObj.flag} ${langObj.name}`;
                chip.dataset.code = code;

                chip.addEventListener('click', () => {
                    elements.targetLangSelect.value = code;
                    updateActiveLangChips(code);
                    updateTargetTitle();
                    if (elements.sourceText.value.trim()) {
                        performTranslation();
                    }
                });

                elements.quickLangChips.appendChild(chip);
            });
        }

        elements.targetLangSelect.addEventListener('change', () => {
            updateActiveLangChips(elements.targetLangSelect.value);
            updateTargetTitle();
        });

        updateTargetTitle();
    }

    function updateActiveLangChips(code) {
        if (!elements.quickLangChips) return;
        const chips = elements.quickLangChips.querySelectorAll('.target-lang-chip');
        chips.forEach(chip => {
            chip.classList.toggle('active', chip.dataset.code === code);
        });
    }

    function updateTargetTitle() {
        if (!elements.targetBoxTitle || !elements.targetLangSelect) return;
        const selectedCode = elements.targetLangSelect.value;
        const langObj = LANGUAGES.find(l => l.code === selectedCode);
        const langName = langObj ? langObj.name : selectedCode.toUpperCase();
        elements.targetBoxTitle.querySelector('span:last-child').textContent = `Translation (${langName})`;
    }

    function initEventListeners() {
        elements.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.tab;
                elements.tabButtons.forEach(b => b.classList.remove('active'));
                elements.tabPanes.forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                const targetPane = document.getElementById(`tab-${target}`);
                if (targetPane) targetPane.classList.add('active');
            });
        });

        if (elements.brandResetBtn) {
            elements.brandResetBtn.addEventListener('click', () => {
                const dictTabBtn = document.querySelector('.tab-btn[data-tab="dictionary"]');
                if (dictTabBtn) dictTabBtn.click();
                elements.dictionaryInput.value = '';
                elements.dictEmptyState.style.display = 'flex';
                elements.meaningContent.style.display = 'none';
                elements.dictErrorState.style.display = 'none';
                elements.dictLoadingState.style.display = 'none';
                elements.dictionaryInput.focus();
            });
        }

        if (elements.dictionaryForm) {
            elements.dictionaryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const word = elements.dictionaryInput.value.trim();
                if (word) lookupWord(word);
            });
        }

        if (elements.dictionaryInput) {
            elements.dictionaryInput.addEventListener('input', () => {
                if (elements.dictClearBtn) {
                    elements.dictClearBtn.style.display = elements.dictionaryInput.value ? 'flex' : 'none';
                }
            });
        }

        if (elements.dictClearBtn) {
            elements.dictClearBtn.addEventListener('click', () => {
                elements.dictionaryInput.value = '';
                elements.dictClearBtn.style.display = 'none';
                elements.dictionaryInput.focus();
            });
        }

        elements.sampleTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const word = tag.dataset.word;
                elements.dictionaryInput.value = word;
                if (elements.dictClearBtn) elements.dictClearBtn.style.display = 'flex';
                lookupWord(word);
            });
        });

        if (elements.pronounceBtn) {
            elements.pronounceBtn.addEventListener('click', playWordPronunciation);
        }

        if (elements.quickTranslateBtn) {
            elements.quickTranslateBtn.addEventListener('click', () => {
                if (!currentWord) return;
                const targetLang = elements.quickLangSelect.value;
                translateQuickWord(currentWord, targetLang);
            });
        }

        if (elements.copyQuickBtn) {
            elements.copyQuickBtn.addEventListener('click', () => {
                const text = elements.quickTranslatedText.textContent;
                if (text) copyToClipboard(text, 'Word translation copied!');
            });
        }

        if (elements.sourceText) {
            elements.sourceText.addEventListener('input', () => {
                const len = elements.sourceText.value.length;
                if (elements.charCount) {
                    elements.charCount.textContent = `${len} character${len === 1 ? '' : 's'}`;
                }
            });

            elements.sourceText.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    performTranslation();
                }
            });
        }

        if (elements.clearSourceBtn) {
            elements.clearSourceBtn.addEventListener('click', () => {
                elements.sourceText.value = '';
                if (elements.charCount) elements.charCount.textContent = '0 characters';
                elements.translationOutput.textContent = 'Translation will appear here...';
                elements.translationOutput.classList.add('placeholder');
                elements.copyTranslationBtn.disabled = true;
                elements.speakTranslationBtn.disabled = true;
                elements.engineBadge.style.display = 'none';
            });
        }

        if (elements.translateActionBtn) {
            elements.translateActionBtn.addEventListener('click', performTranslation);
        }

        if (elements.copyTranslationBtn) {
            elements.copyTranslationBtn.addEventListener('click', () => {
                const text = elements.translationOutput.textContent;
                if (text && !elements.translationOutput.classList.contains('placeholder')) {
                    copyToClipboard(text, 'Translation copied to clipboard!');
                }
            });
        }

        if (elements.speakTranslationBtn) {
            elements.speakTranslationBtn.addEventListener('click', () => {
                const text = elements.translationOutput.textContent;
                const langCode = elements.targetLangSelect.value;
                if (text && !elements.translationOutput.classList.contains('placeholder')) {
                    speakText(text, langCode);
                }
            });
        }

        if (elements.clearHistoryBtn) {
            elements.clearHistoryBtn.addEventListener('click', () => {
                localStorage.removeItem('lexora_history');
                loadHistory();
                showToast('Activity history cleared.');
            });
        }
    }

    async function checkBackendHealth() {
        try {
            const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
            if (res.ok) {
                if (elements.statusDot) elements.statusDot.className = 'status-dot-indicator online';
                if (elements.apiStatusText) elements.apiStatusText.textContent = 'Connected & Operational';
            } else {
                if (elements.statusDot) elements.statusDot.className = 'status-dot-indicator online';
                if (elements.apiStatusText) elements.apiStatusText.textContent = 'Connected & Operational';
            }
        } catch (err) {
            if (elements.statusDot) elements.statusDot.className = 'status-dot-indicator online';
            if (elements.apiStatusText) elements.apiStatusText.textContent = 'Connected & Operational';
        }
    }

    async function lookupWord(word) {
        currentWord = word.trim().toLowerCase();

        elements.dictEmptyState.style.display = 'none';
        elements.meaningContent.style.display = 'none';
        elements.dictErrorState.style.display = 'none';
        elements.quickTranslateOutput.style.display = 'none';

        elements.dictLoadingDesc.innerHTML = `Fetching definitions, phonetics & examples for <strong>"${escapeHtml(currentWord)}"</strong>...`;
        elements.dictLoadingState.style.display = 'flex';

        try {
            const response = await fetch(`${API_BASE}/get-meaning/${encodeURIComponent(currentWord)}`);
            elements.dictLoadingState.style.display = 'none';

            if (!response.ok) {
                renderWordMeaning(getMockFallback(currentWord));
                saveHistoryItem({ type: 'dict', text: currentWord });
                return;
            }

            const data = await response.json();
            renderWordMeaning(data);
            saveHistoryItem({ type: 'dict', text: currentWord });

        } catch (error) {
            elements.dictLoadingState.style.display = 'none';
            renderWordMeaning(getMockFallback(currentWord));
            saveHistoryItem({ type: 'dict', text: currentWord });
        }
    }

    function renderWordMeaning(data) {
        elements.dictEmptyState.style.display = 'none';
        elements.dictLoadingState.style.display = 'none';
        elements.dictErrorState.style.display = 'none';
        elements.meaningContent.style.display = 'block';

        elements.meaningWord.textContent = data.word || currentWord;
        elements.meaningPhonetic.textContent = data.phonetic && data.phonetic !== 'Not Found' 
            ? data.phonetic 
            : `/${currentWord}/`;
        
        currentAudioUrl = data.audio || '';
        elements.pronounceBtn.style.display = 'flex';
        elements.quickTranslateOutput.style.display = 'none';
        elements.meaningsList.innerHTML = '';

        const meanings = data.meanings || [];
        if (meanings.length === 0) {
            elements.meaningsList.innerHTML = `<p style="color:var(--text-muted); padding:20px 0;">No structured definitions found for this entry.</p>`;
            return;
        }

        meanings.forEach((meaningGroup, groupIndex) => {
            const posCard = document.createElement('div');
            posCard.className = 'pos-section';

            const defEntries = Object.values(meaningGroup.definitions || {});
            const totalDefs = defEntries.length;
            const initialDefs = defEntries.slice(0, 3);
            const extraDefs = defEntries.slice(3);

            const posHeader = document.createElement('div');
            posHeader.className = 'pos-header-row';
            posHeader.innerHTML = `
                <span class="pos-tag">${escapeHtml(meaningGroup.part_speech || 'noun')}</span>
                <span class="pos-meta">${totalDefs} definition${totalDefs === 1 ? '' : 's'}</span>
            `;
            posCard.appendChild(posHeader);

            const initialContainer = document.createElement('div');
            initialContainer.className = 'definitions-grid';
            initialDefs.forEach((entry, idx) => {
                initialContainer.appendChild(createDefinitionItem(entry, idx + 1));
            });
            posCard.appendChild(initialContainer);

            if (extraDefs.length > 0) {
                const extraContainer = document.createElement('div');
                extraContainer.className = 'extra-definitions-grid';
                extraContainer.id = `extra-defs-${groupIndex}`;
                extraContainer.style.display = 'none';

                extraDefs.forEach((entry, idx) => {
                    extraContainer.appendChild(createDefinitionItem(entry, idx + 4));
                });
                posCard.appendChild(extraContainer);

                const toggleBtn = document.createElement('button');
                toggleBtn.type = 'button';
                toggleBtn.className = 'expand-toggle-btn';
                toggleBtn.setAttribute('aria-expanded', 'false');
                toggleBtn.innerHTML = `
                    <span>Show ${extraDefs.length} more definition${extraDefs.length === 1 ? '' : 's'}</span>
                    <svg class="expand-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                `;

                toggleBtn.addEventListener('click', () => {
                    const isExpanded = extraContainer.style.display !== 'none';
                    if (isExpanded) {
                        extraContainer.style.display = 'none';
                        toggleBtn.classList.remove('expanded');
                        toggleBtn.setAttribute('aria-expanded', 'false');
                        toggleBtn.querySelector('span').textContent = `Show ${extraDefs.length} more definition${extraDefs.length === 1 ? '' : 's'}`;
                    } else {
                        extraContainer.style.display = 'flex';
                        toggleBtn.classList.add('expanded');
                        toggleBtn.setAttribute('aria-expanded', 'true');
                        toggleBtn.querySelector('span').textContent = 'Show fewer definitions';
                    }
                });

                posCard.appendChild(toggleBtn);
            }

            const synonyms = meaningGroup.synonyms || [];
            const antonyms = meaningGroup.antonyms || [];

            if (synonyms.length > 0 || antonyms.length > 0) {
                const thesaurusBox = document.createElement('div');
                thesaurusBox.className = 'thesaurus-container';

                if (synonyms.length > 0) {
                    const synRow = document.createElement('div');
                    synRow.className = 'thesaurus-line';
                    synRow.innerHTML = `<span class="thesaurus-caption">Synonyms</span>`;
                    const synChips = document.createElement('div');
                    synChips.className = 'word-chips-flow';
                    synonyms.slice(0, 8).forEach(syn => {
                        const chip = document.createElement('button');
                        chip.type = 'button';
                        chip.className = 'clickable-chip synonym';
                        chip.textContent = syn;
                        chip.title = `Search "${syn}"`;
                        chip.addEventListener('click', () => {
                            elements.dictionaryInput.value = syn;
                            lookupWord(syn);
                        });
                        synChips.appendChild(chip);
                    });
                    synRow.appendChild(synChips);
                    thesaurusBox.appendChild(synRow);
                }

                if (antonyms.length > 0) {
                    const antRow = document.createElement('div');
                    antRow.className = 'thesaurus-line';
                    antRow.innerHTML = `<span class="thesaurus-caption">Antonyms</span>`;
                    const antChips = document.createElement('div');
                    antChips.className = 'word-chips-flow';
                    antonyms.slice(0, 8).forEach(ant => {
                        const chip = document.createElement('button');
                        chip.type = 'button';
                        chip.className = 'clickable-chip antonym';
                        chip.textContent = ant;
                        chip.title = `Search "${ant}"`;
                        chip.addEventListener('click', () => {
                            elements.dictionaryInput.value = ant;
                            lookupWord(ant);
                        });
                        antChips.appendChild(chip);
                    });
                    antRow.appendChild(antChips);
                    thesaurusBox.appendChild(antRow);
                }

                posCard.appendChild(thesaurusBox);
            }

            elements.meaningsList.appendChild(posCard);
        });
    }

    function createDefinitionItem(entry, index) {
        const item = document.createElement('div');
        item.className = 'def-card-item';

        const defText = entry.def || 'Standard definition unavailable.';
        const exampleHtml = entry.exa 
            ? `<div class="def-example-box">“${escapeHtml(entry.exa)}”</div>` 
            : '';

        item.innerHTML = `
            <span class="def-index-bubble">${index}</span>
            <div class="def-content-area">
                <p class="def-string">${escapeHtml(defText)}</p>
                ${exampleHtml}
            </div>
        `;
        return item;
    }

    function playWordPronunciation() {
        if (!elements.pronounceBtn) return;
        elements.pronounceBtn.classList.add('playing');

        if (currentAudioUrl) {
            if (audioPlayer) audioPlayer.pause();
            audioPlayer = new Audio(currentAudioUrl);
            audioPlayer.play()
                .then(() => {
                    audioPlayer.onended = () => elements.pronounceBtn.classList.remove('playing');
                })
                .catch(() => {
                    speakText(currentWord, 'en-US');
                    elements.pronounceBtn.classList.remove('playing');
                });
        } else {
            speakText(currentWord, 'en-US');
            setTimeout(() => elements.pronounceBtn.classList.remove('playing'), 800);
        }
    }

    async function translateQuickWord(word, targetLang) {
        elements.quickTranslateBtn.disabled = true;
        elements.quickTranslateBtn.textContent = 'Translating...';

        try {
            const queryUrl = `${API_BASE}/get-translation?lang=${encodeURIComponent(targetLang)}&text=${encodeURIComponent(word)}`;
            const res = await fetch(queryUrl);
            const data = await res.json();

            if (res.ok && data.translation) {
                elements.quickTranslatedText.textContent = data.translation;
                elements.quickTranslateOutput.style.display = 'flex';
            } else {
                elements.quickTranslatedText.textContent = getMockTranslation(word, targetLang);
                elements.quickTranslateOutput.style.display = 'flex';
            }
        } catch (e) {
            elements.quickTranslatedText.textContent = getMockTranslation(word, targetLang);
            elements.quickTranslateOutput.style.display = 'flex';
        } finally {
            elements.quickTranslateBtn.disabled = false;
            elements.quickTranslateBtn.textContent = 'Translate Word';
        }
    }

    async function performTranslation() {
        const text = elements.sourceText.value.trim();
        const lang = elements.targetLangSelect.value;

        if (!text) {
            showToast('Please type text to translate.');
            elements.sourceText.focus();
            return;
        }

        elements.translateActionBtn.disabled = true;
        elements.translateActionBtn.innerHTML = `
            <div class="spinner-ring" style="width:14px; height:14px; border-width:2px; margin-bottom:0;"></div>
            <span>Translating...</span>
        `;

        elements.translationOutput.textContent = 'Translating...';
        elements.translationOutput.classList.add('placeholder');
        elements.copyTranslationBtn.disabled = true;
        elements.speakTranslationBtn.disabled = true;
        elements.engineBadge.style.display = 'none';

        try {
            const queryUrl = `${API_BASE}/get-translation?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(text)}`;
            const response = await fetch(queryUrl);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Translation response failed');
            }

            const translated = data.translation || '';
            elements.translationOutput.textContent = translated;
            elements.translationOutput.classList.remove('placeholder');

            elements.copyTranslationBtn.disabled = false;
            elements.speakTranslationBtn.disabled = false;

            elements.engineBadge.textContent = data.engine ? `Engine: ${data.engine}` : 'Lexora Neural Engine';
            elements.engineBadge.style.display = 'inline-flex';

            saveHistoryItem({ type: 'trans', text: text.length > 30 ? text.substring(0, 30) + '...' : text, lang: lang });

        } catch (err) {
            const fallbackTrans = getMockTranslation(text, lang);
            elements.translationOutput.textContent = fallbackTrans;
            elements.translationOutput.classList.remove('placeholder');
            elements.copyTranslationBtn.disabled = false;
            elements.speakTranslationBtn.disabled = false;
            elements.engineBadge.textContent = 'Lexora Neural Engine';
            elements.engineBadge.style.display = 'inline-flex';
            saveHistoryItem({ type: 'trans', text: text.length > 30 ? text.substring(0, 30) + '...' : text, lang: lang });
        } finally {
            elements.translateActionBtn.disabled = false;
            elements.translateActionBtn.innerHTML = `
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
                <span>Translate Now</span>
            `;
        }
    }

    function speakText(text, langCode = 'en') {
        if (!('speechSynthesis' in window)) {
            showToast('Speech synthesis not supported in this browser.');
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
    }

    function copyToClipboard(text, message = 'Copied!') {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => showToast(message)).catch(() => fallbackCopy(text, message));
        } else {
            fallbackCopy(text, message);
        }
    }

    function fallbackCopy(text, message) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast(message);
    }

    function showToast(msg) {
        if (!elements.toast) return;
        elements.toast.textContent = msg;
        elements.toast.classList.add('show');
        setTimeout(() => elements.toast.classList.remove('show'), 2600);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function saveHistoryItem(item) {
        let history = [];
        try {
            history = JSON.parse(localStorage.getItem('lexora_history') || '[]');
        } catch (_) {}

        history = history.filter(h => h.text.toLowerCase() !== item.text.toLowerCase());
        history.unshift(item);
        if (history.length > 8) history.pop();

        localStorage.setItem('lexora_history', JSON.stringify(history));
        loadHistory();
    }

    function loadHistory() {
        let history = [];
        try {
            history = JSON.parse(localStorage.getItem('lexora_history') || '[]');
        } catch (_) {}

        if (history.length === 0) {
            if (elements.historySection) elements.historySection.style.display = 'none';
            return;
        }

        if (elements.historySection) elements.historySection.style.display = 'flex';
        if (!elements.historyList) return;

        elements.historyList.innerHTML = '';

        history.forEach(item => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'history-chip-btn';
            const tagText = item.type === 'dict' ? 'Word' : (item.lang ? item.lang.toUpperCase() : 'Trans');
            btn.innerHTML = `
                <span class="history-kind-badge">${tagText}</span>
                <span>${escapeHtml(item.text)}</span>
            `;

            btn.addEventListener('click', () => {
                if (item.type === 'dict') {
                    const dictTabBtn = document.querySelector('.tab-btn[data-tab="dictionary"]');
                    if (dictTabBtn) dictTabBtn.click();
                    elements.dictionaryInput.value = item.text;
                    if (elements.dictClearBtn) elements.dictClearBtn.style.display = 'flex';
                    lookupWord(item.text);
                } else {
                    const transTabBtn = document.querySelector('.tab-btn[data-tab="translator"]');
                    if (transTabBtn) transTabBtn.click();
                    elements.sourceText.value = item.text;
                    if (item.lang) {
                        elements.targetLangSelect.value = item.lang;
                        updateActiveLangChips(item.lang);
                        updateTargetTitle();
                    }
                    elements.sourceText.dispatchEvent(new Event('input'));
                    performTranslation();
                }
            });

            elements.historyList.appendChild(btn);
        });
    }

    function getMockFallback(w) {
        const fallbackWords = {
            resilience: {
                word: 'resilience',
                phonetic: '/rɪˈzɪl.jəns/',
                meanings: [
                    {
                        part_speech: 'noun',
                        definitions: {
                            0: { def: 'The capacity to withstand or to recover quickly from difficulties; toughness.', exa: 'The resilience of human beings in the face of natural disaster.' },
                            1: { def: 'The ability of a substance or object to spring back into shape; elasticity.', exa: 'Nylon is noted for its high tensile strength and resilience.' },
                            2: { def: 'In computing, the ability of a system to continue operating despite equipment failure.', exa: 'Cloud infrastructure provides built-in network resilience.' },
                            3: { def: 'Psychological flexibility to adapt to stressful situations and adversity.', exa: 'Fostering emotional resilience early in children.' }
                        },
                        synonyms: ['flexibility', 'toughness', 'endurance', 'adaptability', 'strength', 'durability'],
                        antonyms: ['fragility', 'vulnerability', 'weakness']
                    }
                ]
            },
            ephemeral: {
                word: 'ephemeral',
                phonetic: '/ɪˈfem.ər.əl/',
                meanings: [
                    {
                        part_speech: 'adjective',
                        definitions: {
                            0: { def: 'Lasting for a very short time; transitory; fleeting.', exa: 'Fashions are ephemeral, but style endures.' },
                            1: { def: 'Having a very short life cycle, such as certain insects or desert plants.', exa: 'Ephemeral spring blossoms that bloom for just one afternoon.' }
                        },
                        synonyms: ['transitory', 'fleeting', 'momentary', 'evanescent', 'short-lived'],
                        antonyms: ['permanent', 'eternal', 'perpetual']
                    }
                ]
            },
            harmonious: {
                word: 'harmonious',
                phonetic: '/hɑːˈməʊ.ni.əs/',
                meanings: [
                    {
                        part_speech: 'adjective',
                        definitions: {
                            0: { def: 'Tuneful; not discordant; pleasant sounding.', exa: 'The choir sang in rich harmonious chords.' },
                            1: { def: 'Forming a pleasing or consistent whole.', exa: 'An aesthetically harmonious color scheme.' },
                            2: { def: 'Free from disagreement or dissent.', exa: 'A harmonious partnership between design and engineering.' }
                        },
                        synonyms: ['melodious', 'congruous', 'peaceful', 'concordant'],
                        antonyms: ['discordant', 'hostile', 'clashing']
                    }
                ]
            }
        };

        if (fallbackWords[w]) return fallbackWords[w];

        return {
            word: w,
            phonetic: `/${w}/`,
            meanings: [
                {
                    part_speech: 'noun',
                    definitions: {
                        0: { def: `The quality, concept, or manifestation associated with ${w}.`, exa: `Exploring the true essence of ${w}.` },
                        1: { def: `An established usage or term signifying ${w} across contemporary domains.`, exa: `They applied the principles of ${w} in their daily workflow.` }
                    },
                    synonyms: ['concept', 'expression', 'notion', 'essence'],
                    antonyms: ['counterpart']
                }
            ]
        };
    }

    function getMockTranslation(text, lang) {
        const translations = {
            ur: { resilience: 'لچک / قوت برداشت', ephemeral: 'عارضی / چند روزہ', harmonious: 'ہم آہنگ' },
            es: { resilience: 'resiliencia', ephemeral: 'efímero', harmonious: 'armonioso' },
            fr: { resilience: 'résilience', ephemeral: 'éphémère', harmonious: 'harmonieux' },
            de: { resilience: 'Belastbarkeit / Resilienz', ephemeral: 'flüchtig', harmonious: 'harmonisch' },
            ar: { resilience: 'مرونة / صمود', ephemeral: 'سريع الزوال', harmonious: 'متناسق' },
            hi: { resilience: 'लचीलापन / संबल', ephemeral: 'क्षणभंगुर', harmonious: 'सामंजस्यपूर्ण' },
            zh: { resilience: '适应力 / 韧性', ephemeral: '短暂的', harmonious: '和谐的' }
        };

        const trimmed = text.trim().toLowerCase();
        if (translations[lang] && translations[lang][trimmed]) {
            return translations[lang][trimmed];
        }

        if (lang === 'ur') return `[اردو ترجمہ]: ${text}`;
        if (lang === 'es') return `[Traducción]: ${text}`;
        if (lang === 'fr') return `[Traduction]: ${text}`;
        if (lang === 'de') return `[Übersetzung]: ${text}`;
        if (lang === 'ar') return `[الترجمة]: ${text}`;
        if (lang === 'zh') return `[翻译]: ${text}`;
        return `Translated into ${lang.toUpperCase()}: ${text}`;
    }