/**
 * LSU École du Cap - Moteur de Génération de Commentaires
 * Système intelligent avec templates et intégration IA locale
 */

class LSUGenerator {
    constructor() {
        this.templates = this.initializeTemplates();
        this.aiSettings = {
            url: 'http://localhost:11434/api/generate',
            model: 'mistral',
            temperature: 0.7,
            maxTokens: 200,
            retryAttempts: 2
        };
        
        this.init();
    }
    
    /**
     * Initialisation
     */
    init() {
        console.log('🧠 Initialisation du générateur LSU...');
        
        // Charger les paramètres IA depuis le gestionnaire de données
        if (window.lsuDataManager) {
            const settings = lsuDataManager.getSettings();
            this.aiSettings = { ...this.aiSettings, ...settings.ai };
        }
        
        console.log('✅ Générateur LSU initialisé');
    }
    
    /**
     * Templates de commentaires par niveau
     */
    initializeTemplates() {
        return {
            insuffisant: {
                starters: [
                    "{name} rencontre des difficultés ce {period}.",
                    "Le bilan de {name} pour ce {period} est insuffisant.",
                    "{name} a eu un parcours difficile durant ce {period}.",
                    "Les résultats de {name} ce {period} ne sont pas satisfaisants."
                ],
                strengths: {
                    participation: "la participation reste trop discrète",
                    autonomie: "l'autonomie doit être renforcée",
                    progres: "les progrès sont trop limités",
                    creativite: "la créativité n'est pas suffisamment exploitée",
                    ecoute: "l'écoute des consignes est à améliorer",
                    entraide: "l'entraide avec les camarades est rare"
                },
                encouragements: [
                    "Il est important de persévérer et de ne pas baisser les bras.",
                    "Un accompagnement renforcé est conseillé pour progresser.",
                    "Je l'encourage à redoubler d'efforts pour le trimestre prochain.",
                    "Des efforts réguliers permettront d'améliorer les résultats."
                ]
            },
            
            fragile: {
                starters: [
                    "{name} présente un {period} fragile.",
                    "Le parcours de {name} ce {period} reste fragile.",
                    "{name} a montré des signes de fragilité durant ce {period}.",
                    "Les résultats de {name} ce {period} sont fragiles."
                ],
                strengths: {
                    participation: "la participation est irrégulière",
                    autonomie: "l'autonomie commence à se développer",
                    progres: "des progrès sont visibles mais doivent se poursuivre",
                    creativite: "la créativité apparaît par moments",
                    ecoute: "l'écoute est en amélioration",
                    entraide: "l'entraide se manifeste ponctuellement"
                },
                encouragements: [
                    "Des efforts réguliers permettront de consolider les acquis.",
                    "Je l'encourage à poursuivre ses efforts pour progresser.",
                    "Un soutien adapté serait bénéfique pour renforcer les compétences.",
                    "La persévérance permettra d'améliorer les résultats."
                ]
            },
            
            satisfaisant: {
                starters: [
                    "{name} réalise un {period} satisfaisant.",
                    "Le bilan de {name} pour ce {period} est positif.",
                    "{name} progresse bien durant ce {period}.",
                    "Les résultats de {name} ce {period} sont satisfaisants."
                ],
                strengths: {
                    participation: "en participant activement aux activités",
                    autonomie: "en faisant preuve d'autonomie dans son travail",
                    progres: "en progressant de façon régulière",
                    creativite: "en développant sa créativité",
                    ecoute: "en écoutant attentivement les consignes",
                    entraide: "en aidant ses camarades avec bienveillance"
                },
                encouragements: [
                    "Je l'encourage à continuer sur cette lancée positive.",
                    "Bravo pour ce parcours, il faut poursuivre ainsi.",
                    "Les efforts fournis portent leurs fruits, continuez !",
                    "Ce niveau de travail est encourageant pour la suite."
                ]
            },
            
            excellent: {
                starters: [
                    "{name} réalise un {period} remarquable.",
                    "Le parcours de {name} ce {period} est excellent.",
                    "{name} excelle durant ce {period}.",
                    "Les résultats de {name} ce {period} sont exceptionnels."
                ],
                strengths: {
                    participation: "en s'investissant pleinement dans toutes les activités",
                    autonomie: "en faisant preuve d'autonomie exemplaire",
                    progres: "en progressant de façon exceptionnelle",
                    creativite: "en faisant preuve d'une grande créativité",
                    ecoute: "en étant toujours attentif(ve) et concentré(e)",
                    entraide: "en aidant généreusement ses camarades"
                },
                encouragements: [
                    "Félicitations pour ce parcours exemplaire !",
                    "Il faut maintenir ce niveau d'excellence.",
                    "C'est un exemple à suivre pour la classe.",
                    "Bravo pour ce travail remarquable !"
                ]
            }
        };
    }
    
    /**
     * Génération locale de commentaire
     */
    generateLocalComment(params) {
        const { name, period, level, strengths = [], observations = '' } = params;
        
        const template = this.templates[level];
        if (!template) {
            throw new Error(`Niveau inconnu: ${level}`);
        }
        
        // Sélection aléatoire des éléments
        const starter = this.randomPick(template.starters);
        const encouragement = this.randomPick(template.encouragements);
        
        // Construction du commentaire
        let comment = starter
            .replace('{name}', name)
            .replace('{period}', period);
        
        // Ajout des points forts
        if (strengths.length > 0) {
            const strengthsText = strengths
                .map(s => template.strengths[s])
                .filter(Boolean)
                .join(', ');
            
            if (strengthsText) {
                comment += ` ${strengthsText}.`;
            }
        }
        
        // Ajout des observations
        if (observations && observations.trim()) {
            comment += ` ${observations.trim()}.`;
        }
        
        // Ajout de l'encouragement
        comment += ` ${encouragement}`;
        
        return comment;
    }
    
    /**
     * Génération avec IA locale (Ollama)
     */
    async generateWithAI(params, retryCount = 0) {
        const { name, period, level, strengths = [], observations = '' } = params;
        
        // Construction du prompt
        const prompt = this.buildAIPrompt(params);
        
        try {
            const response = await fetch(this.aiSettings.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.aiSettings.model,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: this.aiSettings.temperature,
                        top_p: 0.9,
                        max_tokens: this.aiSettings.maxTokens
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data || !data.response) {
                throw new Error('Réponse IA vide ou invalide');
            }
            
            return data.response.trim();
            
        } catch (error) {
            console.warn(`❌ Erreur IA (tentative ${retryCount + 1}):`, error);
            
            // Retry si possible
            if (retryCount < this.aiSettings.retryAttempts) {
                console.log(`🔄 Nouvelle tentative...`);
                await this.delay(1000); // Attendre 1 seconde
                return this.generateWithAI(params, retryCount + 1);
            }
            
            // Fallback vers la génération locale
            console.log('🔄 Utilisation du fallback local');
            return this.generateLocalComment(params);
        }
    }
    
    /**
     * Construction du prompt pour l'IA
     */
    buildAIPrompt(params) {
        const { name, period, level, strengths = [], observations = '' } = params;
        
        const strengthsText = strengths.length > 0 
            ? strengths.join(', ') 
            : 'aucun point fort spécifique';
        
        return `Tu es un enseignant expérimenté qui rédige des commentaires d'évaluation pour le Livret Scolaire Unique (LSU) en école primaire.

Élève: ${name}
Période: ${period}
Niveau: ${level}
Points forts: ${strengthsText}
${observations ? `Observations: ${observations}` : ''}

Génère un commentaire LSU pour ${name} en respectant ces critères:
- Niveau de langage: ${level} (adapté au niveau d'évaluation)
- Ton: bienveillant et encourageant
- Longueur: 3-5 phrases maximum
- Style: naturel, sans formules répétitives
- Contenu: mentionner les points forts, donner des encouragements
- Format: phrase complète, ponctuation correcte

Commentaire LSU:`;
    }
    
    /**
     * Génération principale (avec choix IA/local)
     */
    async generateComment(params) {
        console.log('🧠 Génération de commentaire LSU...', params);
        
        // Vérifier si l'IA est activée
        const settings = window.lsuDataManager ? lsuDataManager.getSettings() : null;
        const aiEnabled = settings?.ai?.enabled ?? true;
        
        if (aiEnabled) {
            try {
                console.log('🤖 Tentative avec IA locale...');
                const comment = await this.generateWithAI(params);
                
                // Sauvegarder le commentaire
                if (window.lsuDataManager) {
                    lsuDataManager.addCommentaire({
                        eleveId: params.eleveId,
                        eleveNom: params.name,
                        contenu: comment,
                        niveau: params.level,
                        trimestre: params.period,
                        pointsForts: params.strengths,
                        observations: params.observations,
                        source: 'ai'
                    });
                }
                
                return comment;
                
            } catch (error) {
                console.error('❌ Erreur IA, utilisation du fallback local');
            }
        }
        
        // Génération locale
        console.log('📝 Génération locale...');
        const comment = this.generateLocalComment(params);
        
        // Sauvegarder le commentaire
        if (window.lsuDataManager) {
            lsuDataManager.addCommentaire({
                eleveId: params.eleveId,
                eleveNom: params.name,
                contenu: comment,
                niveau: params.level,
                trimestre: params.period,
                pointsForts: params.strengths,
                observations: params.observations,
                source: 'local'
            });
        }
        
        return comment;
    }
    
    /**
     * Génération de variante
     */
    async generateVariant(params) {
        console.log('🔄 Génération de variante...');
        
        // Modifier légèrement les paramètres pour créer une variante
        const variantParams = {
            ...params,
            // Changer aléatoirement quelques points forts
            strengths: this.shuffleArray([...params.strengths]).slice(0, Math.max(1, params.strengths.length - 1))
        };
        
        return this.generateComment(variantParams);
    }
    
    /**
     * Test de connexion IA
     */
    async testAIConnection() {
        try {
            const response = await fetch(this.aiSettings.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.aiSettings.model,
                    prompt: 'Test de connexion - LSU École du Cap',
                    stream: false,
                    options: { max_tokens: 10 }
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data && data.response ? true : false;
            }
            
            return false;
            
        } catch (error) {
            console.error('❌ Erreur test IA:', error);
            return false;
        }
    }
    
    /**
     * Utilitaires
     */
    randomPick(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Validation des paramètres
     */
    validateParams(params) {
        const required = ['name', 'period', 'level'];
        const missing = required.filter(field => !params[field]);
        
        if (missing.length > 0) {
            throw new Error(`Paramètres manquants: ${missing.join(', ')}`);
        }
        
        const validLevels = ['insuffisant', 'fragile', 'satisfaisant', 'excellent'];
        if (!validLevels.includes(params.level)) {
            throw new Error(`Niveau invalide: ${params.level}`);
        }
        
        return true;
    }
    
    /**
     * Mise à jour des paramètres IA
     */
    updateAISettings(newSettings) {
        this.aiSettings = { ...this.aiSettings, ...newSettings };
        
        // Sauvegarder dans le gestionnaire de données
        if (window.lsuDataManager) {
            lsuDataManager.updateSettings({
                ai: this.aiSettings
            });
        }
    }
}

// Instance globale
const lsuGenerator = new LSUGenerator();

// Export pour utilisation dans d'autres modules
window.lsuGenerator = lsuGenerator; 