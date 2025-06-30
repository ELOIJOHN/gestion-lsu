/**
 * LSU École du Cap - Application JavaScript principale
 * Gestionnaire intelligent pour le Livret Scolaire Unique
 */

// Configuration globale
const CONFIG = {
    AI_URL: 'http://localhost:11434/api/generate',
    AI_MODEL: 'mistral',
    AI_ENABLED: true,
    N8N_URL: '',
    N8N_WEBHOOK: '',
    N8N_ENABLED: false,
    STORAGE_KEY: 'lsu_ecole_cap_data',
    SETTINGS_KEY: 'lsu_ecole_cap_settings'
};

// État global de l'application
let appState = {
    eleves: [],
    commentaires: [],
    photos: {},
    settings: {}
};

// Templates de commentaires par niveau
const COMMENT_TEMPLATES = {
    insuffisant: {
        prefix: "éprouve des difficultés",
        tone: "bienveillant et encourageant",
        suggestions: "nécessite un accompagnement renforcé"
    },
    fragile: {
        prefix: "rencontre quelques difficultés",
        tone: "encourageant et constructif",
        suggestions: "bénéficierait d'un soutien adapté"
    },
    satisfaisant: {
        prefix: "réalise un travail satisfaisant",
        tone: "positif et encourageant",
        suggestions: "peut encore progresser"
    },
    excellent: {
        prefix: "excelle dans son travail",
        tone: "très positif et valorisant",
        suggestions: "maintenir ce niveau d'excellence"
    }
};

// Points forts avec descriptions
const POINTS_FORTS = {
    participation: "participe activement aux activités",
    autonomie: "fait preuve d'une bonne autonomie",
    progres: "progresse de manière constante",
    creativite: "développe sa créativité",
    ecoute: "écoute attentivement les consignes",
    entraide: "aide ses camarades avec bienveillance"
};

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 LSU École du Cap - Initialisation...');
    
    // Charger les données sauvegardées
    loadAppData();
    loadSettings();
    
    // Initialiser l'interface
    initializeUI();
    
    // Charger les données de test si nécessaire
    if (appState.eleves.length === 0) {
        loadSampleData();
    }
    
    // Mettre à jour les statistiques
    updateStats();
    
    console.log('✅ Application initialisée avec succès');
});

/**
 * Initialisation de l'interface utilisateur
 */
function initializeUI() {
    // Navigation
    initializeNavigation();
    
    // Formulaires
    initializeForms();
    
    // Événements
    initializeEvents();
    
    // Charger les photos
    loadPhotos();
}

/**
 * Initialisation de la navigation
 */
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // Mettre à jour l'état actif
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

/**
 * Afficher une section
 */
function showSection(sectionId) {
    // Masquer toutes les sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Afficher la section demandée
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Actions spécifiques par section
        switch(sectionId) {
            case 'eleves':
                renderElevesList();
                break;
            case 'generateur':
                updateEleveSelect();
                break;
            case 'photos':
                renderPhotos();
                break;
        }
    }
}

/**
 * Initialisation des formulaires
 */
function initializeForms() {
    // Formulaire générateur
    const generateurForm = document.getElementById('generateurForm');
    if (generateurForm) {
        generateurForm.addEventListener('submit', handleGenerateurSubmit);
    }
    
    // Formulaire élève
    const eleveForm = document.getElementById('eleveForm');
    if (eleveForm) {
        eleveForm.addEventListener('submit', handleEleveFormSubmit);
    }
    
    // Recherche élèves
    const searchInput = document.getElementById('searchEleve');
    if (searchInput) {
        searchInput.addEventListener('input', handleEleveSearch);
    }
    
    // Filtre classe
    const filterClasse = document.getElementById('filterClasse');
    if (filterClasse) {
        filterClasse.addEventListener('change', handleEleveFilter);
    }
}

/**
 * Initialisation des événements
 */
function initializeEvents() {
    // Boutons d'export/import
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportAllData);
    }
    
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
    }
    
    // Paramètres
    const aiUrl = document.getElementById('aiUrl');
    const aiModel = document.getElementById('aiModel');
    const aiEnabled = document.getElementById('aiEnabled');
    
    if (aiUrl) aiUrl.addEventListener('change', saveSettings);
    if (aiModel) aiModel.addEventListener('change', saveSettings);
    if (aiEnabled) aiEnabled.addEventListener('change', saveSettings);
}

/**
 * Gestion du formulaire générateur
 */
async function handleGenerateurSubmit(e) {
    e.preventDefault();
    
    const eleveId = document.getElementById('eleveSelect').value;
    const niveau = document.getElementById('niveauSelect').value;
    const trimestre = document.getElementById('trimestreSelect').value;
    const observations = document.getElementById('observations').value;
    
    // Récupérer les points forts sélectionnés
    const pointsForts = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        pointsForts.push(checkbox.value);
    });
    
    // Validation
    if (!eleveId || !niveau || !trimestre) {
        showToast('Veuillez remplir tous les champs obligatoires', 'warning');
        return;
    }
    
    if (pointsForts.length === 0) {
        showToast('Sélectionnez au moins un point fort', 'warning');
        return;
    }
    
    // Afficher le loading
    showLoading(true);
    
    try {
        // Générer le commentaire
        const commentaire = await generateCommentaire(eleveId, niveau, trimestre, pointsForts, observations);
        
        // Afficher le résultat
        displayCommentaire(commentaire);
        
        // Sauvegarder le commentaire
        saveCommentaireToHistory(commentaire);
        
        showToast('Commentaire généré avec succès !', 'success');
        
    } catch (error) {
        console.error('Erreur lors de la génération:', error);
        showToast('Erreur lors de la génération du commentaire', 'danger');
    } finally {
        showLoading(false);
    }
}

/**
 * Génération de commentaire avec IA
 */
async function generateCommentaire(eleveId, niveau, trimestre, pointsForts, observations) {
    const eleve = appState.eleves.find(e => e.id === eleveId);
    if (!eleve) throw new Error('Élève non trouvé');
    
    // Construction du prompt
    const prompt = buildPrompt(eleve, niveau, trimestre, pointsForts, observations);
    
    // Tentative avec IA locale
    if (CONFIG.AI_ENABLED) {
        try {
            const response = await callLocalAI(prompt);
            return response;
        } catch (error) {
            console.warn('IA locale indisponible, utilisation du fallback');
        }
    }
    
    // Fallback local
    return generateLocalCommentaire(eleve, niveau, trimestre, pointsForts, observations);
}

/**
 * Appel à l'IA locale (Ollama)
 */
async function callLocalAI(prompt) {
    const response = await fetch(CONFIG.AI_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: CONFIG.AI_MODEL,
            prompt: prompt,
            stream: false,
            options: {
                temperature: 0.7,
                top_p: 0.9,
                max_tokens: 200
            }
        })
    });
    
    if (!response.ok) {
        throw new Error('Erreur API IA locale');
    }
    
    const data = await response.json();
    return data.response.trim();
}

/**
 * Génération locale de commentaire
 */
function generateLocalCommentaire(eleve, niveau, trimestre, pointsForts, observations) {
    const template = COMMENT_TEMPLATES[niveau];
    const pointsFortsText = pointsForts.map(pf => POINTS_FORTS[pf]).join(' et ');
    
    let commentaire = `${eleve.prenom} ${template.prefix} en ${trimestre} trimestre. `;
    commentaire += `Elle ${pointsFortsText}. `;
    
    if (observations) {
        commentaire += `Observations particulières : ${observations}. `;
    }
    
    commentaire += `Je l'encourage à ${template.suggestions}.`;
    
    return commentaire;
}

/**
 * Construction du prompt pour l'IA
 */
function buildPrompt(eleve, niveau, trimestre, pointsForts, observations) {
    const template = COMMENT_TEMPLATES[niveau];
    const pointsFortsText = pointsForts.map(pf => POINTS_FORTS[pf]).join(', ');
    
    return `Tu es un enseignant expérimenté qui rédige des commentaires d'évaluation pour le Livret Scolaire Unique.

Élève: ${eleve.prenom} ${eleve.nom} - Classe: ${eleve.classe}
Niveau: ${niveau}
Trimestre: ${trimestre}
Points forts: ${pointsFortsText}
${observations ? `Observations: ${observations}` : ''}

Génère un commentaire ${template.tone} pour ${eleve.prenom} en te basant sur ces informations.
Le commentaire doit être:
- Bienveillant et encourageant
- Précis sur les acquis et les difficultés
- Constructif avec des pistes d'amélioration
- Adapté au niveau ${niveau}
- Entre 3 et 5 phrases maximum
- En français, sans formules trop répétitives

Commentaire:`;
}

/**
 * Affichage du commentaire généré
 */
function displayCommentaire(commentaire) {
    const resultContent = document.getElementById('resultContent');
    const noResult = document.getElementById('noResult');
    const generatedComment = document.getElementById('generatedComment');
    
    if (resultContent && noResult && generatedComment) {
        generatedComment.textContent = commentaire;
        noResult.classList.add('d-none');
        resultContent.classList.remove('d-none');
    }
}

/**
 * Affichage du loading
 */
function showLoading(show) {
    const loadingResult = document.getElementById('loadingResult');
    const resultContent = document.getElementById('resultContent');
    const noResult = document.getElementById('noResult');
    
    if (loadingResult && resultContent && noResult) {
        if (show) {
            loadingResult.classList.remove('d-none');
            resultContent.classList.add('d-none');
            noResult.classList.add('d-none');
        } else {
            loadingResult.classList.add('d-none');
        }
    }
}

/**
 * Copier le commentaire
 */
function copyComment() {
    const commentaire = document.getElementById('generatedComment')?.textContent;
    if (commentaire) {
        navigator.clipboard.writeText(commentaire).then(() => {
            showToast('Commentaire copié dans le presse-papiers !', 'success');
        }).catch(() => {
            showToast('Erreur lors de la copie', 'danger');
        });
    }
}

/**
 * Générer une variante
 */
function generateVariant() {
    // Réexécuter la génération avec des paramètres légèrement différents
    const form = document.getElementById('generateurForm');
    if (form) {
        form.dispatchEvent(new Event('submit'));
    }
}

/**
 * Sauvegarder le commentaire
 */
function saveComment() {
    const commentaire = document.getElementById('generatedComment')?.textContent;
    if (commentaire) {
        const eleveId = document.getElementById('eleveSelect').value;
        const eleve = appState.eleves.find(e => e.id === eleveId);
        
        const commentaireObj = {
            id: Date.now(),
            eleveId: eleveId,
            eleveNom: eleve ? `${eleve.prenom} ${eleve.nom}` : '',
            contenu: commentaire,
            niveau: document.getElementById('niveauSelect').value,
            trimestre: document.getElementById('trimestreSelect').value,
            date: new Date().toISOString()
        };
        
        appState.commentaires.push(commentaireObj);
        saveAppData();
        updateStats();
        
        showToast('Commentaire sauvegardé !', 'success');
    }
}

/**
 * Gestion du formulaire élève
 */
function handleEleveFormSubmit(event) {
    // Empêcher le rechargement de la page
    event.preventDefault();
    
    // Appeler la fonction de sauvegarde
    saveEleve();
}

/**
 * Afficher le modal d'ajout d'élève
 */
function showAddEleveModal() {
    document.getElementById('eleveModalTitle').innerHTML = '<i class="fas fa-user-plus me-2"></i>Ajouter un Élève';
    document.getElementById('eleveForm').reset();
    document.getElementById('eleveId').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('eleveModal'));
    modal.show();
}

/**
 * Éditer un élève
 */
function editEleve(eleveId) {
    const eleve = appState.eleves.find(e => e.id === eleveId);
    if (!eleve) return;
    
    document.getElementById('eleveModalTitle').innerHTML = '<i class="fas fa-user-edit me-2"></i>Modifier l\'Élève';
    document.getElementById('eleveId').value = eleve.id;
    document.getElementById('elevePrenom').value = eleve.prenom;
    document.getElementById('eleveNom').value = eleve.nom;
    document.getElementById('eleveClasse').value = eleve.classe;
    document.getElementById('eleveDateNaissance').value = eleve.dateNaissance;
    document.getElementById('eleveNotes').value = eleve.notes || '';
    
    const modal = new bootstrap.Modal(document.getElementById('eleveModal'));
    modal.show();
}

/**
 * Supprimer un élève
 */
function deleteEleve(eleveId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élève ?')) {
        appState.eleves = appState.eleves.filter(e => e.id !== eleveId);
        appState.commentaires = appState.commentaires.filter(c => c.eleveId !== eleveId);
        
        saveAppData();
        updateStats();
        updateEleveSelect();
        renderElevesList();
        
        showToast('Élève supprimé avec succès !', 'success');
    }
}

/**
 * Rendu de la liste des élèves
 */
function renderElevesList() {
    const container = document.getElementById('elevesList');
    if (!container) return;
    
    const searchTerm = document.getElementById('searchEleve')?.value.toLowerCase() || '';
    const filterClasse = document.getElementById('filterClasse')?.value || '';
    
    let filteredEleves = appState.eleves;
    
    // Filtre par recherche
    if (searchTerm) {
        filteredEleves = filteredEleves.filter(eleve => 
            eleve.prenom.toLowerCase().includes(searchTerm) ||
            eleve.nom.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filtre par classe
    if (filterClasse) {
        filteredEleves = filteredEleves.filter(eleve => eleve.classe === filterClasse);
    }
    
    if (filteredEleves.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <i class="fas fa-users fa-3x text-muted mb-3"></i>
                <p class="text-muted">Aucun élève trouvé</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredEleves.map(eleve => `
        <div class="col-md-6 col-lg-4">
            <div class="student-card">
                <h3>${eleve.prenom} ${eleve.nom}</h3>
                <p class="classe">${eleve.classe}</p>
                <p class="naissance">${formatDate(eleve.dateNaissance)}</p>
                <p class="commentaire">${eleve.notes || 'Aucun commentaire'}</p>
                <div class="eleve-actions mt-3">
                    <button class="btn btn-sm btn-outline-primary" onclick="editEleve('${eleve.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteEleve('${eleve.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="selectEleveForGenerator('${eleve.id}')">
                        <i class="fas fa-brain"></i> Générer
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Sélectionner un élève pour le générateur
 */
function selectEleveForGenerator(eleveId) {
    showSection('generateur');
    document.getElementById('eleveSelect').value = eleveId;
}

/**
 * Mise à jour du select des élèves
 */
function updateEleveSelect() {
    const select = document.getElementById('eleveSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">Sélectionner un élève</option>' +
        appState.eleves.map(eleve => 
            `<option value="${eleve.id}">${eleve.prenom} ${eleve.nom} - ${eleve.classe}</option>`
        ).join('');
}

/**
 * Gestion de la recherche d'élèves
 */
function handleEleveSearch() {
    renderElevesList();
}

/**
 * Gestion du filtre de classe
 */
function handleEleveFilter() {
    renderElevesList();
}

/**
 * Upload de photo
 */
function uploadPhoto(classe, input) {
    const file = input.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showToast('Veuillez sélectionner une image', 'warning');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        appState.photos[classe] = e.target.result;
        saveAppData();
        renderPhotos();
        showToast(`Photo de la classe ${classe} uploadée !`, 'success');
    };
    reader.readAsDataURL(file);
}

/**
 * Rendu des photos
 */
function renderPhotos() {
    Object.keys(appState.photos).forEach(classe => {
        const container = document.getElementById(`photo${classe}`);
        if (container) {
            container.innerHTML = `<img src="${appState.photos[classe]}" alt="Photo ${classe}">`;
        }
    });
}

/**
 * Charger les photos
 */
function loadPhotos() {
    renderPhotos();
}

/**
 * Test de l'IA
 */
async function testAI() {
    const url = document.getElementById('aiUrl')?.value || CONFIG.AI_URL;
    const model = document.getElementById('aiModel')?.value || CONFIG.AI_MODEL;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                prompt: 'Test de connexion - LSU École du Cap',
                stream: false
            })
        });
        
        if (response.ok) {
            showToast('Connexion IA locale réussie !', 'success');
        } else {
            throw new Error('Erreur de connexion');
        }
    } catch (error) {
        showToast('Erreur de connexion à l\'IA locale', 'danger');
    }
}

/**
 * Test de N8N
 */
async function testN8N() {
    const url = document.getElementById('n8nUrl')?.value;
    const webhook = document.getElementById('n8nWebhook')?.value;
    
    if (!url || !webhook) {
        showToast('Veuillez configurer l\'URL et le webhook N8N', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${url}/webhook/${webhook}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ test: true, message: 'Test de connexion N8N' })
        });
        
        if (response.ok) {
            showToast('Connexion N8N réussie !', 'success');
        } else {
            throw new Error('Erreur de connexion');
        }
    } catch (error) {
        showToast('Erreur de connexion à N8N', 'danger');
    }
}

/**
 * Sauvegarder les paramètres
 */
function saveSettings() {
    const settings = {
        aiUrl: document.getElementById('aiUrl')?.value || CONFIG.AI_URL,
        aiModel: document.getElementById('aiModel')?.value || CONFIG.AI_MODEL,
        aiEnabled: document.getElementById('aiEnabled')?.checked || false,
        n8nUrl: document.getElementById('n8nUrl')?.value || '',
        n8nWebhook: document.getElementById('n8nWebhook')?.value || '',
        n8nEnabled: document.getElementById('n8nEnabled')?.checked || false
    };
    
    localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(settings));
    Object.assign(CONFIG, settings);
    
    showToast('Paramètres sauvegardés !', 'success');
}

/**
 * Charger les paramètres
 */
function loadSettings() {
    try {
        const saved = localStorage.getItem(CONFIG.SETTINGS_KEY);
        if (saved) {
            const settings = JSON.parse(saved);
            Object.assign(CONFIG, settings);
            
            // Mettre à jour l'interface
            if (document.getElementById('aiUrl')) document.getElementById('aiUrl').value = CONFIG.aiUrl;
            if (document.getElementById('aiModel')) document.getElementById('aiModel').value = CONFIG.aiModel;
            if (document.getElementById('aiEnabled')) document.getElementById('aiEnabled').checked = CONFIG.aiEnabled;
            if (document.getElementById('n8nUrl')) document.getElementById('n8nUrl').value = CONFIG.n8nUrl;
            if (document.getElementById('n8nWebhook')) document.getElementById('n8nWebhook').value = CONFIG.n8nWebhook;
            if (document.getElementById('n8nEnabled')) document.getElementById('n8nEnabled').checked = CONFIG.n8nEnabled;
        }
    } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
    }
}

/**
 * Sauvegarder les données de l'application
 */
function saveAppData() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(appState));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        showToast('Erreur lors de la sauvegarde', 'danger');
    }
}

/**
 * Charger les données de l'application
 */
function loadAppData() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (saved) {
            appState = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        appState = { eleves: [], commentaires: [], photos: {}, settings: {} };
    }
}

/**
 * Charger des données de test
 */
function loadSampleData() {
    const sampleEleves = [
        { id: '1', prenom: 'Emma', nom: 'Dubois', classe: 'CP', dateNaissance: '2017-03-15', notes: 'Élève très motivée' },
        { id: '2', prenom: 'Lucas', nom: 'Leroy', classe: 'CP', dateNaissance: '2017-07-22', notes: 'Bon niveau en lecture' },
        { id: '3', prenom: 'Chloé', nom: 'Moreau', classe: 'CE1', dateNaissance: '2016-01-08', notes: 'Progresse bien en mathématiques' },
        { id: '4', prenom: 'Hugo', nom: 'Simon', classe: 'CE1', dateNaissance: '2016-11-30', notes: 'Très créatif en arts plastiques' },
        { id: '5', prenom: 'Léa', nom: 'Michel', classe: 'CE2', dateNaissance: '2015-05-12', notes: 'Excellente participation' }
    ];
    
    appState.eleves = sampleEleves;
    saveAppData();
    showToast('Données de test chargées !', 'info');
}

/**
 * Mise à jour des statistiques
 */
function updateStats() {
    document.getElementById('totalEleves').textContent = appState.eleves.length;
    document.getElementById('totalCommentaires').textContent = appState.commentaires.length;
    document.getElementById('totalPhotos').textContent = Object.keys(appState.photos).length;
    
    // Mettre à jour les derniers commentaires
    updateDerniersCommentaires();
}

/**
 * Mise à jour des derniers commentaires
 */
function updateDerniersCommentaires() {
    const container = document.getElementById('derniersCommentaires');
    if (!container) return;
    
    const derniers = appState.commentaires.slice(-5).reverse();
    
    if (derniers.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Aucun commentaire généré</p>';
        return;
    }
    
    container.innerHTML = derniers.map(commentaire => `
        <div class="border-bottom pb-2 mb-2">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <strong>${commentaire.eleveNom}</strong>
                    <small class="text-muted d-block">${commentaire.niveau} - ${commentaire.trimestre}</small>
                </div>
                <small class="text-muted">${formatDate(commentaire.date)}</small>
            </div>
            <p class="mb-0 small">${commentaire.contenu.substring(0, 100)}...</p>
        </div>
    `).join('');
}

/**
 * Sauvegarder un commentaire dans l'historique
 */
function saveCommentaireToHistory(commentaire) {
    const eleveId = document.getElementById('eleveSelect').value;
    const eleve = appState.eleves.find(e => e.id === eleveId);
    
    const commentaireObj = {
        id: Date.now(),
        eleveId: eleveId,
        eleveNom: eleve ? `${eleve.prenom} ${eleve.nom}` : '',
        contenu: commentaire,
        niveau: document.getElementById('niveauSelect').value,
        trimestre: document.getElementById('trimestreSelect').value,
        date: new Date().toISOString()
    };
    
    appState.commentaires.push(commentaireObj);
    saveAppData();
    updateStats();
}

/**
 * Export de toutes les données
 */
function exportAllData() {
    const data = {
        eleves: appState.eleves,
        commentaires: appState.commentaires,
        photos: appState.photos,
        settings: appState.settings,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lsu_ecole_cap_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Données exportées avec succès !', 'success');
}

/**
 * Import de données
 */
function importAllData() {
    document.getElementById('importFile').click();
}

/**
 * Gestion du fichier d'import
 */
function handleImportFile(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.eleves) appState.eleves = data.eleves;
            if (data.commentaires) appState.commentaires = data.commentaires;
            if (data.photos) appState.photos = data.photos;
            if (data.settings) appState.settings = data.settings;
            
            saveAppData();
            updateStats();
            updateEleveSelect();
            renderElevesList();
            renderPhotos();
            
            showToast('Données importées avec succès !', 'success');
            
        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            showToast('Erreur lors de l\'import du fichier', 'danger');
        }
    };
    reader.readAsText(file);
}

/**
 * Effacer toutes les données
 */
function clearAllData() {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible.')) {
        appState = { eleves: [], commentaires: [], photos: {}, settings: {} };
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        
        updateStats();
        updateEleveSelect();
        renderElevesList();
        renderPhotos();
        
        showToast('Toutes les données ont été effacées', 'info');
    }
}

/**
 * Réinitialiser le générateur
 */
function resetGenerateur() {
    document.getElementById('generateurForm').reset();
    document.getElementById('resultContent').classList.add('d-none');
    document.getElementById('noResult').classList.remove('d-none');
}

/**
 * Affichage des notifications toast
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastBody = document.getElementById('toastBody');
    
    if (toast && toastTitle && toastBody) {
        // Mettre à jour le contenu
        toastBody.textContent = message;
        
        // Mettre à jour le style selon le type
        toast.className = `toast`;
        toast.classList.add(`bg-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : type === 'danger' ? 'danger' : 'info'}`);
        
        // Mettre à jour l'icône
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'warning' ? 'exclamation-triangle' : 
                    type === 'danger' ? 'times-circle' : 'info-circle';
        
        toastTitle.innerHTML = `<i class="fas fa-${icon} me-2"></i>Notification`;
        
        // Afficher le toast
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }
}

/**
 * Formatage de date
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Sauvegarder un élève (ajout ou modification)
 */
function saveEleve() {
    // Récupération des données du formulaire
    const prenom = document.getElementById('elevePrenom').value.trim();
    const nom = document.getElementById('eleveNom').value.trim();
    const classe = document.getElementById('eleveClasse').value;
    const dateNaissance = document.getElementById('eleveDateNaissance').value;
    const notes = document.getElementById('eleveNotes').value.trim();
    const eleveId = document.getElementById('eleveId').value;

    // Validation des champs requis
    if (!prenom || !nom || !classe || !dateNaissance) {
        showToast('Veuillez remplir tous les champs obligatoires', 'warning');
        return;
    }

    // Création de l'objet élève
    const eleveData = {
        prenom: prenom,
        nom: nom,
        classe: classe,
        dateNaissance: dateNaissance,
        notes: notes
    };

    // Affichage des données dans la console (pour debug)
    console.log('Données de l\'élève à sauvegarder:', eleveData);

    if (eleveId) {
        // Modification d'un élève existant
        const index = appState.eleves.findIndex(e => e.id === eleveId);
        if (index !== -1) {
            appState.eleves[index] = { ...appState.eleves[index], ...eleveData };
        }
    } else {
        // Ajout d'un nouvel élève
        const nouvelEleve = {
            id: Date.now().toString(),
            ...eleveData,
            dateCreation: new Date().toISOString()
        };
        appState.eleves.push(nouvelEleve);
    }

    // Sauvegarde des données
    saveAppData();
    
    // Mise à jour de l'interface
    updateEleveSelect();
    renderElevesList();
    updateStats();

    // Fermeture de la modale
    const modal = bootstrap.Modal.getInstance(document.getElementById('eleveModal'));
    if (modal) {
        modal.hide();
    }

    // Réinitialisation du formulaire
    document.getElementById('eleveForm').reset();
    document.getElementById('eleveId').value = '';

    // Notification de succès
    showToast('Élève sauvegardé avec succès !', 'success');
}

/**
 * Exporter les élèves au format CSV ou JSON
 */
function exportEleves(format = 'csv') {
    const eleves = appState.eleves;
    if (!eleves || eleves.length === 0) {
        showToast('Aucun élève à exporter.', 'warning');
        return;
    }

    // Champs à exporter
    const fields = ['prenom', 'nom', 'classe', 'dateNaissance', 'notes'];
    const headers = ['Prénom', 'Nom', 'Classe', 'Date de naissance', 'Notes'];

    if (format === 'json') {
        // Export JSON
        const data = eleves.map(e => ({
            Prénom: e.prenom,
            Nom: e.nom,
            Classe: e.classe,
            'Date de naissance': e.dateNaissance,
            Notes: e.notes || ''
        }));
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'eleves_export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Export JSON réussi ✅', 'success');
    } else {
        // Export CSV
        let csv = headers.join(',') + '\n';
        csv += eleves.map(e => [
            '"' + (e.prenom || '').replace(/"/g, '""') + '"',
            '"' + (e.nom || '').replace(/"/g, '""') + '"',
            '"' + (e.classe || '') + '"',
            '"' + (e.dateNaissance || '') + '"',
            '"' + (e.notes || '').replace(/"/g, '""') + '"'
        ].join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'eleves_export.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Export CSV réussi ✅', 'success');
    }
}

/**
 * Gère l'import d'élèves depuis un fichier CSV ou JSON
 */
function handleImportEleves(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        let imported = [];
        try {
            if (file.name.endsWith('.json')) {
                // JSON
                const data = JSON.parse(e.target.result);
                if (!Array.isArray(data)) throw new Error();
                imported = data.map(eleve => ({
                    prenom: eleve.prenom || eleve["Prénom"] || "",
                    nom: eleve.nom || eleve["Nom"] || "",
                    classe: eleve.classe || eleve["Classe"] || "",
                    dateNaissance: eleve.dateNaissance || eleve["Date de naissance"] || eleve["DateNaissance"] || "",
                    notes: eleve.notes || eleve["Notes"] || ""
                }));
            } else if (file.name.endsWith('.csv')) {
                // CSV
                const text = e.target.result;
                const lines = text.split(/\r?\n/).filter(l => l.trim());
                if (lines.length < 2) throw new Error();
                const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                imported = lines.slice(1).map(line => {
                    const values = line.split(',');
                    return {
                        prenom: values[headers.indexOf('prénom')] || "",
                        nom: values[headers.indexOf('nom')] || "",
                        classe: values[headers.indexOf('classe')] || "",
                        dateNaissance: values[headers.indexOf('datenaissance')] || values[headers.indexOf('date de naissance')] || "",
                        notes: values[headers.indexOf('notes')] || ""
                    };
                });
            } else {
                throw new Error();
            }
        } catch (err) {
            showToast('Format de fichier non supporté.', 'danger');
            event.target.value = '';
            return;
        }

        // Filtrer les doublons (optionnel, ici sur prénom+nom+classe)
        imported = imported.filter(eleve =>
            eleve.prenom && eleve.nom && eleve.classe &&
            !appState.eleves.some(ex =>
                ex.prenom === eleve.prenom &&
                ex.nom === eleve.nom &&
                ex.classe === eleve.classe
            )
        );

        if (imported.length === 0) {
            showToast('Aucun élève à importer ou déjà existant.', 'warning');
            event.target.value = '';
            return;
        }

        // Ajout à l'état et affichage
        imported.forEach(eleve => {
            appState.eleves.push({
                id: Date.now().toString() + Math.random().toString(36).slice(2),
                ...eleve,
                dateCreation: new Date().toISOString()
            });
        });
        saveAppData();
        updateEleveSelect && updateEleveSelect();
        renderElevesList && renderElevesList();
        updateStats && updateStats();
        showToast('Import réussi ✅', 'success');
        event.target.value = '';
    };
    reader.readAsText(file);
}

// Export des fonctions pour utilisation globale
window.showSection = showSection;
window.editEleve = editEleve;
window.deleteEleve = deleteEleve;
window.selectEleveForGenerator = selectEleveForGenerator;
window.copyComment = copyComment;
window.generateVariant = generateVariant;
window.saveComment = saveComment;
window.showAddEleveModal = showAddEleveModal;
window.saveEleve = saveEleve;
window.handleEleveFormSubmit = handleEleveFormSubmit;
window.uploadPhoto = uploadPhoto;
window.testAI = testAI;
window.testN8N = testN8N;
window.exportAllData = exportAllData;
window.importAllData = importAllData;
window.clearAllData = clearAllData;
window.resetGenerateur = resetGenerateur;
window.saveSettings = saveSettings;
window.exportEleves = exportEleves;
window.handleImportEleves = handleImportEleves;

// 🔁 EXPORTER LES ÉLÈVES
document.getElementById('export-btn').addEventListener('click', () => {
  const cards = document.querySelectorAll('.student-card');
  const data = [];

  cards.forEach(card => {
    const prenomNom = card.querySelector('h3').textContent.split(' ');
    const prenom = prenomNom[0];
    const nom = prenomNom[1];
    const classe = card.querySelector('.classe')?.textContent || "Non défini";
    const naissance = card.querySelector('.naissance')?.textContent || "";
    const commentaire = card.querySelector('.commentaire')?.textContent || "";

    data.push({
      prenom,
      nom,
      classe,
      naissance,
      commentaire
    });
  });

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'eleves_export.json';
  link.click();
  URL.revokeObjectURL(url);

  showToast('✅ Export effectué avec succès !');
});

// 🔁 IMPORTER LES ÉLÈVES
document.getElementById('import-btn').addEventListener('click', () => {
  document.getElementById('import-file').click();
});

document.getElementById('import-file').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const content = await file.text();
    const newEleves = JSON.parse(content);
    let ajoutés = 0;

    newEleves.forEach(el => {
      const existe = Array.from(document.querySelectorAll('.student-card')).some(card =>
        card.innerText.includes(el.prenom) && card.innerText.includes(el.nom)
      );

      if (!existe) {
        const card = document.createElement('div');
        card.classList.add('student-card');
        card.innerHTML = `
          <h3>${el.prenom} ${el.nom}</h3>
          <p class="classe">${el.classe}</p>
          <p class="naissance">${el.naissance}</p>
          <p class="commentaire">${el.commentaire}</p>
        `;
        document.querySelector('.student-list').appendChild(card);
        ajoutés++;
      }
    });

    showToast(`✅ ${ajoutés} élève(s) ajouté(s) avec succès.`);
  } catch (e) {
    showToast('❌ Erreur lors de l\'import du fichier.');
    console.error(e);
  }
}); 