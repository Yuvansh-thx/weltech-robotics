# Weltech — Intelligence That Feels 🤖✨

An interactive, responsive web experience showcasing **Weltech** humanoid physical AI, tactile robotics, and embodied intelligence.

![Weltech Robotics Preview](assets/images/human_hand.png)

---

## 🌟 Key Features

* **Iconic Touching Hands Stage**: Michelangelo-inspired human & robotic arms that span the screen from edge-to-edge, touching at the center with a glowing micro-spark and dynamically separating on scroll.
* **Kinetic Typography & Tunnel**: Video tunnel integration with synchronized kinetic words and spatial transitions.
* **Interactive 3D Fanned Card Deck**:
  * 3D perspective fan with gyroscopic cursor tilt on desktop.
  * Adaptive swipeable carousel with step indicators and arrow navigation for mobile and tablet touchscreens.
  * Detailed modal overlays with rich product specs for each robotic model.
* **Physical AI Metrics**: Animated counter telemetry, tactile latency benchmarks, and performance dashboards.
* **Tactile Audio Feedback**: Ambient synthesis effects using Web Audio API for tactile clicks, reconnection chimes, and slider glide tones.
* **Fully Responsive**: Crafted with modern CSS clamp tokens and dynamic viewport units (`dvh`/`vw`), providing seamless edge-to-edge rendering across Phones, Tablets, and Desktops (Full HD & 4K).

---

## 🚀 Quick Start

This is a zero-dependency static web application. You can run it locally with any static web server:

### Using Python
```bash
python3 -m http.server 3000
```

### Using Node.js / npx
```bash
npx serve .
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
weltech-robotics/
├── index.html          # Semantic HTML structure & accessible modal templates
├── styles.css          # Responsive design system, 3D card deck & kinetic styling
├── script.js           # Scroll kinematics, Web Audio synthesis & touch gestures
├── favicon.svg         # SVG vector favicon
└── assets/
    ├── images/         # Robotic card imagery and transparent hand renders
    └── videos/         # Background kinetic tunnel video loop
```

---

## 🛠️ Built With

* **HTML5** (Semantic layout, accessibility attributes, custom SVG indicators)
* **CSS3** (Fluid clamp calculations, 3D perspective transforms, dynamic viewport units)
* **JavaScript** (Kinetic scroll listeners, requestAnimationFrame physics, Web Audio API)

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
