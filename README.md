# PID Regulator Beregner

En komplet offline hjemmeside til beregning af PID-regulator parametre (P, I og D) med multiple tuning-metoder, interaktive visualiseringer og omfattende forklaringer.

## Funktioner

### Beregningsmetoder

1. **Ziegler-Nichols Åben-sløjfe (Reaktionskurve)**
   - Analyserer systemets step response
   - Input: K (procesforstærkning), τ (tidskonstant), L (dødtid)
   - Understøtter P, PI og PID regulatorer

2. **Ziegler-Nichols Lukket-sløjfe (Relæmetode)**
   - Finder kritisk forstærkning og periode
   - Input: K<sub>u</sub> (kritisk forstærkning), T<sub>u</sub> (kritisk periode)
   - Understøtter P, PI og PID regulatorer

3. **Cohen-Coon Metode**
   - Forbedret version af Ziegler-Nichols åben-sløjfe
   - Bedre for systemer med høj dødtid-tidskonstant ratio
   - Input: K, τ, L

4. **Skogestads SIMC Metode**
   - Robust tuning baseret på intern modelkontrol
   - Input: K, τ, L, τ<sub>c</sub> (closed-loop time constant)
   - Understøtter PI og PID regulatorer

5. **Tyreus-Luyben Metode**
   - Konservativ tuning for bedre robusthed
   - Input: K<sub>u</sub>, T<sub>u</sub>
   - Understøtter PI og PID regulatorer

6. **Chien-Hrones-Reswick Metode**
   - Separate tuning-regler for setpoint tracking og load rejection
   - Input: K, τ, L
   - Understøtter PI og PID regulatorer med forskellige respons-typer

### Yderligere Funktioner

- **Interaktiv Tuning**: Realtids justering af PID-parametre med live visualisering
- **Visualiseringer**: Grafer viser systemrespons, fejl og kontrolsignal
- **Eksempler**: Forudindstillede scenarier (temperatur, niveau, flow, tryk)
- **LocalStorage**: Automatisk gemning af beregninger
- **Eksport/Import**: Eksporter beregninger som JSON
- **Dark/Light Mode**: Tema-skift med lokal gemning
- **Responsivt Design**: Fungerer på desktop, tablet og mobil
- **Offline Support**: Fungerer helt uden internetforbindelse
- **Detaljerede Forklaringer**: Klikbare info-ikoner med step-by-step guides til at finde parametre

## Brug

1. Åbn `index.html` i din webbrowser
2. Vælg en tuning-metode fra navigationen
3. Klik på info-ikonet (ℹ️) ved hvert input for at se hvordan man finder værdien
4. Indtast de nødvendige parametre
5. Klik på "Beregn PID-parametre"
6. Se resultaterne og brug dem til at indstille din regulator

## Teknisk

- **HTML5**: Semantic markup med accessibility features
- **CSS3**: Modern styling med CSS Grid/Flexbox, dark mode support
- **JavaScript**: Ren JavaScript, ingen eksterne dependencies
- **Canvas API**: Custom visualiseringer uden eksterne biblioteker
- **LocalStorage**: Data persistence i browseren
- **PWA Ready**: Manifest.json til installation som app

## Filstruktur

```
.
├── index.html          # Hovedside med alle sektioner
├── styles.css          # Styling og responsivt design
├── pid-calculator.js   # Alle beregningsmetoder
├── visualization.js    # Grafvisualiseringer
├── app.js              # Hovedapplikationslogik
├── manifest.json       # PWA manifest
└── README.md           # Denne fil
```

## Offline Brug

Hjemmesiden er designet til at fungere helt offline:

- Alle ressourcer er lokale filer
- Ingen eksterne dependencies
- Ingen internetforbindelse påkrævet
- Kan installeres som PWA (Progressive Web App)

## Browser Support

- Chrome/Edge (anbefalet)
- Firefox
- Safari
- Opera

## Licens

MIT License - Se LICENSE filen for detaljer.

## Noter

- Alle beregninger er baseret på standard tuning-metoder
- Resultaterne skal altid valideres i det faktiske system
- Forskellige processer kan kræve finjustering af parametrene
- Visualiseringerne er forenklede modeller til illustration
