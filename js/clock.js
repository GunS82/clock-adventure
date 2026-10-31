class Clock {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.getElementById(container) : container;
    this.size = options.size || 300;
    this.interactive = options.interactive !== false; // default true if not specified, but let's default to false for read mode and true for set mode later. We will manage this dynamically.
    this.onChange = options.onChange || function() {};
    
    this.hours = options.hours || 0;
    this.minutes = options.minutes || 0;
    
    this.isDraggingHour = false;
    this.isDraggingMinute = false;

    this.render();
    this.updateHands();
  }

  render() {
    this.container.innerHTML = '';
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", this.size);
    this.svg.setAttribute("height", this.size);
    this.svg.setAttribute("viewBox", "0 0 100 100");
    this.svg.style.userSelect = "none";
    this.svg.style.touchAction = "none"; // Prevent scrolling when dragging

    const cx = 50;
    const cy = 50;
    const r = 45;

    // Clock face
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", cy);
    circle.setAttribute("r", r);
    circle.setAttribute("fill", "#fff");
    circle.setAttribute("stroke", "#3b82f6");
    circle.setAttribute("stroke-width", "4");
    this.svg.appendChild(circle);

    // Ticks and numbers
    for (let i = 0; i < 60; i++) {
      const angle = (i * 6 - 90) * (Math.PI / 180);
      const isHour = i % 5 === 0;
      const innerR = isHour ? 38 : 42;
      const x1 = cx + innerR * Math.cos(angle);
      const y1 = cy + innerR * Math.sin(angle);
      const x2 = cx + 45 * Math.cos(angle);
      const y2 = cy + 45 * Math.sin(angle);
      
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      line.setAttribute("stroke", isHour ? "#1e40af" : "#93c5fd");
      line.setAttribute("stroke-width", isHour ? "2" : "1");
      this.svg.appendChild(line);

      if (isHour) {
        const num = i === 0 ? 12 : i / 5;
        const numR = 32;
        const nx = cx + numR * Math.cos(angle);
        const ny = cy + numR * Math.sin(angle);
        
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", nx);
        text.setAttribute("y", ny);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "central");
        text.setAttribute("font-size", "8");
        text.setAttribute("font-family", "sans-serif");
        text.setAttribute("font-weight", "bold");
        text.setAttribute("fill", "#1e3a8a");
        text.textContent = num;
        this.svg.appendChild(text);
      }
    }

    // Hands
    this.hourHand = document.createElementNS("http://www.w3.org/2000/svg", "line");
    this.hourHand.setAttribute("x1", cx);
    this.hourHand.setAttribute("y1", cy);
    this.hourHand.setAttribute("x2", cx);
    this.hourHand.setAttribute("y2", cy - 22);
    this.hourHand.setAttribute("stroke", "#ef4444");
    this.hourHand.setAttribute("stroke-width", "4");
    this.hourHand.setAttribute("stroke-linecap", "round");
    this.hourHand.style.cursor = "pointer";
    this.svg.appendChild(this.hourHand);

    this.minuteHand = document.createElementNS("http://www.w3.org/2000/svg", "line");
    this.minuteHand.setAttribute("x1", cx);
    this.minuteHand.setAttribute("y1", cy);
    this.minuteHand.setAttribute("x2", cx);
    this.minuteHand.setAttribute("y2", cy - 35);
    this.minuteHand.setAttribute("stroke", "#22c55e");
    this.minuteHand.setAttribute("stroke-width", "3");
    this.minuteHand.setAttribute("stroke-linecap", "round");
    this.minuteHand.style.cursor = "pointer";
    this.svg.appendChild(this.minuteHand);

    // Center dot
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", cx);
    dot.setAttribute("cy", cy);
    dot.setAttribute("r", "4");
    dot.setAttribute("fill", "#3b82f6");
    this.svg.appendChild(dot);

    this.container.appendChild(this.svg);

    // Event listeners
    this.bindEvents();
  }

  setInteractive(interactive) {
    this.interactive = interactive;
  }

  bindEvents() {
    const startDragHour = (e) => { if (this.interactive) { this.isDraggingHour = true; e.preventDefault(); }};
    const startDragMinute = (e) => { if (this.interactive) { this.isDraggingMinute = true; e.preventDefault(); }};
    
    this.hourHand.addEventListener("mousedown", startDragHour);
    this.minuteHand.addEventListener("mousedown", startDragMinute);
    this.hourHand.addEventListener("touchstart", startDragHour, {passive: false});
    this.minuteHand.addEventListener("touchstart", startDragMinute, {passive: false});

    const stopDrag = () => {
      if (this.isDraggingHour || this.isDraggingMinute) {
        this.isDraggingHour = false;
        this.isDraggingMinute = false;
        this.onChange(this.getTime());
      }
    };

    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchend", stopDrag);

    const onDrag = (e) => {
      if (!this.isDraggingHour && !this.isDraggingMinute) return;
      e.preventDefault();
      
      let clientX, clientY;
      if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const rect = this.svg.getBoundingClientRect();
      const x = clientX - rect.left - rect.width / 2;
      const y = clientY - rect.top - rect.height / 2;

      let angle = Math.atan2(y, x) * 180 / Math.PI + 90;
      if (angle < 0) angle += 360;

      if (this.isDraggingHour) {
        // Snap to nearest 30 degrees (1 hour) roughly, or just let it be continuous.
        // For learning, it might be better to let minute hand drive hour hand, but dragging hour hand directly is also fine.
        // Let's snap to closest hour for simplicity when dragging hour.
        let h = Math.round(angle / 30);
        if (h === 12) h = 0;
        this.hours = h;
      } else if (this.isDraggingMinute) {
        // Snap to nearest minute (6 degrees) or 5 minutes.
        // Let's snap to 5 minutes to make it easier for kids if we want, or exact minute.
        // Exact minute:
        let m = Math.round(angle / 6);
        if (m === 60) m = 0;
        this.minutes = m;
        // Optionally update hour hand based on minute hand if we want a realistic clock
        // this.hours = Math.floor(this.hours) + (this.minutes / 60); 
        // But for kids setting time, independent hands might be easier or realistic might be better.
        // Let's stick to independent setting for game logic simplicity, we'll validate modulo 12 for hours.
      }
      this.updateHands();
      this.onChange(this.getTime());
    };

    window.addEventListener("mousemove", onDrag);
    window.addEventListener("touchmove", onDrag, {passive: false});
  }

  setTime(h, m) {
    this.hours = h;
    this.minutes = m;
    this.updateHands();
  }

  getTime() {
    // Normalize hours to 0-11
    return {
      hours: parseInt(this.hours) % 12,
      minutes: parseInt(this.minutes)
    };
  }

  updateHands() {
    // We add minute offset to hour hand for realistic display
    const hourAngle = (this.hours % 12) * 30 + (this.minutes / 60) * 30;
    const minuteAngle = this.minutes * 6;

    this.hourHand.setAttribute("transform", `rotate(${hourAngle}, 50, 50)`);
    this.minuteHand.setAttribute("transform", `rotate(${minuteAngle}, 50, 50)`);
  }
}

// Export for tests if Node environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Clock };
}
