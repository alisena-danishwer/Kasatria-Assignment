

# Kasatria 3D Data Visualization Assignment

## 📖 Overview

This project is a 3D interactive data visualization built as a preliminary assignment for Kasatria. It visualizes a dataset of user profiles in a 3D environment using **Three.js** and the **CSS3DRenderer**. The application features secure Google Sign-In, real-time data fetching from Google Sheets, and multiple geometric layouts.

## 🚀 Live Demo

**[[Link to Live Project:](https://kasatria-assignment.netlify.app/)]** 

## ✨ Features Implemented

### 1. Authentication & Security

* 
**Google Sign-In:** Integrated **Google Identity Services** to authenticate users before accessing the visualization, matching the specific design requirements (Image A).


* **Secure UI:** The 3D environment and UI controls remain hidden until a successful OAuth token is received.

### 2. Data Integration

* 
**Live Data Source:** Fetches data directly from a published **Google Sheet (CSV)** using `PapaParse`.


* 
**Dynamic Parsing:** Automatically maps CSV columns (Name, Photo, Country, Net Worth) to the 3D cards.



### 3. Visualization & Design

* 
**3D Card Design:** Replicates the "Periodic Table" style tile structure.


* **Conditional Formatting:** Tiles are color-coded based on **Net Worth** logic:
* 🔴 **Red:** < $100k
* 🟠 **Orange:** > $100k
* 🟢 **Green:** > $200k.




* **Modern UI:** Features a responsive **Glassmorphism** interface with animated backgrounds and mobile-friendly controls.

### 4. Geometric Layouts

Users can seamlessly switch between four distinct 3D arrangements:

* 
**Table:** A standard periodic table layout arranged in a **20x10** grid.


* **Sphere:** A mathematically calculated 3D sphere distribution.
* 
**Helix:** A custom **Double Helix** structure (two intertwined strands).


* 
**Grid:** A specific 3D block arrangement of **5x4x10** (Width x Height x Depth).



---

## 🛠️ Technology Stack

* **Frontend:** HTML5, CSS3 (Variables, Flexbox, Animations).
* **3D Engine:** [Three.js](https://threejs.org/) (r128).
* **Renderer:** CSS3DRenderer (allows HTML/CSS elements to exist in 3D space).
* **Animation:** [Tween.js](https://github.com/tweenjs/tween.js/) for smooth layout transitions.
* **Data Parsing:** [PapaParse](https://www.papaparse.com/) for robust CSV handling.
* **Authentication:** Google Identity Services (OAuth 2.0).

---

## 💻 Local Installation & Setup

If you wish to run this project locally, please follow these steps:

### Prerequisites

* A code editor (VS Code recommended).
* Python or VS Code "Live Server" extension (Google Auth requires a server environment).

### Steps

1. **Clone the Repository**
```bash
git clone https://github.com/your-username/kasatria-assignment.git
cd kasatria-assignment

```


2. **Run a Local Server**
* **VS Code:** Right-click `index.html` and select **"Open with Live Server"**.
* **Python:** Run `python -m http.server`.


3. **Access the Application**
* Open your browser to: `http://localhost:5500` (or the port shown by your server).
* **Note:** You must use `localhost` or `127.0.0.1`. Google OAuth will block IP addresses like `192.168.x.x` due to security policies.



---

## 📂 Project Structure

```bash
/
├── index.html   # Main application structure, Google Auth config
├── style.css    # Responsive styling, glassmorphism, 3D element styles
├── script.js    # Core logic: Auth handling, Data fetching, Three.js scene
└── README.md    # Project documentation

```

---

## 📝 Design Decisions

* **Separation of Concerns:** The code is strictly separated into HTML (structure), CSS (presentation), and JS (logic) for maintainability.
* **Responsive Canvas:** The `onWindowResize` function ensures the 3D camera aspect ratio and renderer size update dynamically on mobile or desktop resize events.
* **Performance:** Uses `requestAnimationFrame` for the rendering loop to ensure smooth 60fps performance on modern devices.

---

**Software Developer:** Ali Sena Danishwer

**Position Applied:** Software Developer

**Tech Stack:** Three.js, Google OAuth 2.0, HTML5, CSS3 (Glassmorphism), JavaScript (ES6+)