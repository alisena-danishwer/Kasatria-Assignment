// --- CONFIGURATION ---
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQAJGlgf_3AyhvlR8VnRmlrP54xWTaukHn_AmyiNrBUQ_dd9aTkDH4Fz87vp5Az-IAy4f88YuFt0sOO/pub?output=csv';

let camera, scene, renderer, controls;
const objects = [];
const targets = { table: [], sphere: [], helix: [], grid: [] };

// --- 1. LOGIN & AUTHENTICATION ---
function handleCredentialResponse(response) {
    try {
        const responsePayload = decodeJwtResponse(response.credential);
        console.log("User:", responsePayload.name);
        
        const loginOverlay = document.getElementById('login-overlay');
        const uiContainer = document.getElementById('ui-container'); // Get UI element
        
        // 1. Fade out Login
        loginOverlay.style.transition = 'opacity 0.6s ease';
        loginOverlay.style.opacity = '0';
        
        // 2. Wait for fade, then switch views
        setTimeout(() => {
            loginOverlay.style.display = 'none';
            uiContainer.style.display = 'flex'; // Use Flex to center the menu
            
            // 3. Start App
            init();
            animate();
        }, 600);

    } catch (e) {
        console.error("Auth Error:", e);
    }
}

function decodeJwtResponse(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
}

// --- 2. CORE APP LOGIC ---
function init() {
    // Camera
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 3000;

    scene = new THREE.Scene();

    // Data Load
    Papa.parse(CSV_URL, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            const data = results.data.filter(d => d.Name && d.Name.trim() !== "");
            createObjects(data);
            createLayouts(data);
            transform(targets.table, 2000);
        }
    });

    // Renderer
    renderer = new THREE.CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    // Controls
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener('change', render);

    // Listeners
    setupMenuButtons();
    window.addEventListener('resize', onWindowResize, false);
}

function setupMenuButtons() {
    const buttons = document.querySelectorAll('#menu button');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            buttons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            transform(targets[e.target.id], 2000);
        });
    });
}

function createObjects(data) {
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const element = document.createElement('div');
        element.className = 'element';
        
        // Logic: Clean currency string and assign color
        let netWorthRaw = item[' Net Worth '] || item['Net Worth'] || "0";
        let netWorthVal = parseFloat(netWorthRaw.replace(/[^0-9.-]+/g,""));
        
        // Dynamic Color Logic (Red < 100k, Orange > 100k, Green > 200k)
        let bgColor = 'rgba(239, 48, 34, 0.75)'; // Red base
        if (netWorthVal > 200000) bgColor = 'rgba(58, 180, 72, 0.75)'; // Green base
        else if (netWorthVal > 100000) bgColor = 'rgba(255, 165, 0, 0.75)'; // Orange base
        
        element.style.backgroundColor = bgColor;

        element.innerHTML = `
            <img src="${item.Photo}" loading="lazy" alt="">
            <div class="name">${item.Name}</div>
            <div class="details">${item.Country}</div>
            <div class="networth">${netWorthRaw}</div>
        `;

        const object = new THREE.CSS3DObject(element);
        object.position.x = Math.random() * 4000 - 2000;
        object.position.y = Math.random() * 4000 - 2000;
        object.position.z = Math.random() * 4000 - 2000;
        scene.add(object);
        objects.push(object);
    }
}

function createLayouts(data) {
    // Table
    for (let i = 0; i < objects.length; i++) {
        const object = new THREE.Object3D();
        const col = i % 20;
        const row = Math.floor(i / 20);
        object.position.x = (col * 140) - 1330;
        object.position.y = -(row * 180) + 990;
        targets.table.push(object);
    }

    // Sphere
    const vector = new THREE.Vector3();
    for (let i = 0, l = objects.length; i < l; i++) {
        const phi = Math.acos(-1 + (2 * i) / l);
        const theta = Math.sqrt(l * Math.PI) * phi;
        const object = new THREE.Object3D();
        object.position.setFromSphericalCoords(800, phi, theta);
        vector.copy(object.position).multiplyScalar(2);
        object.lookAt(vector);
        targets.sphere.push(object);
    }

    // Double Helix
    for (let i = 0, l = objects.length; i < l; i++) {
        const theta = i * 0.175 + Math.PI;
        const y = -(i * 8) + 450;
        const object = new THREE.Object3D();
        const isSecondStrand = i % 2 === 0;
        const finalTheta = theta + (isSecondStrand ? Math.PI : 0);
        object.position.setFromCylindricalCoords(900, finalTheta, y);
        vector.x = object.position.x * 2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;
        object.lookAt(vector);
        targets.helix.push(object);
    }

    // Grid 5x4x10
    for (let i = 0; i < objects.length; i++) {
        const object = new THREE.Object3D();
        const x = (i % 5) * 400 - 800;
        const y = (-(Math.floor(i / 5) % 4) * 400) + 800;
        const z = (Math.floor(i / 20) * 1000) - 2000;
        object.position.set(x, y, z);
        targets.grid.push(object);
    }
}

function transform(targets, duration) {
    TWEEN.removeAll();
    for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        const target = targets[i];
        if (!target) continue;
        new TWEEN.Tween(object.position)
            .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        new TWEEN.Tween(object.rotation)
            .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
    }
    new TWEEN.Tween(this)
        .to({}, duration * 2)
        .onUpdate(render)
        .start();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();
}

function render() {
    renderer.render(scene, camera);
}