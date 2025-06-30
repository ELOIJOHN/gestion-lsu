/**
 * LSU École du Cap - Gestionnaire de Données
 * Système complet de persistance, import/export et gestion des données
 */

class LSUDataManager {
    constructor() {
        this.storageKey = 'lsu_ecole_cap_data';
        this.settingsKey = 'lsu_ecole_cap_settings';
        this.backupKey = 'lsu_ecole_cap_backup';
        
        // Structure des données
        this.data = {
            eleves: [],
            commentaires: [],
            photos: {},
            settings: this.getDefaultSettings(),
            stats: {
                lastUpdate: new Date().toISOString(),
                version: '1.0.0'
            }
        };
        
        this.init();
    }
    
    /**
     * Initialisation du gestionnaire
     */
    init() {
        console.log('🚀 Initialisation du gestionnaire de données LSU...');
        
        // Charger les données existantes
        this.loadData();
        
        // Créer un backup automatique
        this.createBackup();
        
        // Sauvegarder automatiquement toutes les 30 secondes
        setInterval(() => this.autoSave(), 30000);
        
        console.log('✅ Gestionnaire de données initialisé');
    }
    
    /**
     * Paramètres par défaut
     */
    getDefaultSettings() {
        return {
            ai: {
                enabled: true,
                url: 'http://localhost:11434/api/generate',
                model: 'mistral',
                temperature: 0.7,
                maxTokens: 200
            },
            n8n: {
                enabled: false,
                url: '',
                webhook: ''
            },
            ui: {
                theme: 'light',
                language: 'fr',
                autoSave: true
            },
            export: {
                format: 'json',
                includePhotos: true,
                includeStats: true
            }
        };
    }
    
    /**
     * Charger les données depuis localStorage
     */
    loadData() {
        try {
            // Charger les données principales
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const parsed = JSON.parse(savedData);
                this.data = { ...this.data, ...parsed };
            }
            
            // Charger les paramètres
            const savedSettings = localStorage.getItem(this.settingsKey);
            if (savedSettings) {
                this.data.settings = { ...this.data.settings, ...JSON.parse(savedSettings) };
            }
            
            // Migration des données si nécessaire
            this.migrateData();
            
            console.log(`📊 Données chargées: ${this.data.eleves.length} élèves, ${this.data.commentaires.length} commentaires`);
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement des données:', error);
            this.showNotification('Erreur lors du chargement des données', 'error');
        }
    }
    
    /**
     * Sauvegarder les données dans localStorage
     */
    saveData() {
        try {
            // Mettre à jour les statistiques
            this.data.stats.lastUpdate = new Date().toISOString();
            
            // Sauvegarder les données principales
            localStorage.setItem(this.storageKey, JSON.stringify({
                eleves: this.data.eleves,
                commentaires: this.data.commentaires,
                photos: this.data.photos,
                stats: this.data.stats
            }));
            
            // Sauvegarder les paramètres séparément
            localStorage.setItem(this.settingsKey, JSON.stringify(this.data.settings));
            
            console.log('💾 Données sauvegardées');
            
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }
    
    /**
     * Sauvegarde automatique
     */
    autoSave() {
        if (this.data.settings.ui.autoSave) {
            this.saveData();
        }
    }
    
    /**
     * Créer un backup
     */
    createBackup() {
        try {
            const backup = {
                data: this.data,
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            };
            
            localStorage.setItem(this.backupKey, JSON.stringify(backup));
            console.log('🔄 Backup créé');
            
        } catch (error) {
            console.error('❌ Erreur lors de la création du backup:', error);
        }
    }
    
    /**
     * Restaurer depuis un backup
     */
    restoreFromBackup() {
        try {
            const backup = localStorage.getItem(this.backupKey);
            if (backup) {
                const parsed = JSON.parse(backup);
                this.data = parsed.data;
                this.saveData();
                this.showNotification('Backup restauré avec succès', 'success');
                return true;
            }
        } catch (error) {
            console.error('❌ Erreur lors de la restauration:', error);
            this.showNotification('Erreur lors de la restauration', 'error');
        }
        return false;
    }
    
    /**
     * Migration des données
     */
    migrateData() {
        const currentVersion = '1.0.0';
        
        if (this.data.stats.version !== currentVersion) {
            console.log(`🔄 Migration des données de ${this.data.stats.version} vers ${currentVersion}`);
            
            // Ajouter des champs manquants
            this.data.eleves.forEach(eleve => {
                if (!eleve.id) eleve.id = this.generateId();
                if (!eleve.dateCreation) eleve.dateCreation = new Date().toISOString();
            });
            
            this.data.commentaires.forEach(commentaire => {
                if (!commentaire.id) commentaire.id = this.generateId();
                if (!commentaire.dateCreation) commentaire.dateCreation = new Date().toISOString();
            });
            
            this.data.stats.version = currentVersion;
            this.saveData();
        }
    }
    
    /**
     * Gestion des élèves
     */
    addEleve(eleveData) {
        const eleve = {
            id: this.generateId(),
            ...eleveData,
            dateCreation: new Date().toISOString(),
            dateModification: new Date().toISOString()
        };
        
        this.data.eleves.push(eleve);
        this.saveData();
        this.showNotification('Élève ajouté avec succès', 'success');
        
        return eleve;
    }
    
    updateEleve(id, eleveData) {
        const index = this.data.eleves.findIndex(e => e.id === id);
        if (index !== -1) {
            this.data.eleves[index] = {
                ...this.data.eleves[index],
                ...eleveData,
                dateModification: new Date().toISOString()
            };
            this.saveData();
            this.showNotification('Élève modifié avec succès', 'success');
            return this.data.eleves[index];
        }
        return null;
    }
    
    deleteEleve(id) {
        const index = this.data.eleves.findIndex(e => e.id === id);
        if (index !== -1) {
            this.data.eleves.splice(index, 1);
            
            // Supprimer les commentaires associés
            this.data.commentaires = this.data.commentaires.filter(c => c.eleveId !== id);
            
            this.saveData();
            this.showNotification('Élève supprimé avec succès', 'success');
            return true;
        }
        return false;
    }
    
    getEleve(id) {
        return this.data.eleves.find(e => e.id === id);
    }
    
    getEleves(filters = {}) {
        let eleves = [...this.data.eleves];
        
        // Filtres
        if (filters.classe) {
            eleves = eleves.filter(e => e.classe === filters.classe);
        }
        
        if (filters.search) {
            const search = filters.search.toLowerCase();
            eleves = eleves.filter(e => 
                e.prenom.toLowerCase().includes(search) ||
                e.nom.toLowerCase().includes(search)
            );
        }
        
        // Tri
        if (filters.sortBy) {
            eleves.sort((a, b) => {
                if (filters.sortBy === 'nom') {
                    return a.nom.localeCompare(b.nom);
                }
                if (filters.sortBy === 'classe') {
                    return a.classe.localeCompare(b.classe);
                }
                return 0;
            });
        }
        
        return eleves;
    }
    
    /**
     * Gestion des commentaires
     */
    addCommentaire(commentaireData) {
        const commentaire = {
            id: this.generateId(),
            ...commentaireData,
            dateCreation: new Date().toISOString()
        };
        
        this.data.commentaires.push(commentaire);
        this.saveData();
        
        return commentaire;
    }
    
    getCommentaires(filters = {}) {
        let commentaires = [...this.data.commentaires];
        
        if (filters.eleveId) {
            commentaires = commentaires.filter(c => c.eleveId === filters.eleveId);
        }
        
        if (filters.niveau) {
            commentaires = commentaires.filter(c => c.niveau === filters.niveau);
        }
        
        // Tri par date (plus récent en premier)
        commentaires.sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
        
        return commentaires;
    }
    
    /**
     * Gestion des photos
     */
    savePhoto(classe, photoData) {
        this.data.photos[classe] = {
            data: photoData,
            dateUpload: new Date().toISOString()
        };
        this.saveData();
        this.showNotification(`Photo de la classe ${classe} sauvegardée`, 'success');
    }
    
    getPhoto(classe) {
        return this.data.photos[classe];
    }
    
    deletePhoto(classe) {
        if (this.data.photos[classe]) {
            delete this.data.photos[classe];
            this.saveData();
            this.showNotification(`Photo de la classe ${classe} supprimée`, 'success');
            return true;
        }
        return false;
    }
    
    /**
     * Gestion des paramètres
     */
    updateSettings(newSettings) {
        this.data.settings = { ...this.data.settings, ...newSettings };
        this.saveData();
        this.showNotification('Paramètres mis à jour', 'success');
    }
    
    getSettings() {
        return this.data.settings;
    }
    
    /**
     * Export des données
     */
    exportData(options = {}) {
        const exportData = {
            eleves: this.data.eleves,
            commentaires: this.data.commentaires,
            settings: this.data.settings,
            stats: this.data.stats,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        // Inclure les photos si demandé
        if (options.includePhotos !== false) {
            exportData.photos = this.data.photos;
        }
        
        // Inclure les statistiques si demandé
        if (options.includeStats !== false) {
            exportData.stats = this.data.stats;
        }
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lsu_ecole_cap_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Données exportées avec succès', 'success');
    }
    
    /**
     * Import des données
     */
    async importData(file) {
        try {
            const text = await file.text();
            const importedData = JSON.parse(text);
            
            // Validation des données
            if (!this.validateImportData(importedData)) {
                throw new Error('Format de données invalide');
            }
            
            // Fusion des données
            if (importedData.eleves) {
                this.data.eleves = importedData.eleves;
            }
            
            if (importedData.commentaires) {
                this.data.commentaires = importedData.commentaires;
            }
            
            if (importedData.photos) {
                this.data.photos = importedData.photos;
            }
            
            if (importedData.settings) {
                this.data.settings = { ...this.data.settings, ...importedData.settings };
            }
            
            this.saveData();
            this.showNotification('Données importées avec succès', 'success');
            
            return true;
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'import:', error);
            this.showNotification('Erreur lors de l\'import des données', 'error');
            return false;
        }
    }
    
    /**
     * Validation des données d'import
     */
    validateImportData(data) {
        return data && (
            Array.isArray(data.eleves) ||
            Array.isArray(data.commentaires) ||
            typeof data.photos === 'object' ||
            typeof data.settings === 'object'
        );
    }
    
    /**
     * Nettoyage des données
     */
    clearAllData() {
        if (confirm('Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible.')) {
            this.data = {
                eleves: [],
                commentaires: [],
                photos: {},
                settings: this.getDefaultSettings(),
                stats: {
                    lastUpdate: new Date().toISOString(),
                    version: '1.0.0'
                }
            };
            
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.settingsKey);
            
            this.showNotification('Toutes les données ont été effacées', 'warning');
            return true;
        }
        return false;
    }
    
    /**
     * Statistiques
     */
    getStats() {
        return {
            totalEleves: this.data.eleves.length,
            totalCommentaires: this.data.commentaires.length,
            totalPhotos: Object.keys(this.data.photos).length,
            elevesParClasse: this.getElevesParClasse(),
            derniersCommentaires: this.data.commentaires.slice(-5).reverse(),
            dateDerniereModification: this.data.stats.lastUpdate
        };
    }
    
    getElevesParClasse() {
        const stats = {};
        this.data.eleves.forEach(eleve => {
            stats[eleve.classe] = (stats[eleve.classe] || 0) + 1;
        });
        return stats;
    }
    
    /**
     * Utilitaires
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    showNotification(message, type = 'info') {
        // Intégration avec le système de notifications existant
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
    
    /**
     * Sauvegarde dans le cloud (optionnel)
     */
    async saveToCloud() {
        // Implémentation future pour sauvegarde cloud
        console.log('☁️ Sauvegarde cloud non implémentée');
    }
    
    /**
     * Synchronisation (optionnel)
     */
    async syncData() {
        // Implémentation future pour synchronisation
        console.log('🔄 Synchronisation non implémentée');
    }
}

// Instance globale
const lsuDataManager = new LSUDataManager();

// Export pour utilisation dans d'autres modules
window.lsuDataManager = lsuDataManager; 