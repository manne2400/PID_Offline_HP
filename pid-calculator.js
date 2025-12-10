/**
 * PID Regulator Beregner
 * Implementerer alle tuning-metoder til beregning af PID-parametre
 */

// Utility funktioner
const formatNumber = (num, decimals = 4) => {
    if (num === null || num === undefined || isNaN(num) || !isFinite(num)) return '-';
    return Number(num.toFixed(decimals));
};

const displayResults = (results, prefix) => {
    // Null-checks for alle elementer
    const kpEl = document.getElementById(`${prefix}-Kp`);
    const tiEl = document.getElementById(`${prefix}-Ti`);
    const tdEl = document.getElementById(`${prefix}-Td`);
    const kiEl = document.getElementById(`${prefix}-Ki`);
    const kdEl = document.getElementById(`${prefix}-Kd`);
    const resultsDiv = document.getElementById(`${prefix}-results`);
    const formulaDiv = document.getElementById(`${prefix}-formula`);
    
    if (!kpEl || !resultsDiv) {
        console.warn(`Elementer ikke fundet for prefix: ${prefix}`);
        return;
    }
    
    if (kpEl) kpEl.textContent = formatNumber(results.Kp);
    if (tiEl) tiEl.textContent = results.Ti !== null ? formatNumber(results.Ti) : '-';
    if (tdEl) tdEl.textContent = results.Td !== null ? formatNumber(results.Td) : '-';
    if (kiEl) kiEl.textContent = results.Ki !== null ? formatNumber(results.Ki) : '-';
    if (kdEl) kdEl.textContent = results.Kd !== null ? formatNumber(results.Kd) : '-';
    
    resultsDiv.classList.remove('hidden');
    
    // Vis formel
    if (formulaDiv) {
        const parts = [`Kp = ${formatNumber(results.Kp)}`];
        if (results.Ti !== null) parts.push(`Ti = ${formatNumber(results.Ti)}s`);
        if (results.Td !== null) parts.push(`Td = ${formatNumber(results.Td)}s`);
        if (results.Ki !== null) parts.push(`Ki = ${formatNumber(results.Ki)}`);
        if (results.Kd !== null) parts.push(`Kd = ${formatNumber(results.Kd)}`);
        formulaDiv.textContent = parts.join(', ');
    }
};

// Ziegler-Nichols Åben-sløjfe Metode
const calculateZNOpen = (K, tau, L, type) => {
    const results = {};
    
    switch(type) {
        case 'P':
            results.Kp = tau / (K * L);
            results.Ti = null;
            results.Td = null;
            break;
        case 'PI':
            results.Kp = 0.9 * tau / (K * L);
            results.Ti = 3.33 * L;
            results.Td = null;
            break;
        case 'PID':
            results.Kp = 1.2 * tau / (K * L);
            results.Ti = 2 * L;
            results.Td = 0.5 * L;
            break;
    }
    
    // Beregn Ki og Kd
    if (results.Ti) {
        results.Ki = results.Kp / results.Ti;
    } else {
        results.Ki = null;
    }
    
    if (results.Td) {
        results.Kd = results.Kp * results.Td;
    } else {
        results.Kd = null;
    }
    
    return results;
};

// Ziegler-Nichols Lukket-sløjfe Metode
const calculateZNClosed = (Ku, Tu, type) => {
    const results = {};
    
    switch(type) {
        case 'P':
            results.Kp = 0.5 * Ku;
            results.Ti = null;
            results.Td = null;
            break;
        case 'PI':
            results.Kp = 0.45 * Ku;
            results.Ti = 0.83 * Tu;
            results.Td = null;
            break;
        case 'PID':
            results.Kp = 0.6 * Ku;
            results.Ti = 0.5 * Tu;
            results.Td = 0.125 * Tu;
            break;
    }
    
    // Beregn Ki og Kd
    if (results.Ti) {
        results.Ki = results.Kp / results.Ti;
    } else {
        results.Ki = null;
    }
    
    if (results.Td) {
        results.Kd = results.Kp * results.Td;
    } else {
        results.Kd = null;
    }
    
    return results;
};

// Cohen-Coon Metode
const calculateCohenCoon = (K, tau, L, type) => {
    const results = {};
    const ratio = L / tau;
    
    switch(type) {
        case 'P':
            results.Kp = (tau / (K * L)) * (1 + ratio / 3);
            results.Ti = null;
            results.Td = null;
            break;
        case 'PI':
            results.Kp = (tau / (K * L)) * (0.9 + ratio / 12);
            results.Ti = L * (30 + 3 * ratio) / (9 + 20 * ratio);
            results.Td = null;
            break;
        case 'PID':
            results.Kp = (tau / (K * L)) * (4/3 + ratio / 4);
            results.Ti = L * (32 + 6 * ratio) / (13 + 8 * ratio);
            results.Td = L * 4 / (11 + 2 * ratio);
            break;
    }
    
    // Beregn Ki og Kd
    if (results.Ti) {
        results.Ki = results.Kp / results.Ti;
    } else {
        results.Ki = null;
    }
    
    if (results.Td) {
        results.Kd = results.Kp * results.Td;
    } else {
        results.Kd = null;
    }
    
    return results;
};

// SIMC (Skogestad) Metode
const calculateSIMC = (K, tau, L, tauc, type) => {
    const results = {};
    
    if (type === 'PI') {
        // PI controller
        results.Kp = (tau / K) / (tauc + L);
        results.Ti = Math.min(tau, 4 * (tauc + L));
        results.Td = null;
    } else if (type === 'PID') {
        // PID controller
        results.Kp = (tau / K) / (tauc + L);
        results.Ti = Math.min(tau, 4 * (tauc + L));
        results.Td = tau;
    }
    
    // Beregn Ki og Kd
    if (results.Ti) {
        results.Ki = results.Kp / results.Ti;
    } else {
        results.Ki = null;
    }
    
    if (results.Td) {
        results.Kd = results.Kp * results.Td;
    } else {
        results.Kd = null;
    }
    
    return results;
};

// Tyreus-Luyben Metode
const calculateTyreusLuyben = (Ku, Tu, type) => {
    const results = {};
    
    if (type === 'PI') {
        results.Kp = 0.45 * Ku;
        results.Ti = Tu / 1.2;
        results.Td = null;
    } else if (type === 'PID') {
        results.Kp = 0.6 * Ku;
        results.Ti = Tu / 2;
        results.Td = Tu / 6.25;
    }
    
    // Beregn Ki og Kd
    if (results.Ti) {
        results.Ki = results.Kp / results.Ti;
    } else {
        results.Ki = null;
    }
    
    if (results.Td) {
        results.Kd = results.Kp * results.Td;
    } else {
        results.Kd = null;
    }
    
    return results;
};

// Chien-Hrones-Reswick Metode
const calculateCHR = (K, tau, L, type, responseType) => {
    const results = {};
    const ratio = L / tau;
    
    if (type === 'PI') {
        if (responseType === 'setpoint') {
            // 0% overshoot setpoint tracking
            results.Kp = 0.6 * tau / (K * L);
            results.Ti = tau;
            results.Td = null;
        } else if (responseType === 'setpoint-20') {
            // 20% overshoot setpoint tracking
            results.Kp = 0.7 * tau / (K * L);
            results.Ti = 2.3 * L;
            results.Td = null;
        } else if (responseType === 'load') {
            // 0% overshoot load rejection
            results.Kp = 0.35 * tau / (K * L);
            results.Ti = 1.2 * tau;
            results.Td = null;
        } else if (responseType === 'load-20') {
            // 20% overshoot load rejection
            results.Kp = 0.6 * tau / (K * L);
            results.Ti = tau;
            results.Td = null;
        }
    } else if (type === 'PID') {
        if (responseType === 'setpoint') {
            // 0% overshoot setpoint tracking
            results.Kp = 0.95 * tau / (K * L);
            results.Ti = 1.4 * tau;
            results.Td = 0.47 * tau;
        } else if (responseType === 'setpoint-20') {
            // 20% overshoot setpoint tracking
            results.Kp = 1.2 * tau / (K * L);
            results.Ti = 2 * L;
            results.Td = 0.42 * L;
        } else if (responseType === 'load') {
            // 0% overshoot load rejection
            results.Kp = 0.6 * tau / (K * L);
            results.Ti = tau;
            results.Td = 0.5 * tau;
        } else if (responseType === 'load-20') {
            // 20% overshoot load rejection
            results.Kp = 0.95 * tau / (K * L);
            results.Ti = 1.4 * tau;
            results.Td = 0.47 * tau;
        }
    }
    
    // Beregn Ki og Kd
    if (results.Ti) {
        results.Ki = results.Kp / results.Ti;
    } else {
        results.Ki = null;
    }
    
    if (results.Td) {
        results.Kd = results.Kp * results.Td;
    } else {
        results.Kd = null;
    }
    
    return results;
};

// Event listeners for alle formularer
document.addEventListener('DOMContentLoaded', () => {
    // Ziegler-Nichols Åben-sløjfe
    const znOpenForm = document.getElementById('zn-open-form');
    if (znOpenForm) {
        znOpenForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const KInput = document.getElementById('zn-open-K');
            const tauInput = document.getElementById('zn-open-tau');
            const LInput = document.getElementById('zn-open-L');
            const typeInput = document.getElementById('zn-open-type');
            
            if (!KInput || !tauInput || !LInput || !typeInput) {
                console.error('Manglende input elementer for ZN Open');
                return;
            }
            
            const K = parseFloat(KInput.value);
            const tau = parseFloat(tauInput.value);
            const L = parseFloat(LInput.value);
            const type = typeInput.value;
            
            if (K > 0 && tau > 0 && L > 0 && !isNaN(K) && !isNaN(tau) && !isNaN(L)) {
                const results = calculateZNOpen(K, tau, L, type);
                displayResults(results, 'zn-open');
            }
        });
    }
    
    // Ziegler-Nichols Lukket-sløjfe
    const znClosedForm = document.getElementById('zn-closed-form');
    if (znClosedForm) {
        znClosedForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const KuInput = document.getElementById('zn-closed-Ku');
            const TuInput = document.getElementById('zn-closed-Tu');
            const typeInput = document.getElementById('zn-closed-type');
            
            if (!KuInput || !TuInput || !typeInput) {
                console.error('Manglende input elementer for ZN Closed');
                return;
            }
            
            const Ku = parseFloat(KuInput.value);
            const Tu = parseFloat(TuInput.value);
            const type = typeInput.value;
            
            if (Ku > 0 && Tu > 0 && !isNaN(Ku) && !isNaN(Tu)) {
                const results = calculateZNClosed(Ku, Tu, type);
                displayResults(results, 'zn-closed');
            }
        });
    }
    
    // Cohen-Coon
    const ccForm = document.getElementById('cohen-coon-form');
    if (ccForm) {
        ccForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const KInput = document.getElementById('cc-K');
            const tauInput = document.getElementById('cc-tau');
            const LInput = document.getElementById('cc-L');
            const typeInput = document.getElementById('cc-type');
            
            if (!KInput || !tauInput || !LInput || !typeInput) {
                console.error('Manglende input elementer for Cohen-Coon');
                return;
            }
            
            const K = parseFloat(KInput.value);
            const tau = parseFloat(tauInput.value);
            const L = parseFloat(LInput.value);
            const type = typeInput.value;
            
            if (K > 0 && tau > 0 && L > 0 && !isNaN(K) && !isNaN(tau) && !isNaN(L)) {
                const results = calculateCohenCoon(K, tau, L, type);
                displayResults(results, 'cohen-coon');
            }
        });
    }
    
    // SIMC
    const simcForm = document.getElementById('simc-form');
    if (simcForm) {
        simcForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const KInput = document.getElementById('simc-K');
            const tauInput = document.getElementById('simc-tau');
            const LInput = document.getElementById('simc-L');
            const taucInput = document.getElementById('simc-tauc');
            const typeInput = document.getElementById('simc-type');
            
            if (!KInput || !tauInput || !LInput || !taucInput || !typeInput) {
                console.error('Manglende input elementer for SIMC');
                return;
            }
            
            const K = parseFloat(KInput.value);
            const tau = parseFloat(tauInput.value);
            const L = parseFloat(LInput.value);
            const tauc = parseFloat(taucInput.value);
            const type = typeInput.value;
            
            if (K > 0 && tau > 0 && L > 0 && tauc > 0 && !isNaN(K) && !isNaN(tau) && !isNaN(L) && !isNaN(tauc)) {
                const results = calculateSIMC(K, tau, L, tauc, type);
                displayResults(results, 'simc');
            }
        });
    }
    
    // Tyreus-Luyben
    const tlForm = document.getElementById('tyreus-luyben-form');
    if (tlForm) {
        tlForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const KuInput = document.getElementById('tl-Ku');
            const TuInput = document.getElementById('tl-Tu');
            const typeInput = document.getElementById('tl-type');
            
            if (!KuInput || !TuInput || !typeInput) {
                console.error('Manglende input elementer for Tyreus-Luyben');
                return;
            }
            
            const Ku = parseFloat(KuInput.value);
            const Tu = parseFloat(TuInput.value);
            const type = typeInput.value;
            
            if (Ku > 0 && Tu > 0 && !isNaN(Ku) && !isNaN(Tu)) {
                const results = calculateTyreusLuyben(Ku, Tu, type);
                displayResults(results, 'tyreus-luyben');
            }
        });
    }
    
    // Chien-Hrones-Reswick
    const chrForm = document.getElementById('chr-form');
    if (chrForm) {
        chrForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const KInput = document.getElementById('chr-K');
            const tauInput = document.getElementById('chr-tau');
            const LInput = document.getElementById('chr-L');
            const typeInput = document.getElementById('chr-type');
            const responseTypeInput = document.getElementById('chr-response');
            
            if (!KInput || !tauInput || !LInput || !typeInput || !responseTypeInput) {
                console.error('Manglende input elementer for Chien-Hrones-Reswick');
                return;
            }
            
            const K = parseFloat(KInput.value);
            const tau = parseFloat(tauInput.value);
            const L = parseFloat(LInput.value);
            const type = typeInput.value;
            const responseType = responseTypeInput.value;
            
            if (K > 0 && tau > 0 && L > 0 && !isNaN(K) && !isNaN(tau) && !isNaN(L)) {
                const results = calculateCHR(K, tau, L, type, responseType);
                displayResults(results, 'chr');
            }
        });
    }
});

// Export funktioner for brug i andre scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateZNOpen,
        calculateZNClosed,
        calculateCohenCoon,
        calculateSIMC,
        calculateTyreusLuyben,
        calculateCHR,
        formatNumber
    };
}

