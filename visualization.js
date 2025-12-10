/**
 * Visualisering af PID systemrespons
 * Bruger Canvas API til at tegne grafer
 */

class PIDVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.padding = { top: 40, right: 40, bottom: 60, left: 60 };
        
        this.plotWidth = this.width - this.padding.left - this.padding.right;
        this.plotHeight = this.height - this.padding.top - this.padding.bottom;
        
        this.data = {
            time: [],
            output: [],
            setpoint: [],
            error: [],
            control: []
        };
        
        this.params = {
            Kp: 1.0,
            Ki: 0.5,
            Kd: 0.1,
            setpoint: 1.0,
            dt: 0.01,
            simulationTime: 10
        };
        
        this.setupCanvas();
    }
    
    setupCanvas() {
        // Håndter høj DPI displays
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.width = rect.width;
        this.height = rect.height;
        this.plotWidth = this.width - this.padding.left - this.padding.right;
        this.plotHeight = this.height - this.padding.top - this.padding.bottom;
        
        // Sæt canvas CSS størrelse
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    // Simuler PID system
    simulate(Kp, Ki, Kd, setpoint) {
        this.params.Kp = Kp;
        this.params.Ki = Ki;
        this.params.Kd = Kd;
        this.params.setpoint = setpoint;
        
        // Reset data
        this.data = {
            time: [],
            output: [],
            setpoint: [],
            error: [],
            control: []
        };
        
        // System parametre (førsteordens proces med dødtid)
        const K = 1.0;  // Procesforstærkning
        const tau = 1.0;  // Tidskonstant
        const L = 0.5;  // Dødtid
        
        // Initial værdier
        let y = 0;  // Output
        let y_prev = 0;
        let error_prev = 0;
        let integral = 0;
        let derivative = 0;
        
        const dt = this.params.dt;
        const timeSteps = Math.floor(this.params.simulationTime / dt);
        const delaySteps = Math.floor(L / dt);
        const delayBuffer = new Array(delaySteps).fill(0);
        
        for (let i = 0; i < timeSteps; i++) {
            const t = i * dt;
            
            // Beregn fejl
            const error = setpoint - y;
            
            // PID beregning
            integral += error * dt;
            derivative = (error - error_prev) / dt;
            
            const u = Kp * error + Ki * integral + Kd * derivative;
            
            // Begræns kontrolsignal
            const u_limited = Math.max(-10, Math.min(10, u));
            
            // Procesmodel (førsteordens)
            const u_delayed = delayBuffer.shift() || 0;
            delayBuffer.push(u_limited);
            
            // Simpel førsteordens proces
            const dy = (K * u_delayed - y) / tau;
            y = y + dy * dt;
            
            // Gem data
            this.data.time.push(t);
            this.data.output.push(y);
            this.data.setpoint.push(setpoint);
            this.data.error.push(error);
            this.data.control.push(u_limited);
            
            y_prev = y;
            error_prev = error;
        }
        
        this.draw();
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary') || '#ffffff';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Find værdiområder
        const timeRange = {
            min: Math.min(...this.data.time),
            max: Math.max(...this.data.time)
        };
        
        const outputRange = {
            min: Math.min(0, ...this.data.output, ...this.data.setpoint),
            max: Math.max(1.5, ...this.data.output, ...this.data.setpoint)
        };
        
        const errorRange = {
            min: Math.min(...this.data.error),
            max: Math.max(...this.data.error)
        };
        
        // Tegn akser
        this.drawAxes(timeRange, outputRange, errorRange);
        
        // Tegn grafer
        this.drawGraph(this.data.time, this.data.output, '#2563eb', 'Output');
        this.drawGraph(this.data.time, this.data.setpoint, '#10b981', 'Setpoint', true);
        
        // Tegn fejl i nederste del
        this.drawErrorGraph(this.data.time, this.data.error, errorRange);
        
        // Tegn kontrolsignal
        this.drawControlGraph(this.data.time, this.data.control);
    }
    
    drawAxes(timeRange, outputRange, errorRange) {
        const ctx = this.ctx;
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary') || '#212529';
        const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border') || '#dee2e6';
        
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.fillStyle = textColor;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Y-akse (Output)
        const yAxisY = this.padding.top + this.plotHeight / 2;
        ctx.beginPath();
        ctx.moveTo(this.padding.left, this.padding.top);
        ctx.lineTo(this.padding.left, this.padding.top + this.plotHeight);
        ctx.stroke();
        
        // X-akse (Tid)
        ctx.beginPath();
        ctx.moveTo(this.padding.left, yAxisY);
        ctx.lineTo(this.padding.left + this.plotWidth, yAxisY);
        ctx.stroke();
        
        // Grid lines
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([5, 5]);
        
        // Y grid
        for (let i = 0; i <= 5; i++) {
            const y = this.padding.top + (this.plotHeight / 2) * (i / 5);
            ctx.beginPath();
            ctx.moveTo(this.padding.left, y);
            ctx.lineTo(this.padding.left + this.plotWidth, y);
            ctx.stroke();
        }
        
        // X grid
        for (let i = 0; i <= 10; i++) {
            const x = this.padding.left + (this.plotWidth * i / 10);
            ctx.beginPath();
            ctx.moveTo(x, this.padding.top);
            ctx.lineTo(x, this.padding.top + this.plotHeight);
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
        
        // Labels
        ctx.fillStyle = textColor;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Tid (s)', this.padding.left + this.plotWidth / 2, this.height - 20);
        
        ctx.save();
        ctx.translate(20, this.padding.top + this.plotHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Output / Setpoint', 0, 0);
        ctx.restore();
        
        // Y-akse labels
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const value = outputRange.min + (outputRange.max - outputRange.min) * (1 - i / 5);
            const y = this.padding.top + (this.plotHeight / 2) * (i / 5);
            ctx.fillText(value.toFixed(1), this.padding.left - 10, y);
        }
        
        // X-akse labels
        ctx.textAlign = 'center';
        for (let i = 0; i <= 10; i++) {
            const value = timeRange.min + (timeRange.max - timeRange.min) * (i / 10);
            const x = this.padding.left + (this.plotWidth * i / 10);
            ctx.fillText(value.toFixed(1), x, yAxisY + 20);
        }
    }
    
    drawGraph(time, values, color, label, dashed = false) {
        const ctx = this.ctx;
        const timeRange = { min: Math.min(...time), max: Math.max(...time) };
        const valueRange = {
            min: Math.min(0, ...values),
            max: Math.max(1.5, ...values)
        };
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        if (dashed) {
            ctx.setLineDash([5, 5]);
        } else {
            ctx.setLineDash([]);
        }
        
        ctx.beginPath();
        for (let i = 0; i < time.length; i++) {
            const x = this.padding.left + ((time[i] - timeRange.min) / (timeRange.max - timeRange.min)) * this.plotWidth;
            const y = this.padding.top + this.plotHeight / 2 - ((values[i] - valueRange.min) / (valueRange.max - valueRange.min)) * (this.plotHeight / 2);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    drawErrorGraph(time, errors, errorRange) {
        const ctx = this.ctx;
        const timeRange = { min: Math.min(...time), max: Math.max(...time) };
        const errorHeight = this.plotHeight / 4;
        const errorY = this.padding.top + this.plotHeight * 0.75;
        
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        for (let i = 0; i < time.length; i++) {
            const x = this.padding.left + ((time[i] - timeRange.min) / (timeRange.max - timeRange.min)) * this.plotWidth;
            const normalizedError = (errors[i] - errorRange.min) / (errorRange.max - errorRange.min);
            const y = errorY - normalizedError * errorHeight;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        // Zero line
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border') || '#dee2e6';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(this.padding.left, errorY);
        ctx.lineTo(this.padding.left + this.plotWidth, errorY);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    drawControlGraph(time, control) {
        const ctx = this.ctx;
        const timeRange = { min: Math.min(...time), max: Math.max(...time) };
        const controlRange = { min: -10, max: 10 };
        const controlHeight = this.plotHeight / 4;
        const controlY = this.padding.top + this.plotHeight * 0.25;
        
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        for (let i = 0; i < time.length; i++) {
            const x = this.padding.left + ((time[i] - timeRange.min) / (timeRange.max - timeRange.min)) * this.plotWidth;
            const normalizedControl = (control[i] - controlRange.min) / (controlRange.max - controlRange.min);
            const y = controlY - normalizedControl * controlHeight;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }
    
    update(Kp, Ki, Kd, setpoint) {
        this.simulate(Kp, Ki, Kd, setpoint);
    }
}

// Initialiser visualizer når DOM er klar
let visualizer = null;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('response-chart');
    if (canvas) {
        visualizer = new PIDVisualizer('response-chart');
        
        // Initial simulering
        visualizer.simulate(1.0, 0.5, 0.1, 1.0);
        
        // Opdater når sliders ændres
        const sliders = ['interactive-Kp', 'interactive-Ki', 'interactive-Kd', 'interactive-setpoint'];
        sliders.forEach(id => {
            const slider = document.getElementById(id);
            if (slider) {
                slider.addEventListener('input', () => {
                    const Kp = parseFloat(document.getElementById('interactive-Kp').value);
                    const Ki = parseFloat(document.getElementById('interactive-Ki').value);
                    const Kd = parseFloat(document.getElementById('interactive-Kd').value);
                    const setpoint = parseFloat(document.getElementById('interactive-setpoint').value);
                    
                    // Opdater værdi display
                    document.getElementById('interactive-Kp-value').textContent = Kp.toFixed(2);
                    document.getElementById('interactive-Ki-value').textContent = Ki.toFixed(2);
                    document.getElementById('interactive-Kd-value').textContent = Kd.toFixed(2);
                    document.getElementById('interactive-setpoint-value').textContent = setpoint.toFixed(2);
                    
                    // Opdater graf
                    if (visualizer) {
                        visualizer.update(Kp, Ki, Kd, setpoint);
                    }
                });
            }
        });
    }
    
    // Håndter window resize
    window.addEventListener('resize', () => {
        if (visualizer) {
            visualizer.setupCanvas();
            const Kp = parseFloat(document.getElementById('interactive-Kp').value);
            const Ki = parseFloat(document.getElementById('interactive-Ki').value);
            const Kd = parseFloat(document.getElementById('interactive-Kd').value);
            const setpoint = parseFloat(document.getElementById('interactive-setpoint').value);
            visualizer.update(Kp, Ki, Kd, setpoint);
        }
    });
});

// Export for brug i andre scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PIDVisualizer;
}

