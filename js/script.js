// Data management
const STORAGE_KEYS = {
    DISTRIBUTORS: 'lateBase_distributors',
    COFFEES: 'lateBase_coffees'
};

// GitHub repository configuration
const GITHUB_CONFIG = {
    USERNAME: 'keyarturo10-rgb',
    REPO: 'latebase-project',
    BRANCH: 'main',
    TOKEN: ''
};

// Initialize data
function initData() {
    if (!localStorage.getItem(STORAGE_KEYS.DISTRIBUTORS)) {
        localStorage.setItem(STORAGE_KEYS.DISTRIBUTORS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COFFEES)) {
        localStorage.setItem(STORAGE_KEYS.COFFEES, JSON.stringify([]));
    }
}

// Get data
function getDistributors() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DISTRIBUTORS) || '[]');
}

function getCoffees() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COFFEES) || '[]');
}

// Save data
function saveDistributor(distributor) {
    const distributors = getDistributors();
    distributor.id = Date.now().toString();
    distributors.push(distributor);
    localStorage.setItem(STORAGE_KEYS.DISTRIBUTORS, JSON.stringify(distributors));
    return distributor.id;
}

function saveCoffee(coffee) {
    const coffees = getCoffees();
    coffee.id = Date.now().toString();
    coffees.push(coffee);
    localStorage.setItem(STORAGE_KEYS.COFFEES, JSON.stringify(coffees));
    loadCoffees();
    return coffee.id;
}

// GitHub integration functions
async function exportToGitHub() {
    const token = prompt('Por favor, ingresa tu token de acceso personal de GitHub:');
    if (!token) return;
    
    GITHUB_CONFIG.TOKEN = token;
    
    const statusElement = document.getElementById('githubStatus');
    statusElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exportando datos a GitHub...';
    statusElement.style.color = 'var(--primary-green)';
    
    try {
        const distributors = getDistributors();
        const coffees = getCoffees();
        
        const data = {
            distributors,
            coffees,
            lastUpdated: new Date().toISOString()
        };
        
        // Check if file exists
        const checkUrl = `https://api.github.com/repos/${GITHUB_CONFIG.USERNAME}/${GITHUB_CONFIG.REPO}/contents/data.json`;
        const checkResponse = await fetch(checkUrl, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        let sha = null;
        if (checkResponse.ok) {
            const fileInfo = await checkResponse.json();
            sha = fileInfo.sha;
        }
        
        // Create or update file
        const updateUrl = `https://api.github.com/repos/${GITHUB_CONFIG.USERNAME}/${GITHUB_CONFIG.REPO}/contents/data.json`;
        const content = btoa(JSON.stringify(data, null, 2));
        
        const response = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Actualización de datos de Late Base',
                content: content,
                sha: sha,
                branch: GITHUB_CONFIG.BRANCH
            })
        });
        
        if (response.ok) {
            statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Datos exportados exitosamente a GitHub.';
            statusElement.style.color = 'var(--primary-green)';
        } else {
            throw new Error('Error al exportar a GitHub');
        }
    } catch (error) {
        console.error('Error exporting to GitHub:', error);
        statusElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error al exportar a GitHub. Verifica tu token y la configuración.';
        statusElement.style.color = 'red';
    }
}

async function importFromGitHub() {
    const token = prompt('Por favor, ingresa tu token de acceso personal de GitHub:');
    if (!token) return;
    
    GITHUB_CONFIG.TOKEN = token;
    
    const statusElement = document.getElementById('githubStatus');
    statusElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importando datos desde GitHub...';
    statusElement.style.color = 'var(--primary-green)';
    
    try {
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.USERNAME}/${GITHUB_CONFIG.REPO}/contents/data.json`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            const fileInfo = await response.json();
            const content = JSON.parse(atob(fileInfo.content));
            
            localStorage.setItem(STORAGE_KEYS.DISTRIBUTORS, JSON.stringify(content.distributors || []));
            localStorage.setItem(STORAGE_KEYS.COFFEES, JSON.stringify(content.coffees || []));
            
            loadDistributors();
            loadCoffees();
            populateDistributorSelect();
            
            statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Datos importados exitosamente desde GitHub.';
            statusElement.style.color = 'var(--primary-green)';
        } else {
            throw new Error('Archivo no encontrado en GitHub');
        }
    } catch (error) {
        console.error('Error importing from GitHub:', error);
        statusElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error al importar desde GitHub. Verifica tu token y la configuración.';
        statusElement.style.color = 'red';
    }
}

// UI Management
function showView(viewId) {
    document.querySelectorAll('.tab-content').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
}

function loadDistributors() {
    const distributors = getDistributors();
    const distributorsList = document.getElementById('distributorsList');
    
    distributorsList.innerHTML = '';
    
    if (distributors.length === 0) {
        distributorsList.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <i class="fas fa-store-slash" style="font-size: 48px; color: var(--medium-gray); margin-bottom: 15px;"></i>
                <h3>No hay distribuidores registrados</h3>
                <p>Agrega tu primer distribuidor haciendo clic en "Agregar Distribuidor" en el menú.</p>
            </div>
        `;
        return;
    }
    
    distributors.forEach(distributor => {
        const distributorCoffees = getCoffees().filter(coffee => coffee.distributorId === distributor.id);
        
        const card = document.createElement('div');
        card.className = 'distributor-card';
        card.innerHTML = `
            <div class="distributor-header">
                <h3 class="distributor-name">${distributor.name}</h3>
                <p class="distributor-location"><i class="fas fa-map-marker-alt"></i> ${distributor.region}, ${distributor.country}</p>
            </div>
            <div class="distributor-body">
                <p class="coffee-count"><i class="fas fa-coffee"></i> ${distributorCoffees.length} variedades de café</p>
                <p>${distributor.description || 'Sin descripción adicional.'}</p>
            </div>
            <div class="distributor-footer">
                <button class="btn btn-outline"><i class="fas fa-envelope"></i> ${distributor.contact}</button>
                <button class="btn btn-primary" data-distributor-id="${distributor.id}">Ver Cafés</button>
            </div>
        `;
        
        distributorsList.appendChild(card);
        
        // Add event listener to the button
        const viewCoffeesBtn = card.querySelector('.btn-primary');
        viewCoffeesBtn.addEventListener('click', () => {
            showDistributorCoffees(distributor.id);
        });
    });
}

function loadCoffees() {
    const coffees = getCoffees();
    const featuredCoffees = document.getElementById('featuredCoffees');
    
    featuredCoffees.innerHTML = '';
    
    if (coffees.length === 0) {
        featuredCoffees.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px;">
                <i class="fas fa-coffee" style="font-size: 48px; color: var(--medium-gray); margin-bottom: 15px;"></i>
                <h3>No hay cafés registrados</h3>
                <p>Agrega tu primer café haciendo clic en "Agregar Café" en el menú.</p>
            </div>
        `;
        return;
    }
    
    // Show only 3 featured coffees
    const featured = coffees.slice(0, 3);
    
    featured.forEach(coffee => {
        const distributor = getDistributors().find(d => d.id === coffee.distributorId);
        const coffeeEl = document.createElement('div');
        coffeeEl.className = 'coffee-details';
        coffeeEl.innerHTML = `
            <div class="coffee-header">
                <div>
                    <h3 class="coffee-name">${coffee.name}</h3>
                    <p class="coffee-origin"><i class="fas fa-map-marker-alt"></i> ${coffee.origin} · ${distributor ? distributor.name : 'Distribuidor desconocido'}</p>
                </div>
                <div class="coffee-price">$${coffee.price500} <span>/ 500g</span></div>
            </div>
            
            <div class="coffee-specs">
                <div class="spec-item">
                    <div class="spec-label">Puntuación SCA</div>
                    <div class="spec-value">${coffee.score} puntos</div>
                </div>
                <div class="spec-item">
                    <div class="spec-label">Altitud</div>
                    <div class="spec-value">${coffee.altitude} msnm</div>
                </div>
                <div class="spec-item">
                    <div class="spec-label">Variedad</div>
                    <div class="spec-value">${coffee.variety}</div>
                </div>
                <div class="spec-item">
                    <div class="spec-label">Proceso</div>
                    <div class="spec-value">${coffee.process}</div>
                </div>
                <div class="spec-item">
                    <div class="spec-label">Notas de Cata</div>
                    <div class="spec-value">${coffee.notes}</div>
                </div>
                <div class="spec-item">
                    <div class="spec-label">Tostión</div>
                    <div class="spec-value">${coffee.roastLevel}</div>
                </div>
            </div>
            
            <div class="pricing-table">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding: 12px; border-bottom: 2px solid var(--medium-gray);">Cantidad</th>
                            <th style="text-align: left; padding: 12px; border-bottom: 2px solid var(--medium-gray);">Precio Unitario</th>
                            <th style="text-align: left; padding: 12px; border-bottom: 2px solid var(--medium-gray);">Precio Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 12px; border-bottom: 1px solid var(--medium-gray);">250g</td>
                            <td style="padding: 12px; border-bottom: 1px solid var(--medium-gray);">$${coffee.price250}/100g</td>
                            <td style="padding: 12px; border-bottom: 1px solid var(--medium-gray);">$${coffee.price250}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border-bottom: 1px solid var(--medium-gray);">500g</td>
                            <td style="padding: 12px; border-bottom: 1px solid var(--medium-gray);">$${(coffee.price500 / 5).toFixed(2)}/100g</td>
                            <td style="padding: 12px; border-bottom: 1px solid var(--medium-gray);">$${coffee.price500}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px;">1kg</td>
                            <td style="padding: 12px;">$${(coffee.price1000 / 10).toFixed(2)}/100g</td>
                            <td style="padding: 12px;">$${coffee.price1000}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        
        featuredCoffees.appendChild(coffeeEl);
    });
}

function populateDistributorSelect() {
    const select = document.getElementById('coffeeDistributor');
    const distributors = getDistributors();
    
    // Clear existing options except the first one
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Add distributor options
    distributors.forEach(distributor => {
        const option = document.createElement('option');
        option.value = distributor.id;
        option.textContent = `${distributor.name} (${distributor.country})`;
        select.appendChild(option);
    });
}

function showDistributorCoffees(distributorId) {
    const coffees = getCoffees().filter(coffee => coffee.distributorId === distributorId);
    const distributor = getDistributors().find(d => d.id === distributorId);
    
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';
    
    if (coffees.length === 0) {
        resultsDiv.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px;">
                <i class="fas fa-coffee" style="font-size: 48px; color: var(--medium-gray); margin-bottom: 15px;"></i>
                <h3>No hay cafés para este distribuidor</h3>
                <p>Este distribuidor no tiene cafés registrados en la base de datos.</p>
            </div>
        `;
    } else {
        resultsDiv.innerHTML = `<h2 class="section-title">Cafés de ${distributor.name}</h2>`;
        
        coffees.forEach(coffee => {
            const coffeeEl = document.createElement('div');
            coffeeEl.className = 'coffee-details';
            coffeeEl.innerHTML = `
                <div class="coffee-header">
                    <div>
                        <h3 class="coffee-name">${coffee.name}</h3>
                        <p class="coffee-origin"><i class="fas fa-map-marker-alt"></i> ${coffee.origin}</p>
                    </div>
                    <div class="coffee-price">$${coffee.price500} <span>/ 500g</span></div>
                </div>
                
                <div class="coffee-specs">
                    <div class="spec-item">
                        <div class="spec-label">Puntuación SCA</div>
                        <div class="spec-value">${coffee.score} puntos</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Altitud</div>
                        <div class="spec-value">${coffee.altitude} msnm</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Variedad</div>
                        <div class="spec-value">${coffee.variety}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Proceso</div>
                        <div class="spec-value">${coffee.process}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Notas de Cata</div>
                        <div class="spec-value">${coffee.notes}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Tostión</div>
                        <div class="spec-value">${coffee.roastLevel}</div>
                    </div>
                </div>
            `;
            
            resultsDiv.appendChild(coffeeEl);
        });
    }
    
    showView('searchView');
}

function search(query) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';
    
    if (!query) {
        resultsDiv.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px;">
                <i class="fas fa-search" style="font-size: 48px; color: var(--medium-gray); margin-bottom: 15px;"></i>
                <h3>Ingresa un término de búsqueda</h3>
                <p>Utiliza el campo de búsqueda para encontrar distribuidores o cafés.</p>
            </div>
        `;
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    const distributors = getDistributors();
    const coffees = getCoffees();
    
    // Search distributors
    const distributorResults = distributors.filter(distributor => 
        distributor.name.toLowerCase().includes(lowerQuery) ||
        distributor.country.toLowerCase().includes(lowerQuery) ||
        distributor.region.toLowerCase().includes(lowerQuery) ||
        (distributor.description && distributor.description.toLowerCase().includes(lowerQuery))
    );
    
    // Search coffees
    const coffeeResults = coffees.filter(coffee =>
        coffee.name.toLowerCase().includes(lowerQuery) ||
        coffee.origin.toLowerCase().includes(lowerQuery) ||
        coffee.variety.toLowerCase().includes(lowerQuery) ||
        coffee.process.toLowerCase().includes(lowerQuery) ||
        coffee.notes.toLowerCase().includes(lowerQuery)
    );
    
    if (distributorResults.length === 0 && coffeeResults.length === 0) {
        resultsDiv.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px;">
                <i class="fas fa-search" style="font-size: 48px; color: var(--medium-gray); margin-bottom: 15px;"></i>
                <h3>No se encontraron resultados</h3>
                <p>Intenta con otros términos de búsqueda.</p>
            </div>
        `;
        return;
    }
    
    // Display distributor results
    if (distributorResults.length > 0) {
        resultsDiv.innerHTML += `<h2 class="section-title">Distribuidores (${distributorResults.length})</h2>`;
        
        distributorResults.forEach(distributor => {
            const distributorCoffees = coffees.filter(coffee => coffee.distributorId === distributor.id);
            
            const card = document.createElement('div');
            card.className = 'distributor-card';
            card.innerHTML = `
                <div class="distributor-header">
                    <h3 class="distributor-name">${distributor.name}</h3>
                    <p class="distributor-location"><i class="fas fa-map-marker-alt"></i> ${distributor.region}, ${distributor.country}</p>
                </div>
                <div class="distributor-body">
                    <p class="coffee-count"><i class="fas fa-coffee"></i> ${distributorCoffees.length} variedades de café</p>
                    <p>${distributor.description || 'Sin descripción adicional.'}</p>
                </div>
                <div class="distributor-footer">
                    <button class="btn btn-outline"><i class="fas fa-envelope"></i> ${distributor.contact}</button>
                    <button class="btn btn-primary" data-distributor-id="${distributor.id}">Ver Cafés</button>
                </div>
            `;
            
            resultsDiv.appendChild(card);
            
            // Add event listener to the button
            const viewCoffeesBtn = card.querySelector('.btn-primary');
            viewCoffeesBtn.addEventListener('click', () => {
                showDistributorCoffees(distributor.id);
            });
        });
    }
    
    // Display coffee results
    if (coffeeResults.length > 0) {
        resultsDiv.innerHTML += `<h2 class="section-title">Cafés (${coffeeResults.length})</h2>`;
        
        coffeeResults.forEach(coffee => {
            const distributor = distributors.find(d => d.id === coffee.distributorId);
            const coffeeEl = document.createElement('div');
            coffeeEl.className = 'coffee-details';
            coffeeEl.innerHTML = `
                <div class="coffee-header">
                    <div>
                        <h3 class="coffee-name">${coffee.name}</h3>
                        <p class="coffee-origin"><i class="fas fa-map-marker-alt"></i> ${coffee.origin} · ${distributor ? distributor.name : 'Distribuidor desconocido'}</p>
                    </div>
                    <div class="coffee-price">$${coffee.price500} <span>/ 500g</span></div>
                </div>
                
                <div class="coffee-specs">
                    <div class="spec-item">
                        <div class="spec-label">Puntuación SCA</div>
                        <div class="spec-value">${coffee.score} puntos</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Altitud</div>
                        <div class="spec-value">${coffee.altitude} msnm</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Variedad</div>
                        <div class="spec-value">${coffee.variety}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Proceso</div>
                        <div class="spec-value">${coffee.process}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Notas de Cata</div>
                        <div class="spec-value">${coffee.notes}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Tostión</div>
                        <div class="spec-value">${coffee.roastLevel}</div>
                    </div>
                </div>
            `;
            
            resultsDiv.appendChild(coffeeEl);
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    initData();
    
    // Load initial data
    loadDistributors();
    loadCoffees();
    populateDistributorSelect();
    
    // Set up event listeners
    document.getElementById('showHome').addEventListener('click', function(e) {
        e.preventDefault();
        showView('homeView');
        loadDistributors();
        loadCoffees();
    });
    
    document.getElementById('showAddDistributor').addEventListener('click', function(e) {
        e.preventDefault();
        showView('addDistributorView');
    });
    
    document.getElementById('showAddCoffee').addEventListener('click', function(e) {
        e.preventDefault();
        populateDistributorSelect();
        showView('addCoffeeView');
    });
    
    document.getElementById('showSearch').addEventListener('click', function(e) {
        e.preventDefault();
        showView('searchView');
        document.getElementById('searchInput').value = '';
        document.getElementById('searchResults').innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px;">
                <i class="fas fa-search" style="font-size: 48px; color: var(--medium-gray); margin-bottom: 15px;"></i>
                <h3>Buscar en la base de datos</h3>
                <p>Utiliza el campo de búsqueda para encontrar distribuidores o cafés.</p>
            </div>
        `;
    });
    
    document.getElementById('homeBtn').addEventListener('click', function() {
        showView('homeView');
        loadDistributors();
        loadCoffees();
    });
    
    // Footer navigation
    document.getElementById('footerHome').addEventListener('click', function(e) {
        e.preventDefault();
        showView('homeView');
        loadDistributors();
        loadCoffees();
    });
    
    document.getElementById('footerAddDistributor').addEventListener('click', function(e) {
        e.preventDefault();
        showView('addDistributorView');
    });
    
    document.getElementById('footerAddCoffee').addEventListener('click', function(e) {
        e.preventDefault();
        populateDistributorSelect();
        showView('addCoffeeView');
    });
    
    document.getElementById('footerSearch').addEventListener('click', function(e) {
        e.preventDefault();
        showView('searchView');
    });
    
    // GitHub sync buttons
    document.getElementById('exportToGitHub').addEventListener('click', exportToGitHub);
    document.getElementById('importFromGitHub').addEventListener('click', importFromGitHub);
    
    // Form submissions
    document.getElementById('distributorForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const distributor = {
            name: document.getElementById('distributorName').value,
            country: document.getElementById('distributorCountry').value,
            region: document.getElementById('distributorRegion').value,
            contact: document.getElementById('distributorContact').value,
            description: document.getElementById('distributorDescription').value
        };
        
        saveDistributor(distributor);
        populateDistributorSelect();
        
        // Reset form
        this.reset();
        
        // Show success message
        alert('Distribuidor agregado correctamente!');
        
        // Go back to home
        showView('homeView');
        loadDistributors();
    });
    
    document.getElementById('coffeeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const coffee = {
            distributorId: document.getElementById('coffeeDistributor').value,
            name: document.getElementById('coffeeName').value,
            origin: document.getElementById('coffeeOrigin').value,
            altitude: document.getElementById('coffeeAltitude').value,
            variety: document.getElementById('coffeeVariety').value,
            process: document.getElementById('coffeeProcess').value,
            roastLevel: document.getElementById('coffeeRoast').value,
            score: document.getElementById('coffeeScore').value,
            notes: document.getElementById('coffeeNotes').value,
            price250: document.getElementById('price250').value,
            price500: document.getElementById('price500').value,
            price1000: document.getElementById('price1000').value
        };
        
        saveCoffee(coffee);
        
        // Reset form
        this.reset();
        
        // Show success message
        alert('Café agregado correctamente!');
        
        // Go back to home
        showView('homeView');
        loadDistributors();
        loadCoffees();
    });
    
    // Search functionality
    document.getElementById('searchButton').addEventListener('click', function() {
        const query = document.getElementById('searchInput').value;
        search(query);
    });
    
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = document.getElementById('searchInput').value;
            search(query);
        }
    });
});