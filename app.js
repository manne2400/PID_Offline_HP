/**
 * Hovedapplikationslogik
 * Håndterer navigation, tema, eksempler, localStorage osv.
 */

// Parameter forklaringer
const parameterInfo = {
    'K': {
        title: 'K - Procesforstærkning',
        description: 'Procesforstærkningen er forholdet mellem output-ændring og input-ændring ved steady-state.',
        howToFind: {
            title: 'Sådan finder du K:',
            steps: [
                'Påfør et trin-input (step input) til systemet i åben-sløjfe',
                'Vent til systemet når steady-state (ligevægt)',
                'Mål ændringen i output (Δy)',
                'Mål ændringen i input (Δu)',
                'Beregn: K = Δy / Δu',
                'Enhed: [output-enhed] / [input-enhed]'
            ],
            example: 'Eksempel: Hvis en 10% input-ændring giver en 25% output-ændring, så er K = 25/10 = 2.5'
        },
        typicalValues: 'Typiske værdier: 0.1 - 10 (afhænger af proces)'
    },
    'tau': {
        title: 'τ - Tidskonstant',
        description: 'Tidskonstanten er tiden det tager for systemet at nå 63.2% af den endelige værdi efter et trin-input.',
        howToFind: {
            title: 'Sådan finder du τ:',
            steps: [
                'Påfør et trin-input til systemet',
                'Mål systemets respons over tid',
                'Find tidspunktet hvor output når 63.2% af den endelige værdi',
                'Denne tid er tidskonstanten τ',
                'Alternativt: Find tidspunktet hvor tangenten til responskurven ved t=0 skærer steady-state værdien'
            ],
            example: 'Eksempel: Hvis systemet når 63.2% af den endelige værdi efter 30 sekunder, så er τ = 30s'
        },
        typicalValues: 'Typiske værdier: 1s - 300s (afhænger af proces)'
    },
    'L': {
        title: 'L - Dødtid',
        description: 'Dødtiden er tiden fra input-ændring til systemet begynder at reagere målbart.',
        howToFind: {
            title: 'Sådan finder du L:',
            steps: [
                'Påfør et trin-input til systemet',
                'Mål systemets respons over tid',
                'Find tidspunktet hvor output begynder at ændre sig fra startværdien',
                'Dette er dødtiden L',
                'Alternativt: Find skæringspunktet mellem tangenten til responskurven og startværdien'
            ],
            example: 'Eksempel: Hvis output først begynder at ændre sig 5 sekunder efter input-ændring, så er L = 5s'
        },
        typicalValues: 'Typiske værdier: 0.1s - 60s (afhænger af proces)'
    },
    'Ku': {
        title: 'K<sub>u</sub> - Kritisk forstærkning',
        description: 'Den kritiske forstærkning er den maksimale forstærkning hvor systemet oscillerer med konstant amplitude.',
        howToFind: {
            title: 'Sådan finder du K<sub>u</sub> (Ziegler-Nichols lukket-sløjfe metode):',
            steps: [
                'Indstil regulatoren til kun P-mode (sæt I og D til nul)',
                'Påfør et lille trin-input til setpoint',
                'Øg proportional forstærkning (Kp) gradvist',
                'Fortsæt indtil systemet oscillerer med konstant amplitude',
                'Den forstærkning hvor dette sker er K<sub>u</sub>',
                'Bemærk: Systemet skal oscillere stabilt, ikke eksplodere eller dæmpe ud'
            ],
            example: 'Eksempel: Hvis systemet begynder at oscillere stabilt ved Kp = 8.5, så er Ku = 8.5'
        },
        typicalValues: 'Typiske værdier: 1 - 100 (afhænger af proces)'
    },
    'Tu': {
        title: 'T<sub>u</sub> - Kritisk periode',
        description: 'Den kritiske periode er perioden for én fuld oscillationscyklus ved kritisk forstærkning.',
        howToFind: {
            title: 'Sådan finder du T<sub>u</sub>:',
            steps: [
                'Først find K<sub>u</sub> (se K<sub>u</sub> forklaring)',
                'Når systemet oscillerer ved K<sub>u</sub>, mål tiden for én fuld cyklus',
                'Mål fra toppunkt til toppunkt (eller bundpunkt til bundpunkt)',
                'Dette er den kritiske periode T<sub>u</sub>',
                'Alternativt: Mål tiden mellem to nul-punkter i oscillationen'
            ],
            example: 'Eksempel: Hvis oscillationen har en periode på 12 sekunder, så er Tu = 12s'
        },
        typicalValues: 'Typiske værdier: 2s - 120s (afhænger af proces)'
    },
    'tauc': {
        title: 'τ<sub>c</sub> - Closed-loop tidskonstant',
        description: 'Den ønskede closed-loop tidskonstant bestemmer hvor hurtigt det lukkede system skal reagere.',
        howToFind: {
            title: 'Sådan vælger du τ<sub>c</sub>:',
            steps: [
                'τ<sub>c</sub> er en designparameter - du vælger den baseret på dine krav',
                'Typisk værdi: τ<sub>c</sub> = L til 3L (hvor L er dødtiden)',
                'Lavere τ<sub>c</sub> = hurtigere respons, men mindre robust',
                'Højere τ<sub>c</sub> = langsommere respons, men mere robust',
                'Start med τ<sub>c</sub> = L og juster efter behov',
                'For hurtige processer: τ<sub>c</sub> = L',
                'For robuste systemer: τ<sub>c</sub> = 2L til 3L'
            ],
            example: 'Eksempel: Hvis L = 5s, kan du starte med τc = 5s og justere til 10-15s for mere robusthed'
        },
        typicalValues: 'Typiske værdier: L til 3L (hvor L er dødtiden)'
    }
};

// Info Modal funktionalitet
function initInfoModal() {
    const modal = document.getElementById('info-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.getElementById('modal-close');
    const infoIcons = document.querySelectorAll('.info-icon');
    
    function showModal(param, method) {
        const info = parameterInfo[param];
        if (!info) {
            console.warn(`Ingen info fundet for parameter: ${param}`);
            return;
        }
        
        modalTitle.innerHTML = info.title;
        
        let html = `<p><strong>Beskrivelse:</strong> ${info.description}</p>`;
        
        if (info.howToFind) {
            html += `<h4>${info.howToFind.title}</h4>`;
            html += '<ol>';
            info.howToFind.steps.forEach(step => {
                html += `<li>${step}</li>`;
            });
            html += '</ol>';
            
            if (info.howToFind.example) {
                html += `<p><strong>Eksempel:</strong> ${info.howToFind.example}</p>`;
            }
        }
        
        if (info.typicalValues) {
            html += `<p><strong>Typiske værdier:</strong> ${info.typicalValues}</p>`;
        }
        
        // Tilføj metode-specifikke tips
        if (method === 'zn-open') {
            html += `<h4>Tips for Ziegler-Nichols Åben-sløjfe:</h4>`;
            html += `<ul>`;
            html += `<li>Brug en trin-input på 5-10% af normal drift for at undgå at forstyrre processen</li>`;
            html += `<li>Vent til systemet når steady-state før du måler</li>`;
            html += `<li>Tag flere målinger for at sikre nøjagtighed</li>`;
            html += `</ul>`;
        } else if (method === 'zn-closed') {
            html += `<h4>Tips for Ziegler-Nichols Lukket-sløjfe:</h4>`;
            html += `<ul>`;
            html += `<li>Øg forstærkningen langsomt for at undgå skader på systemet</li>`;
            html += `<li>Brug en lille setpoint-ændring (2-5%)</li>`;
            html += `<li>Mål oscillationen nøjagtigt - den skal være konstant amplitude</li>`;
            html += `</ul>`;
        }
        
        modalBody.innerHTML = html;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Event listeners
    infoIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const param = icon.getAttribute('data-param');
            const method = icon.getAttribute('data-method');
            showModal(param, method);
        });
    });
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Luk modal når man klikker udenfor
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Luk modal med ESC-tast
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Navigation
function initNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const contentSections = document.querySelectorAll('.content-section');
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = tab.getAttribute('href').substring(1);
            
            // Opdater aktive tab
            navTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Vis korrekt sektion
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                    // Scroll til top
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    });
}

// Tema toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Sæt initial tema
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.textContent = '🌙';
    }
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        
        // Opdater visualisering hvis den eksisterer
        if (typeof visualizer !== 'undefined' && visualizer) {
            const Kp = parseFloat(document.getElementById('interactive-Kp').value);
            const Ki = parseFloat(document.getElementById('interactive-Ki').value);
            const Kd = parseFloat(document.getElementById('interactive-Kd').value);
            const setpoint = parseFloat(document.getElementById('interactive-setpoint').value);
            visualizer.update(Kp, Ki, Kd, setpoint);
        }
    });
}

// Input validering
function initInputValidation() {
    const numberInputs = document.querySelectorAll('input[type="number"]');
    
    numberInputs.forEach(input => {
        // Valider ved input
        input.addEventListener('input', () => {
            const value = parseFloat(input.value);
            const min = parseFloat(input.getAttribute('min'));
            const max = parseFloat(input.getAttribute('max'));
            
            if (isNaN(value) || value <= 0) {
                input.setCustomValidity('Værdien skal være et positivt tal');
                input.style.borderColor = 'var(--error)';
            } else if (max && value > max) {
                input.setCustomValidity(`Værdien skal være mindre end ${max}`);
                input.style.borderColor = 'var(--error)';
            } else if (value < min) {
                input.setCustomValidity(`Værdien skal være større end ${min}`);
                input.style.borderColor = 'var(--error)';
            } else {
                input.setCustomValidity('');
                input.style.borderColor = '';
            }
        });
        
        // Valider ved blur
        input.addEventListener('blur', () => {
            if (!input.checkValidity()) {
                input.reportValidity();
            }
        });
    });
}

// Eksempler
const examples = {
    temperature: {
        name: 'Temperaturkontrol',
        znOpen: { K: 2.5, tau: 30, L: 5 },
        znClosed: { Ku: 8.5, Tu: 12 },
        cohenCoon: { K: 2.5, tau: 30, L: 5 },
        simc: { K: 2.5, tau: 30, L: 5, tauc: 10 },
        tyreusLuyben: { Ku: 8.5, Tu: 12 },
        chr: { K: 2.5, tau: 30, L: 5 }
    },
    level: {
        name: 'Niveauregulering',
        znOpen: { K: 1.2, tau: 20, L: 3 },
        znClosed: { Ku: 5.0, Tu: 8 },
        cohenCoon: { K: 1.2, tau: 20, L: 3 },
        simc: { K: 1.2, tau: 20, L: 3, tauc: 6 },
        tyreusLuyben: { Ku: 5.0, Tu: 8 },
        chr: { K: 1.2, tau: 20, L: 3 }
    },
    flow: {
        name: 'Flowregulering',
        znOpen: { K: 0.8, tau: 5, L: 1 },
        znClosed: { Ku: 12.0, Tu: 4 },
        cohenCoon: { K: 0.8, tau: 5, L: 1 },
        simc: { K: 0.8, tau: 5, L: 1, tauc: 2 },
        tyreusLuyben: { Ku: 12.0, Tu: 4 },
        chr: { K: 0.8, tau: 5, L: 1 }
    },
    pressure: {
        name: 'Trykregulering',
        znOpen: { K: 1.5, tau: 15, L: 2 },
        znClosed: { Ku: 6.5, Tu: 6 },
        cohenCoon: { K: 1.5, tau: 15, L: 2 },
        simc: { K: 1.5, tau: 15, L: 2, tauc: 5 },
        tyreusLuyben: { Ku: 6.5, Tu: 6 },
        chr: { K: 1.5, tau: 15, L: 2 }
    }
};

function loadExample(exampleKey) {
    const example = examples[exampleKey];
    if (!example) return;
    
    // Find aktiv sektion
    const activeTab = document.querySelector('.nav-tab.active');
    if (!activeTab) return;
    
    const sectionId = activeTab.getAttribute('href').substring(1);
    
    // Indlæs værdier baseret på aktiv sektion
    switch(sectionId) {
        case 'zn-open':
            if (example.znOpen) {
                document.getElementById('zn-open-K').value = example.znOpen.K;
                document.getElementById('zn-open-tau').value = example.znOpen.tau;
                document.getElementById('zn-open-L').value = example.znOpen.L;
                // Trigger beregning
                document.getElementById('zn-open-form').dispatchEvent(new Event('submit', { cancelable: true }));
            }
            break;
        case 'zn-closed':
            if (example.znClosed) {
                document.getElementById('zn-closed-Ku').value = example.znClosed.Ku;
                document.getElementById('zn-closed-Tu').value = example.znClosed.Tu;
                document.getElementById('zn-closed-form').dispatchEvent(new Event('submit', { cancelable: true }));
            }
            break;
        case 'cohen-coon':
            if (example.cohenCoon) {
                document.getElementById('cc-K').value = example.cohenCoon.K;
                document.getElementById('cc-tau').value = example.cohenCoon.tau;
                document.getElementById('cc-L').value = example.cohenCoon.L;
                document.getElementById('cohen-coon-form').dispatchEvent(new Event('submit', { cancelable: true }));
            }
            break;
        case 'simc':
            if (example.simc) {
                document.getElementById('simc-K').value = example.simc.K;
                document.getElementById('simc-tau').value = example.simc.tau;
                document.getElementById('simc-L').value = example.simc.L;
                document.getElementById('simc-tauc').value = example.simc.tauc;
                document.getElementById('simc-form').dispatchEvent(new Event('submit', { cancelable: true }));
            }
            break;
        case 'tyreus-luyben':
            if (example.tyreusLuyben) {
                document.getElementById('tl-Ku').value = example.tyreusLuyben.Ku;
                document.getElementById('tl-Tu').value = example.tyreusLuyben.Tu;
                document.getElementById('tyreus-luyben-form').dispatchEvent(new Event('submit', { cancelable: true }));
            }
            break;
        case 'chr':
            if (example.chr) {
                document.getElementById('chr-K').value = example.chr.K;
                document.getElementById('chr-tau').value = example.chr.tau;
                document.getElementById('chr-L').value = example.chr.L;
                document.getElementById('chr-form').dispatchEvent(new Event('submit', { cancelable: true }));
            }
            break;
    }
    
    // Vis besked
    showNotification(`${example.name} eksempel indlæst!`);
}

function initExamples() {
    const exampleButtons = document.querySelectorAll('.btn-load-example');
    
    exampleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const exampleCard = button.closest('.example-card');
            const exampleKey = exampleCard.getAttribute('data-example');
            loadExample(exampleKey);
        });
    });
}

// LocalStorage funktionalitet
function saveCalculation(method, inputs, results) {
    const calculations = JSON.parse(localStorage.getItem('pidCalculations') || '[]');
    const calculation = {
        id: Date.now(),
        method: method,
        inputs: inputs,
        results: results,
        timestamp: new Date().toISOString()
    };
    
    calculations.push(calculation);
    // Behold kun de seneste 50 beregninger
    if (calculations.length > 50) {
        calculations.shift();
    }
    
    localStorage.setItem('pidCalculations', JSON.stringify(calculations));
}

function exportCalculations() {
    const calculations = JSON.parse(localStorage.getItem('pidCalculations') || '[]');
    
    if (calculations.length === 0) {
        showNotification('Ingen beregninger at eksportere', 'warning');
        return;
    }
    
    const dataStr = JSON.stringify(calculations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pid-calculations-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('Beregninger eksporteret!');
}

function clearData() {
    if (confirm('Er du sikker på at du vil slette alle gemte beregninger?')) {
        localStorage.removeItem('pidCalculations');
        showNotification('Data ryddet', 'success');
    }
}

function initStorageFunctions() {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportCalculations);
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearData);
    }
}

// Notification system
function showNotification(message, type = 'success') {
    // Fjern eksisterende notifikationer
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Styling
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: var(--bg-primary);
        border: 2px solid var(--border);
        border-radius: 8px;
        box-shadow: 0 4px 12px var(--shadow-lg);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    if (type === 'success') {
        notification.style.borderColor = 'var(--success)';
    } else if (type === 'warning') {
        notification.style.borderColor = 'var(--warning)';
    } else if (type === 'error') {
        notification.style.borderColor = 'var(--error)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Tilføj animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Gem beregninger automatisk
function initAutoSave() {
    // Lyt til alle form submits
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            // Vent lidt for at resultaterne kan blive beregnet
            setTimeout(() => {
                const formId = form.id;
                let method = '';
                let inputs = {};
                let results = {};
                
                // Identificer metode
                if (formId.includes('zn-open')) {
                    method = 'Ziegler-Nichols Åben-sløjfe';
                    inputs = {
                        K: parseFloat(document.getElementById('zn-open-K').value),
                        tau: parseFloat(document.getElementById('zn-open-tau').value),
                        L: parseFloat(document.getElementById('zn-open-L').value),
                        type: document.getElementById('zn-open-type').value
                    };
                    const resultsDiv = document.getElementById('zn-open-results');
                    if (!resultsDiv.classList.contains('hidden')) {
                        results = {
                            Kp: parseFloat(document.getElementById('zn-open-Kp').textContent),
                            Ti: parseFloat(document.getElementById('zn-open-Ti').textContent),
                            Td: parseFloat(document.getElementById('zn-open-Td').textContent),
                            Ki: parseFloat(document.getElementById('zn-open-Ki').textContent),
                            Kd: parseFloat(document.getElementById('zn-open-Kd').textContent)
                        };
                        saveCalculation(method, inputs, results);
                    }
                }
                // Tilføj lignende for andre metoder hvis nødvendigt
            }, 100);
        });
    });
}

// Initialiser alt når DOM er klar
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initThemeToggle();
    initInputValidation();
    initExamples();
    initStorageFunctions();
    initAutoSave();
    initInfoModal();
    
    // Vis første sektion som standard
    const firstTab = document.querySelector('.nav-tab');
    if (firstTab) {
        firstTab.click();
    }
});

