// --- CONFIGURATION ---
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQAJGlgf_3AyhvlR8VnRmlrP54xWTaukHn_AmyiNrBUQ_dd9aTkDH4Fz87vp5Az-IAy4f88YuFt0sOO/pub?output=csv';

let camera, scene, renderer, controls;
const objects = [];
// Added 'pyramid' to targets
const targets = { table: [], sphere: [], helix: [], grid: [], pyramid: [] };

// --- 1. LOGIN & AUTHENTICATION ---
function handleCredentialResponse(response) {
    try {
        const responsePayload = decodeJwtResponse(response.credential);
        console.log("User:", responsePayload.name);
        
        const loginOverlay = document.getElementById('login-overlay');
        const uiContainer = document.getElementById('ui-container');
        
        loginOverlay.style.transition = 'opacity 0.6s ease';
        loginOverlay.style.opacity = '0';
        
        setTimeout(() => {
            loginOverlay.style.display = 'none';
            uiContainer.style.display = 'flex';
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
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 3000;

    scene = new THREE.Scene();

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

    renderer = new THREE.CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener('change', render);

    setupMenuButtons();
    window.addEventListener('resize', onWindowResize, false);
}

function setupMenuButtons() {
    const buttons = document.querySelectorAll('#menu button');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            buttons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            // Check if the target exists before transforming
            if (targets[e.target.id]) {
                transform(targets[e.target.id], 2000);
            }
        });
    });
}

function createObjects(data) {
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const element = document.createElement('div');
        element.className = 'element';
        
        let netWorthRaw = item[' Net Worth '] || item['Net Worth'] || "0";
        let netWorthVal = parseFloat(netWorthRaw.replace(/[^0-9.-]+/g,""));
        
        let bgColor = 'rgba(239, 48, 34, 0.75)'; // Red
        if (netWorthVal > 200000) bgColor = 'rgba(58, 180, 72, 0.75)'; // Green
        else if (netWorthVal > 100000) bgColor = 'rgba(255, 165, 0, 0.75)'; // Orange
        
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
    // --- TABLE ---
    for (let i = 0; i < objects.length; i++) {
        const object = new THREE.Object3D();
        const col = i % 20;
        const row = Math.floor(i / 20);
        object.position.x = (col * 140) - 1330;
        object.position.y = -(row * 180) + 990;
        targets.table.push(object);
    }

    // --- SPHERE ---
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

    // --- HELIX ---
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

    // --- GRID ---
    for (let i = 0; i < objects.length; i++) {
        const object = new THREE.Object3D();
        const x = (i % 5) * 400 - 800;
        const y = (-(Math.floor(i / 5) % 4) * 400) + 800;
        const z = (Math.floor(i / 20) * 1000) - 2000;
        object.position.set(x, y, z);
        targets.grid.push(object);
    }

    // --- PYRAMID (TETRAHEDRON) ---
    // A tetrahedron is formed by stacking triangles of decreasing size.
    // Layer 1: 1 item (Tip)
    // Layer 2: 3 items
    // Layer 3: 6 items
    // ...
    let pyramidIter = 0;
    // We loop through layers (i) until we run out of objects
    for (let i = 1; pyramidIter < objects.length; i++) {
        // For each layer, we form a triangle.
        // 'j' is the row within the triangle layer
        for (let j = 0; j < i; j++) {
            // 'k' is the column within that row
            for (let k = 0; k <= j; k++) {
                if (pyramidIter >= objects.length) break;

                const object = new THREE.Object3D();
                
                // Spacing constants
                const dist = 160; 
                const heightDist = 140;

                // MATH EXPLANATION:
                // x: Center the row. (k - j/2) centers items in a row of width j.
                const x = (k - j / 2) * dist;
                
                // z: Stack rows deep. (j - (i - 1) / 2) centers the triangle depth.
                const z = (j - (i - 1) / 2) * dist;
                
                // y: Stack layers vertically downwards from a high point (800)
                const y = -(i * heightDist) + 800;

                object.position.set(x, y, z);
                
                // We keep the rotation 0,0,0 so text is readable (like Grid)
                targets.pyramid.push(object);
                
                pyramidIter++;
            }
        }
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