// Data structures
let distributors = [];
let coffees = [];
let githubConfig = {
    user: 'keyarturo10-rgb',
    repo: 'latebase-project',
    branch: 'main',
    token: '',
    autoSync: false,
    syncInterval: 5
};
let syncIntervalId = null;

// DOM Elements
const distributorsGrid = document.getElementById('distributors-grid');
const coffeesGrid = document.getElementById('coffees-grid');
const distributorForm = document.getElementById('distributor-form');
const coffeeForm = document.getElementById('coffee-form');
const githubConfigForm = document.getElementById('github-config-form');
const distributorModal = document.getElementById('distributor-modal');
const coffeeModal = document.getElementById('coffee-modal');
const githubStatus = document.getElementById('github-status');
const githubStatusText = document.getElementById('github-status-text');
const autoSyncToggle = document.getElementById('github-auto-sync');
const syncIntervalContainer = document.getElementById('sync-interval-container');

// Utility functions
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => context.querySelectorAll(selector);

// Initialize application
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    loadData();
    setupEventListeners();
    renderDistributors();
    renderCoffees();
    setupTabs();
    loadGithubConfig();
    updateGithubStatus();
}

function setupEventListeners() {
    // Navigation tabs
    $$('nav a').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = tab.getAttribute('data-tab');
            activateTab(tabName);
        });
    });

    // Modal close buttons
    $$('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            distributorModal.style.display = 'none';
            coffeeModal.style.display = 'none';
        });
    });

    // Add distributor button
    $('#btn-add-distributor').addEventListener('click', () => {
        openDistributorModal();
    });

    // Add coffee button
    $('#btn-add-coffee').addEventListener('click', () => {
        openCoffeeModal();
    });

    // Form submissions
    distributorForm.addEventListener('submit', handleDistributorSubmit);
    coffeeForm.addEventListener('submit', handleCoffeeSubmit);
    githubConfigForm.addEventListener('submit', handleGithubConfigSubmit);

    // GitHub functionality
    $('#btn-test-connection').addEventListener('click', testGithubConnection);
    $('#btn-sync-now').addEventListener('click', syncWithGithub);

    // Auto sync toggle
    autoSyncToggle.addEventListener('change', () => {
        syncIntervalContainer.style.display = autoSyncToggle.checked ? 'block' : 'none';
    });

    // Search functionality
    $('#btn-search-distributors').addEventListener('click', searchDistributors);
    $('#btn-search-coffees').addEventListener('click', searchCoffees);

    // Event delegation for dynamic content
    distributorsGrid.addEventListener('click', handleDistributorActions);
    coffeesGrid.addEventListener('click', handleCoffeeActions);
}

function handleDistributorActions(e) {
    const target = e.target;
    if (target.classList.contains('edit-distributor')) {
        const id = target.getAttribute('data-id');
        openDistributorModal(id);
    } else if (target.classList.contains('delete-distributor')) {
        const id = target.getAttribute('data-id');
        deleteDistributor(id);
    }
}

function handleCoffeeActions(e) {
    const target = e.target;
    if (target.classList.contains('edit-coffee')) {
        const id = target.getAttribute('data-id');
        openCoffeeModal(id);
    } else if (target.classList.contains('delete-coffee')) {
        const id = target.getAttribute('data-id');
        deleteCoffee(id);
    }
}

function setupTabs() {
    $$('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    $('.tab-content.active').style.display = 'block';
}

function activateTab(tabName) {
    // Update navigation
    $$('nav a').forEach(tab => {
        tab.classList.remove('active');
    });
    $(`nav a[data-tab="${tabName}"]`).classList.add('active');

    // Update content
    $$('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    $(`#${tabName}`).style.display = 'block';
}

function loadData() {
    // Load from localStorage or initialize with empty arrays
    const savedDistributors = localStorage.getItem('latebase-distributors');
    const savedCoffees = localStorage.getItem('latebase-coffees');
    
    distributors = savedDistributors ? JSON.parse(savedDistributors) : [];
    coffees = savedCoffees ? JSON.parse(savedCoffees) : [];
}

function saveData() {
    localStorage.setItem('latebase-distributors', JSON.stringify(distributors));
    localStorage.setItem('latebase-coffees', JSON.stringify(coffees));
    
    // Trigger auto sync if enabled
    if (githubConfig.autoSync) {
        syncWithGithub();
    }
}

function loadGithubConfig() {
    const savedConfig = localStorage.getItem('latebase-github-config');
    if (savedConfig) {
        githubConfig = JSON.parse(savedConfig);
        
        // Update form fields
        $('#github-user').value = githubConfig.user;
        $('#github-repo').value = githubConfig.repo;
        $('#github-branch').value = githubConfig.branch;
        $('#github-token').value = githubConfig.token;
        $('#github-auto-sync').checked = githubConfig.autoSync;
        $('#sync-interval').value = githubConfig.syncInterval;
        
        syncIntervalContainer.style.display = githubConfig.autoSync ? 'block' : 'none';
        
        // Setup auto sync if enabled
        if (githubConfig.autoSync) {
            setupAutoSync();
        }
    }
}

function saveGithubConfig() {
    localStorage.setItem('latebase-github-config', JSON.stringify(githubConfig));
    
    // Update auto sync
    if (syncIntervalId) {
        clearInterval(syncIntervalId);
    }
    
    if (githubConfig.autoSync) {
        setupAutoSync();
    }
    
    updateGithubStatus();
}

function setupAutoSync() {
    const interval = githubConfig.syncInterval * 60 * 1000; // Convert to milliseconds
    if (syncIntervalId) {
        clearInterval(syncIntervalId);
    }
    syncIntervalId = setInterval(syncWithGithub, interval);
}

function updateGithubStatus() {
    if (githubConfig.token) {
        githubStatus.className = 'status-indicator status-connected';
        githubStatusText.textContent = 'Conectado a GitHub';
    } else {
        githubStatus.className = 'status-indicator status-disconnected';
        githubStatusText.textContent = 'No conectado a GitHub';
    }
}

function renderDistributors(filteredDistributors = null) {
    const data = filteredDistributors || distributors;
    distributorsGrid.innerHTML = '';
    
    if (data.length === 0) {
        distributorsGrid.innerHTML = '<p>No hay distribuidores registrados.</p>';
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    data.forEach(distributor => {
        const coffeeCount = coffees.filter(coffee => coffee.distributorId === distributor.id).length;
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${escapeHTML(distributor.name)}</h3>
            </div>
            <div class="card-body">
                <p><strong>País:</strong> ${escapeHTML(distributor.country)}</p>
                <p><strong>Región:</strong> ${escapeHTML(distributor.region)}</p>
                <p><strong>Contacto:</strong> ${escapeHTML(distributor.contact)}</p>
                <p>${escapeHTML(distributor.description)}</p>
            </div>
            <div class="card-footer">
                <div class="coffee-count" title="Cafés asociados">${coffeeCount}</div>
                <div>
                    <button class="btn btn-primary edit-distributor" data-id="${distributor.id}">Editar</button>
                    <button class="btn btn-danger delete-distributor" data-id="${distributor.id}">Eliminar</button>
                </div>
            </div>
        `;
        
        fragment.appendChild(card);
    });
    
    distributorsGrid.appendChild(fragment);
}

function renderCoffees(filteredCoffees = null) {
    const data = filteredCoffees || coffees;
    coffeesGrid.innerHTML = '';
    
    if (data.length === 0) {
        coffeesGrid.innerHTML = '<p>No hay cafés registrados.</p>';
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    data.forEach(coffee => {
        const distributor = distributors.find(d => d.id === coffee.distributorId);
        const distributorName = distributor ? distributor.name : 'Desconocido';
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${escapeHTML(coffee.name)}</h3>
            </div>
            <div class="card-body">
                <p><strong>Distribuidor:</strong> ${escapeHTML(distributorName)}</p>
                <p><strong>Origen:</strong> ${escapeHTML(coffee.origin)}</p>
                <p><strong>Altitud:</strong> ${coffee.altitude} msnm</p>
                <p><strong>Variedad:</strong> ${escapeHTML(coffee.variety)}</p>
                <p><strong>Proceso:</strong> ${escapeHTML(coffee.process)}</p>
                <p><strong>Tostación:</strong> ${escapeHTML(coffee.roastLevel)}</p>
                <p><strong>Puntuación SCA:</strong> ${coffee.scaScore}</p>
                <p><strong>Notas de cata:</strong> ${escapeHTML(coffee.tastingNotes)}</p>
                <p><strong>Precios:</strong> 250g: €${coffee.price250g} | 500g: €${coffee.price500g} | 1kg: €${coffee.price1kg}</p>
            </div>
            <div class="card-footer">
                <div>
                    <button class="btn btn-primary edit-coffee" data-id="${coffee.id}">Editar</button>
                    <button class="btn btn-danger delete-coffee" data-id="${coffee.id}">Eliminar</button>
                </div>
            </div>
        `;
        
        fragment.appendChild(card);
    });
    
    coffeesGrid.appendChild(fragment);
}

function openDistributorModal(id = null) {
    const modalTitle = $('#distributor-modal-title');
    const form = $('#distributor-form');
    
    if (id) {
        // Edit mode
        modalTitle.textContent = 'Editar Distribuidor';
        const distributor = distributors.find(d => d.id === id);
        
        $('#distributor-id').value = distributor.id;
        $('#distributor-name').value = distributor.name;
        $('#distributor-country').value = distributor.country;
        $('#distributor-region').value = distributor.region;
        $('#distributor-contact').value = distributor.contact;
        $('#distributor-description').value = distributor.description;
    } else {
        // Add mode
        modalTitle.textContent = 'Agregar Distribuidor';
        form.reset();
        $('#distributor-id').value = '';
    }
    
    distributorModal.style.display = 'flex';
}

function openCoffeeModal(id = null) {
    const modalTitle = $('#coffee-modal-title');
    const form = $('#coffee-form');
    const distributorSelect = $('#coffee-distributor');
    
    // Populate distributor dropdown
    distributorSelect.innerHTML = '<option value="">Seleccionar distribuidor</option>';
    distributors.forEach(distributor => {
        distributorSelect.innerHTML += `<option value="${distributor.id}">${escapeHTML(distributor.name)}</option>`;
    });
    
    if (id) {
        // Edit mode
        modalTitle.textContent = 'Editar Café';
        const coffee = coffees.find(c => c.id === id);
        
        $('#coffee-id').value = coffee.id;
        $('#coffee-distributor').value = coffee.distributorId;
        $('#coffee-name').value = coffee.name;
        $('#coffee-origin').value = coffee.origin;
        $('#coffee-altitude').value = coffee.altitude;
        $('#coffee-variety').value = coffee.variety;
        $('#coffee-process').value = coffee.process;
        $('#coffee-roast').value = coffee.roastLevel;
        $('#coffee-sca').value = coffee.scaScore;
        $('#coffee-tasting').value = coffee.tastingNotes;
        $('#coffee-price-250').value = coffee.price250g;
        $('#coffee-price-500').value = coffee.price500g;
        $('#coffee-price-1kg').value = coffee.price1kg;
    } else {
        // Add mode
        modalTitle.textContent = 'Agregar Café';
        form.reset();
        $('#coffee-id').value = '';
    }
    
    coffeeModal.style.display = 'flex';
}

function handleDistributorSubmit(e) {
    e.preventDefault();
    
    const id = $('#distributor-id').value;
    const name = $('#distributor-name').value;
    const country = $('#distributor-country').value;
    const region = $('#distributor-region').value;
    const contact = $('#distributor-contact').value;
    const description = $('#distributor-description').value;
    
    if (id) {
        // Update existing distributor
        const index = distributors.findIndex(d => d.id === id);
        if (index !== -1) {
            distributors[index] = { id, name, country, region, contact, description };
        }
    } else {
        // Add new distributor
        const newId = Date.now().toString();
        distributors.push({ 
            id: newId, 
            name, 
            country, 
            region, 
            contact, 
            description 
        });
    }
    
    saveData();
    renderDistributors();
    distributorModal.style.display = 'none';
}

function handleCoffeeSubmit(e) {
    e.preventDefault();
    
    const id = $('#coffee-id').value;
    const distributorId = $('#coffee-distributor').value;
    const name = $('#coffee-name').value;
    const origin = $('#coffee-origin').value;
    const altitude = parseFloat($('#coffee-altitude').value);
    const variety = $('#coffee-variety').value;
    const process = $('#coffee-process').value;
    const roastLevel = $('#coffee-roast').value;
    const scaScore = parseFloat($('#coffee-sca').value);
    const tastingNotes = $('#coffee-tasting').value;
    const price250g = parseFloat($('#coffee-price-250').value);
    const price500g = parseFloat($('#coffee-price-500').value);
    const price1kg = parseFloat($('#coffee-price-1kg').value);
    
    if (id) {
        // Update existing coffee
        const index = coffees.findIndex(c => c.id === id);
        if (index !== -1) {
            coffees[index] = { 
                id, 
                distributorId, 
                name, 
                origin, 
                altitude, 
                variety, 
                process, 
                roastLevel, 
                scaScore, 
                tastingNotes, 
                price250g, 
                price500g, 
                price1kg 
            };
        }
    } else {
        // Add new coffee
        const newId = Date.now().toString();
        coffees.push({ 
            id: newId, 
            distributorId, 
            name, 
            origin, 
            altitude, 
            variety, 
            process, 
            roastLevel, 
            scaScore, 
            tastingNotes, 
            price250g, 
            price500g, 
            price1kg 
        });
    }
    
    saveData();
    renderCoffees();
    coffeeModal.style.display = 'none';
}

function handleGithubConfigSubmit(e) {
    e.preventDefault();
    
    githubConfig.user = $('#github-user').value;
    githubConfig.repo = $('#github-repo').value;
    githubConfig.branch = $('#github-branch').value;
    githubConfig.token = $('#github-token').value;
    githubConfig.autoSync = $('#github-auto-sync').checked;
    githubConfig.syncInterval = parseInt($('#sync-interval').value);
    
    saveGithubConfig();
    alert('Configuración de GitHub guardada correctamente.');
}

function deleteDistributor(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este distribuidor? También se eliminarán todos sus cafés.')) {
        // Delete distributor
        distributors = distributors.filter(d => d.id !== id);
        
        // Delete associated coffees
        coffees = coffees.filter(c => c.distributorId !== id);
        
        saveData();
        renderDistributors();
        renderCoffees();
    }
}

function deleteCoffee(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este café?')) {
        coffees = coffees.filter(c => c.id !== id);
        saveData();
        renderCoffees();
    }
}

function searchDistributors() {
    const query = $('#search-distributors').value.toLowerCase();
    if (!query) {
        renderDistributors();
        return;
    }
    
    const filtered = distributors.filter(distributor => 
        distributor.name.toLowerCase().includes(query) ||
        distributor.country.toLowerCase().includes(query) ||
        distributor.region.toLowerCase().includes(query) ||
        distributor.contact.toLowerCase().includes(query) ||
        (distributor.description && distributor.description.toLowerCase().includes(query))
    );
    
    renderDistributors(filtered);
}

function searchCoffees() {
    const query = $('#search-coffees').value.toLowerCase();
    if (!query) {
        renderCoffees();
        return;
    }
    
    const filtered = coffees.filter(coffee => {
        const distributor = distributors.find(d => d.id === coffee.distributorId);
        const distributorName = distributor ? distributor.name.toLowerCase() : '';
        
        return (
            coffee.name.toLowerCase().includes(query) ||
            coffee.origin.toLowerCase().includes(query) ||
            coffee.variety.toLowerCase().includes(query) ||
            coffee.process.toLowerCase().includes(query) ||
            coffee.roastLevel.toLowerCase().includes(query) ||
            coffee.tastingNotes.toLowerCase().includes(query) ||
            distributorName.includes(query)
        );
    });
    
    renderCoffees(filtered);
}

async function testGithubConnection() {
    const user = $('#github-user').value;
    const repo = $('#github-repo').value;
    const token = $('#github-token').value;
    
    if (!user || !repo || !token) {
        alert('Por favor, completa todos los campos de configuración de GitHub.');
        return;
    }
    
    try {
        const response = await fetch(`https://api.github.com/repos/${user}/${repo}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            alert('Conexión a GitHub exitosa. El repositorio existe y el token es válido.');
        } else {
            const errorData = await response.json().catch(() => ({}));
            alert(`Error al conectar con GitHub: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        alert('Error al conectar con GitHub: ' + error.message);
    }
}

async function syncWithGithub() {
    if (!githubConfig.token) {
        alert('Por favor, configura primero tu token de GitHub.');
        activateTab('github-config');
        return;
    }
    
    try {
        // Prepare data for export
        const exportData = {
            distributors,
            coffees,
            lastSync: new Date().toISOString()
        };
        
        const content = btoa(JSON.stringify(exportData));
        const message = `LateBase Sync: ${new Date().toLocaleString()}`;
        
        // Check if file exists and get its SHA
        let sha = null;
        try {
            const response = await fetch(`https://api.github.com/repos/${githubConfig.user}/${githubConfig.repo}/contents/latebase-data.json`, {
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                const fileData = await response.json();
                sha = fileData.sha;
            }
        } catch (error) {
            // File doesn't exist, which is fine for first sync
        }
        
        // Create or update the file
        const response = await fetch(`https://api.github.com/repos/${githubConfig.user}/${githubConfig.repo}/contents/latebase-data.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubConfig.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                content,
                sha,
                branch: githubConfig.branch
            })
        });
        
        if (response.ok) {
            alert('Datos sincronizados correctamente con GitHub.');
        } else {
            const errorData = await response.json().catch(() => ({}));
            alert(`Error al sincronizar con GitHub: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        alert('Error al sincronizar con GitHub: ' + error.message);
    }
}

// Utility function to prevent XSS
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
