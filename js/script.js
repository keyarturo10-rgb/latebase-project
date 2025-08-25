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
    document.querySelectorAll('nav a').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = tab.getAttribute('data-tab');
            activateTab(tabName);
        });
    });

    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            distributorModal.style.display = 'none';
            coffeeModal.style.display = 'none';
        });
    });

    // Add distributor button
    document.getElementById('btn-add-distributor').addEventListener('click', () => {
        openDistributorModal();
    });

    // Add coffee button
    document.getElementById('btn-add-coffee').addEventListener('click', () => {
        openCoffeeModal();
    });

    // Distributor form submit
    distributorForm.addEventListener('submit', handleDistributorSubmit);

    // Coffee form submit
    coffeeForm.addEventListener('submit', handleCoffeeSubmit);

    // GitHub config form submit
    githubConfigForm.addEventListener('submit', handleGithubConfigSubmit);

    // Test connection button
    document.getElementById('btn-test-connection').addEventListener('click', testGithubConnection);

    // Auto sync toggle
    autoSyncToggle.addEventListener('change', () => {
        syncIntervalContainer.style.display = autoSyncToggle.checked ? 'block' : 'none';
    });

    // Sync now button
    document.getElementById('btn-sync-now').addEventListener('click', syncWithGithub);

    // Search functionality
    document.getElementById('btn-search-distributors').addEventListener('click', searchDistributors);
    document.getElementById('btn-search-coffees').addEventListener('click', searchCoffees);
}

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.style.display = 'none';
    });
    document.querySelector('.tab-content.active').style.display = 'block';
}

function activateTab(tabName) {
    // Update navigation
    document.querySelectorAll('nav a').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`nav a[data-tab="${tabName}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    document.getElementById(tabName).style.display = 'block';
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
        document.getElementById('github-user').value = githubConfig.user;
        document.getElementById('github-repo').value = githubConfig.repo;
        document.getElementById('github-branch').value = githubConfig.branch;
        document.getElementById('github-token').value = githubConfig.token;
        document.getElementById('github-auto-sync').checked = githubConfig.autoSync;
        document.getElementById('sync-interval').value = githubConfig.syncInterval;
        
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
    
    data.forEach(distributor => {
        const coffeeCount = coffees.filter(coffee => coffee.distributorId === distributor.id).length;
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${distributor.name}</h3>
            </div>
            <div class="card-body">
                <p><strong>País:</strong> ${distributor.country}</p>
                <p><strong>Región:</strong> ${distributor.region}</p>
                <p><strong>Contacto:</strong> ${distributor.contact}</p>
                <p>${distributor.description}</p>
            </div>
            <div class="card-footer">
                <div class="coffee-count" title="Cafés asociados">${coffeeCount}</div>
                <div>
                    <button class="btn btn-primary edit-distributor" data-id="${distributor.id}">Editar</button>
                    <button class="btn btn-danger delete-distributor" data-id="${distributor.id}">Eliminar</button>
                </div>
            </div>
        `;
        
        distributorsGrid.appendChild(card);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-distributor').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            openDistributorModal(id);
        });
    });
    
    document.querySelectorAll('.delete-distributor').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            deleteDistributor(id);
        });
    });
}

function renderCoffees(filteredCoffees = null) {
    const data = filteredCoffees || coffees;
    coffeesGrid.innerHTML = '';
    
    if (data.length === 0) {
        coffeesGrid.innerHTML = '<p>No hay cafés registrados.</p>';
        return;
    }
    
    data.forEach(coffee => {
        const distributor = distributors.find(d => d.id === coffee.distributorId);
        const distributorName = distributor ? distributor.name : 'Desconocido';
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${coffee.name}</h3>
            </div>
            <div class="card-body">
                <p><strong>Distribuidor:</strong> ${distributorName}</p>
                <p><strong>Origen:</strong> ${coffee.origin}</p>
                <p><strong>Altitud:</strong> ${coffee.altitude} msnm</p>
                <p><strong>Variedad:</strong> ${coffee.variety}</p>
                <p><strong>Proceso:</strong> ${coffee.process}</p>
                <p><strong>Tostación:</strong> ${coffee.roastLevel}</p>
                <p><strong>Puntuación SCA:</strong> ${coffee.scaScore}</p>
                <p><strong>Notas de cata:</strong> ${coffee.tastingNotes}</p>
                <p><strong>Precios:</strong> 250g: €${coffee.price250g} | 500g: €${coffee.price500g} | 1kg: €${coffee.price1kg}</p>
            </div>
            <div class="card-footer">
                <div>
                    <button class="btn btn-primary edit-coffee" data-id="${coffee.id}">Editar</button>
                    <button class="btn btn-danger delete-coffee" data-id="${coffee.id}">Eliminar</button>
                </div>
            </div>
        `;
        
        coffeesGrid.appendChild(card);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-coffee').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            openCoffeeModal(id);
        });
    });
    
    document.querySelectorAll('.delete-coffee').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            deleteCoffee(id);
        });
    });
}

function openDistributorModal(id = null) {
    const modalTitle = document.getElementById('distributor-modal-title');
    const form = document.getElementById('distributor-form');
    
    if (id) {
        // Edit mode
        modalTitle.textContent = 'Editar Distribuidor';
        const distributor = distributors.find(d => d.id === id);
        
        document.getElementById('distributor-id').value = distributor.id;
        document.getElementById('distributor-name').value = distributor.name;
        document.getElementById('distributor-country').value = distributor.country;
        document.getElementById('distributor-region').value = distributor.region;
        document.getElementById('distributor-contact').value = distributor.contact;
        document.getElementById('distributor-description').value = distributor.description;
    } else {
        // Add mode
        modalTitle.textContent = 'Agregar Distribuidor';
        form.reset();
        document.getElementById('distributor-id').value = '';
    }
    
    distributorModal.style.display = 'flex';
}

function openCoffeeModal(id = null) {
    const modalTitle = document.getElementById('coffee-modal-title');
    const form = document.getElementById('coffee-form');
    const distributorSelect = document.getElementById('coffee-distributor');
    
    // Populate distributor dropdown
    distributorSelect.innerHTML = '<option value="">Seleccionar distribuidor</option>';
    distributors.forEach(distributor => {
        distributorSelect.innerHTML += `<option value="${distributor.id}">${distributor.name}</option>`;
    });
    
    if (id) {
        // Edit mode
        modalTitle.textContent = 'Editar Café';
        const coffee = coffees.find(c => c.id === id);
        
        document.getElementById('coffee-id').value = coffee.id;
        document.getElementById('coffee-distributor').value = coffee.distributorId;
        document.getElementById('coffee-name').value = coffee.name;
        document.getElementById('coffee-origin').value = coffee.origin;
        document.getElementById('coffee-altitude').value = coffee.altitude;
        document.getElementById('coffee-variety').value = coffee.variety;
        document.getElementById('coffee-process').value = coffee.process;
        document.getElementById('coffee-roast').value = coffee.roastLevel;
        document.getElementById('coffee-sca').value = coffee.scaScore;
        document.getElementById('coffee-tasting').value = coffee.tastingNotes;
        document.getElementById('coffee-price-250').value = coffee.price250g;
        document.getElementById('coffee-price-500').value = coffee.price500g;
        document.getElementById('coffee-price-1kg').value = coffee.price1kg;
    } else {
        // Add mode
        modalTitle.textContent = 'Agregar Café';
        form.reset();
        document.getElementById('coffee-id').value = '';
    }
    
    coffeeModal.style.display = 'flex';
}

function handleDistributorSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('distributor-id').value;
    const name = document.getElementById('distributor-name').value;
    const country = document.getElementById('distributor-country').value;
    const region = document.getElementById('distributor-region').value;
    const contact = document.getElementById('distributor-contact').value;
    const description = document.getElementById('distributor-description').value;
    
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
    
    const id = document.getElementById('coffee-id').value;
    const distributorId = document.getElementById('coffee-distributor').value;
    const name = document.getElementById('coffee-name').value;
    const origin = document.getElementById('coffee-origin').value;
    const altitude = document.getElementById('coffee-altitude').value;
    const variety = document.getElementById('coffee-variety').value;
    const process = document.getElementById('coffee-process').value;
    const roastLevel = document.getElementById('coffee-roast').value;
    const scaScore = document.getElementById('coffee-sca').value;
    const tastingNotes = document.getElementById('coffee-tasting').value;
    const price250g = document.getElementById('coffee-price-250').value;
    const price500g = document.getElementById('coffee-price-500').value;
    const price1kg = document.getElementById('coffee-price-1kg').value;
    
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
    
    githubConfig.user = document.getElementById('github-user').value;
    githubConfig.repo = document.getElementById('github-repo').value;
    githubConfig.branch = document.getElementById('github-branch').value;
    githubConfig.token = document.getElementById('github-token').value;
    githubConfig.autoSync = document.getElementById('github-auto-sync').checked;
    githubConfig.syncInterval = parseInt(document.getElementById('sync-interval').value);
    
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
    const query = document.getElementById('search-distributors').value.toLowerCase();
    if (!query) {
        renderDistributors();
        return;
    }
    
    const filtered = distributors.filter(distributor => 
        distributor.name.toLowerCase().includes(query) ||
        distributor.country.toLowerCase().includes(query) ||
        distributor.region.toLowerCase().includes(query) ||
        distributor.contact.toLowerCase().includes(query) ||
        distributor.description.toLowerCase().includes(query)
    );
    
    renderDistributors(filtered);
}

function searchCoffees() {
    const query = document.getElementById('search-coffees').value.toLowerCase();
    if (!query) {
        renderCoffees();
        return;
    }
    
    const filtered = coffees.filter(coffee => {
        const distributor = distributors.find(d => d.id === coffee.distributorId);
        const distributorName = distributor ? distributor.name : '';
        
        return (
            coffee.name.toLowerCase().includes(query) ||
            coffee.origin.toLowerCase().includes(query) ||
            coffee.variety.toLowerCase().includes(query) ||
            coffee.process.toLowerCase().includes(query) ||
            coffee.roastLevel.toLowerCase().includes(query) ||
            coffee.tastingNotes.toLowerCase().includes(query) ||
            distributorName.toLowerCase().includes(query)
        );
    });
    
    renderCoffees(filtered);
}

async function testGithubConnection() {
    const user = document.getElementById('github-user').value;
    const repo = document.getElementById('github-repo').value;
    const token = document.getElementById('github-token').value;
    
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
            alert('Error al conectar con GitHub. Verifica los datos y el token.');
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
            alert('Error al sincronizar con GitHub.');
        }
    } catch (error) {
        alert('Error al sincronizar con GitHub: ' + error.message);
    }
}