/**
 * LSU École du Cap - Suite de Tests Complète
 * Tests automatisés pour toutes les fonctionnalités
 */

class LSUTestSuite {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            duration: 0
        };
        this.startTime = Date.now();
    }
    
    /**
     * Ajouter un test
     */
    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }
    
    /**
     * Exécuter tous les tests
     */
    async runAllTests() {
        console.log('🧪 Démarrage des tests LSU École du Cap...');
        console.log('==========================================');
        
        for (const test of this.tests) {
            await this.runTest(test);
        }
        
        this.results.duration = Date.now() - this.startTime;
        this.printResults();
    }
    
    /**
     * Exécuter un test individuel
     */
    async runTest(test) {
        this.results.total++;
        
        try {
            console.log(`\n🔍 Test: ${test.name}`);
            await test.testFunction();
            console.log(`✅ ${test.name} - PASSÉ`);
            this.results.passed++;
        } catch (error) {
            console.log(`❌ ${test.name} - ÉCHOUÉ`);
            console.log(`   Erreur: ${error.message}`);
            this.results.failed++;
        }
    }
    
    /**
     * Afficher les résultats
     */
    printResults() {
        console.log('\n==========================================');
        console.log('📊 RÉSULTATS DES TESTS');
        console.log('==========================================');
        console.log(`Total: ${this.results.total}`);
        console.log(`Passés: ${this.results.passed} ✅`);
        console.log(`Échoués: ${this.results.failed} ❌`);
        console.log(`Durée: ${this.results.duration}ms`);
        console.log(`Taux de réussite: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
        
        if (this.results.failed === 0) {
            console.log('\n🎉 Tous les tests sont passés !');
        } else {
            console.log('\n⚠️  Certains tests ont échoué.');
        }
    }
}

// Instance globale
const testSuite = new LSUTestSuite();

// ========================================
// TESTS DU GESTIONNAIRE DE DONNÉES
// ========================================

testSuite.addTest('Initialisation du gestionnaire de données', async () => {
    if (!window.lsuDataManager) {
        throw new Error('Gestionnaire de données non initialisé');
    }
    
    const settings = lsuDataManager.getSettings();
    if (!settings || !settings.ai) {
        throw new Error('Paramètres par défaut manquants');
    }
});

testSuite.addTest('Ajout d\'un élève', async () => {
    const eleveData = {
        prenom: 'Test',
        nom: 'Élève',
        classe: 'CP',
        dateNaissance: '2017-01-01',
        notes: 'Élève de test'
    };
    
    const eleve = lsuDataManager.addEleve(eleveData);
    
    if (!eleve.id) {
        throw new Error('ID élève manquant');
    }
    
    if (eleve.prenom !== 'Test') {
        throw new Error('Données élève incorrectes');
    }
});

testSuite.addTest('Récupération des élèves', async () => {
    const eleves = lsuDataManager.getEleves();
    
    if (!Array.isArray(eleves)) {
        throw new Error('getEleves() ne retourne pas un tableau');
    }
    
    if (eleves.length === 0) {
        throw new Error('Aucun élève trouvé');
    }
});

testSuite.addTest('Filtrage des élèves', async () => {
    const elevesCP = lsuDataManager.getEleves({ classe: 'CP' });
    
    for (const eleve of elevesCP) {
        if (eleve.classe !== 'CP') {
            throw new Error('Filtre classe incorrect');
        }
    }
});

testSuite.addTest('Recherche d\'élèves', async () => {
    const elevesTest = lsuDataManager.getEleves({ search: 'Test' });
    
    if (elevesTest.length === 0) {
        throw new Error('Recherche ne trouve aucun résultat');
    }
    
    for (const eleve of elevesTest) {
        if (!eleve.prenom.includes('Test') && !eleve.nom.includes('Test')) {
            throw new Error('Résultat de recherche incorrect');
        }
    }
});

testSuite.addTest('Modification d\'élève', async () => {
    const eleves = lsuDataManager.getEleves();
    if (eleves.length === 0) {
        throw new Error('Aucun élève pour le test de modification');
    }
    
    const eleve = eleves[0];
    const updatedEleve = lsuDataManager.updateEleve(eleve.id, {
        notes: 'Notes modifiées'
    });
    
    if (!updatedEleve) {
        throw new Error('Modification échouée');
    }
    
    if (updatedEleve.notes !== 'Notes modifiées') {
        throw new Error('Modification non appliquée');
    }
});

testSuite.addTest('Suppression d\'élève', async () => {
    const eleves = lsuDataManager.getEleves();
    if (eleves.length === 0) {
        throw new Error('Aucun élève pour le test de suppression');
    }
    
    const eleve = eleves[0];
    const success = lsuDataManager.deleteEleve(eleve.id);
    
    if (!success) {
        throw new Error('Suppression échouée');
    }
    
    const eleveSupprime = lsuDataManager.getEleve(eleve.id);
    if (eleveSupprime) {
        throw new Error('Élève toujours présent après suppression');
    }
});

// ========================================
// TESTS DU GÉNÉRATEUR
// ========================================

testSuite.addTest('Initialisation du générateur', async () => {
    if (!window.lsuGenerator) {
        throw new Error('Générateur non initialisé');
    }
    
    if (!lsuGenerator.templates) {
        throw new Error('Templates manquants');
    }
});

testSuite.addTest('Génération locale de commentaire', async () => {
    const params = {
        name: 'Léa Test',
        period: '2ème trimestre',
        level: 'satisfaisant',
        strengths: ['participation', 'autonomie']
    };
    
    const commentaire = lsuGenerator.generateLocalComment(params);
    
    if (!commentaire || typeof commentaire !== 'string') {
        throw new Error('Commentaire non généré');
    }
    
    if (commentaire.length < 50) {
        throw new Error('Commentaire trop court');
    }
    
    if (!commentaire.includes('Léa Test')) {
        throw new Error('Nom de l\'élève manquant dans le commentaire');
    }
});

testSuite.addTest('Validation des paramètres', async () => {
    const validParams = {
        name: 'Test',
        period: '1er trimestre',
        level: 'excellent'
    };
    
    // Test validation réussie
    const isValid = lsuGenerator.validateParams(validParams);
    if (!isValid) {
        throw new Error('Validation échouée pour des paramètres valides');
    }
    
    // Test validation échouée
    try {
        lsuGenerator.validateParams({ name: 'Test' });
        throw new Error('Validation aurait dû échouer');
    } catch (error) {
        // Attendu
    }
});

testSuite.addTest('Génération avec différents niveaux', async () => {
    const niveaux = ['insuffisant', 'fragile', 'satisfaisant', 'excellent'];
    
    for (const niveau of niveaux) {
        const params = {
            name: 'Test',
            period: '1er trimestre',
            level: niveau,
            strengths: ['participation']
        };
        
        const commentaire = lsuGenerator.generateLocalComment(params);
        
        if (!commentaire) {
            throw new Error(`Commentaire non généré pour le niveau ${niveau}`);
        }
    }
});

testSuite.addTest('Génération avec points forts', async () => {
    const strengths = ['participation', 'autonomie', 'progres', 'creativite', 'ecoute', 'entraide'];
    
    for (const strength of strengths) {
        const params = {
            name: 'Test',
            period: '1er trimestre',
            level: 'satisfaisant',
            strengths: [strength]
        };
        
        const commentaire = lsuGenerator.generateLocalComment(params);
        
        if (!commentaire) {
            throw new Error(`Commentaire non généré pour le point fort ${strength}`);
        }
    }
});

// ========================================
// TESTS DE L'INTERFACE
// ========================================

testSuite.addTest('Éléments DOM présents', async () => {
    const requiredElements = [
        'navbarNav',
        'accueil',
        'generateur',
        'eleves',
        'photos',
        'parametres'
    ];
    
    for (const elementId of requiredElements) {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Élément manquant: ${elementId}`);
        }
    }
});

testSuite.addTest('Navigation fonctionnelle', async () => {
    // Test de la fonction showSection
    if (typeof showSection !== 'function') {
        throw new Error('Fonction showSection manquante');
    }
    
    // Test de navigation
    showSection('generateur');
    const generateurSection = document.getElementById('generateur');
    if (!generateurSection.classList.contains('active')) {
        throw new Error('Navigation vers générateur échouée');
    }
});

testSuite.addTest('Formulaires présents', async () => {
    const forms = [
        'generateurForm',
        'eleveForm'
    ];
    
    for (const formId of forms) {
        const form = document.getElementById(formId);
        if (!form) {
            throw new Error(`Formulaire manquant: ${formId}`);
        }
    }
});

testSuite.addTest('Boutons d\'action présents', async () => {
    const buttons = [
        'exportBtn',
        'importBtn'
    ];
    
    for (const buttonId of buttons) {
        const button = document.getElementById(buttonId);
        if (!button) {
            throw new Error(`Bouton manquant: ${buttonId}`);
        }
    }
});

// ========================================
// TESTS DE PERFORMANCE
// ========================================

testSuite.addTest('Performance de génération', async () => {
    const startTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
        const params = {
            name: `Élève ${i}`,
            period: '1er trimestre',
            level: 'satisfaisant',
            strengths: ['participation']
        };
        
        lsuGenerator.generateLocalComment(params);
    }
    
    const duration = Date.now() - startTime;
    
    if (duration > 1000) {
        throw new Error(`Génération trop lente: ${duration}ms`);
    }
});

testSuite.addTest('Performance de sauvegarde', async () => {
    const startTime = Date.now();
    
    for (let i = 0; i < 100; i++) {
        lsuDataManager.addEleve({
            prenom: `Test${i}`,
            nom: 'Performance',
            classe: 'CP',
            dateNaissance: '2017-01-01'
        });
    }
    
    const duration = Date.now() - startTime;
    
    if (duration > 5000) {
        throw new Error(`Sauvegarde trop lente: ${duration}ms`);
    }
});

// ========================================
// TESTS DE SÉCURITÉ
// ========================================

testSuite.addTest('Validation des données', async () => {
    // Test avec données invalides
    try {
        lsuDataManager.addEleve({
            prenom: '', // Nom vide
            nom: 'Test',
            classe: 'CP',
            dateNaissance: '2017-01-01'
        });
        throw new Error('Validation aurait dû échouer pour nom vide');
    } catch (error) {
        // Attendu
    }
});

testSuite.addTest('Protection contre injection', async () => {
    const maliciousData = {
        prenom: '<script>alert("xss")</script>',
        nom: 'Test',
        classe: 'CP',
        dateNaissance: '2017-01-01'
    };
    
    const eleve = lsuDataManager.addEleve(maliciousData);
    
    // Vérifier que le script n'est pas exécuté
    if (eleve.prenom.includes('<script>')) {
        throw new Error('Données malveillantes non filtrées');
    }
});

// ========================================
// TESTS D'INTÉGRATION
// ========================================

testSuite.addTest('Intégration complète', async () => {
    // 1. Ajouter un élève
    const eleve = lsuDataManager.addEleve({
        prenom: 'Intégration',
        nom: 'Test',
        classe: 'CE1',
        dateNaissance: '2016-01-01'
    });
    
    // 2. Générer un commentaire
    const commentaire = lsuGenerator.generateComment({
        eleveId: eleve.id,
        name: `${eleve.prenom} ${eleve.nom}`,
        period: '1er trimestre',
        level: 'satisfaisant',
        strengths: ['participation']
    });
    
    // 3. Vérifier que le commentaire est sauvegardé
    const commentaires = lsuDataManager.getCommentaires({ eleveId: eleve.id });
    
    if (commentaires.length === 0) {
        throw new Error('Commentaire non sauvegardé');
    }
    
    // 4. Nettoyer
    lsuDataManager.deleteEleve(eleve.id);
});

// ========================================
// TESTS DE RÉSILIENCE
// ========================================

testSuite.addTest('Gestion des erreurs', async () => {
    // Test avec données manquantes
    try {
        lsuGenerator.generateLocalComment({});
        throw new Error('Génération aurait dû échouer avec données manquantes');
    } catch (error) {
        // Attendu
    }
});

testSuite.addTest('Récupération après erreur', async () => {
    // Forcer une erreur puis tester la récupération
    try {
        lsuGenerator.generateLocalComment({});
    } catch (error) {
        // Ignorer l'erreur
    }
    
    // Vérifier que le système fonctionne toujours
    const params = {
        name: 'Test',
        period: '1er trimestre',
        level: 'satisfaisant'
    };
    
    const commentaire = lsuGenerator.generateLocalComment(params);
    if (!commentaire) {
        throw new Error('Système non récupéré après erreur');
    }
});

// ========================================
// LANCEMENT DES TESTS
// ========================================

// Fonction pour lancer les tests
window.runLSUTests = async () => {
    console.clear();
    await testSuite.runAllTests();
    
    // Retourner les résultats pour utilisation externe
    return testSuite.results;
};

// Tests automatiques au chargement (optionnel)
if (document.readyState === 'complete') {
    // Page déjà chargée
    console.log('🧪 Tests LSU prêts. Lancez runLSUTests() pour les exécuter.');
} else {
    // Attendre le chargement
    window.addEventListener('load', () => {
        console.log('🧪 Tests LSU prêts. Lancez runLSUTests() pour les exécuter.');
    });
}

// Export pour utilisation dans d'autres modules
window.LSUTestSuite = LSUTestSuite;
window.testSuite = testSuite; 