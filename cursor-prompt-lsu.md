# 🤖 Prompt pour Cursor AI - LSU École du Cap

## 🎯 **Prompt Principal pour Cursor**

```
Créé un système complet de gestion LSU (Livret Scolaire Unique) pour l'école primaire appelé "LSU École du Cap". 

CONTEXTE:
- Application web complète pour générer des commentaires d'évaluation
- Public cible: Enseignants du primaire (CP à CM2)
- Fonctionnalités: Générateur IA, gestion élèves, photos classes, paramètres

STRUCTURE TECHNIQUE REQUISE:
```
lsu-ecole-cap/
├── index.html              # Page principale unifiée
├── package.json           # Configuration npm
├── README.md              # Documentation
├── src/
│   ├── css/
│   │   ├── main.css      # Styles principaux
│   │   └── components.css # Composants UI
│   ├── js/
│   │   ├── app.js        # Application principale
│   │   ├── lsu-generator.js # Moteur de génération
│   │   └── data-manager.js  # Gestion données
│   └── assets/
│       ├── images/
│       └── icons/
└── docs/
    └── guide-utilisation.md
```

FONCTIONNALITÉS REQUISES:

1. **Navigation Unifiée (5 sections)**
   - 🏠 Accueil (dashboard avec stats)
   - 🧠 Générateur LSU (formulaire + résultats)
   - 👥 Gestion Élèves (CRUD complet)
   - 📷 Photos Classes (upload pour CP/CE1/CE2/CM1/CM2)
   - ⚙️ Paramètres (IA locale + N8N)

2. **Générateur LSU Intelligent**
   - 4 niveaux d'évaluation: insuffisant/fragile/satisfaisant/excellent
   - 6 points forts: participation/autonomie/progrès/créativité/écoute/entraide
   - Templates de commentaires adaptatifs par niveau
   - Intégration IA locale (Ollama) + fallback intelligent
   - Export/copie/variantes des commentaires

3. **Gestion Élèves Complète**
   - Ajout/modification/suppression élèves
   - Données: prénom, nom, niveau, date naissance, notes
   - Sélection rapide pour générateur LSU
   - Sauvegarde localStorage

4. **Interface Moderne**
   - Design: Bootstrap 5 + CSS Grid/Flexbox
   - Couleurs: Primaire #4f46e5, Succès #10b981, Attention #f59e0b
   - Responsive complet (mobile/tablette/desktop)
   - Animations CSS fluides
   - Notifications toast

5. **Persistance Données**
   - localStorage pour toutes les données
   - Import/export JSON complet
   - Sauvegarde automatique paramètres
   - Photos classes stockées en base64

STACK TECHNIQUE:
- HTML5 sémantique
- CSS3 avec variables personnalisées
- JavaScript ES6+ vanilla
- Bootstrap 5.3.0
- Font Awesome 6.5.0
- Google Fonts (Inter)

CONTRAINTES:
- Aucune dépendance externe obligatoire
- Fonctionnel en mode offline
- Compatible tous navigateurs modernes
- Temps de chargement < 2 secondes
- Code maintenable et commenté

EXEMPLE DE GÉNÉRATION LSU:
Input: Léa, CE1, 2ème trimestre, niveau satisfaisant, points forts: participation + autonomie
Output: "Léa réalise un 2ème trimestre satisfaisant en participant activement aux activités et en faisant preuve d'une bonne autonomie. Elle progresse de manière constante et montre un réel investissement. Je l'encourage à continuer sur cette lancée positive."

CONFIGURATION IA:
- URL par défaut: http://localhost:11434/api/generate
- Modèles supportés: mistral, llama2, codellama
- Fallback local si IA indisponible
- Format prompt: contexte + niveau + points forts + consignes

DÉMARRAGE DEMANDÉ:
1. Créer la structure de fichiers
2. Générer index.html avec interface complète
3. Séparer CSS et JS dans leurs fichiers
4. Configurer package.json avec scripts
5. Tester avec Live Server

Commence par créer l'index.html principal avec toutes les fonctionnalités, puis on organisera le code en modules.
```

---

## 🔧 **Prompts Spécifiques par Composant**

### **Prompt 1: Interface Principale**
```
Créé l'interface HTML principale pour LSU École du Cap avec:

NAVIGATION:
- Navbar Bootstrap sticky avec 5 sections
- Logo École du Cap + indicateur de connexion
- Menu responsive avec hamburger mobile

SECTIONS:
1. Accueil: Dashboard avec cartes statistiques + actions rapides
2. Générateur: Formulaire gauche + résultats droite + exemples
3. Élèves: Liste + modal ajout/édition + actions (sélectionner/modifier/supprimer)
4. Photos: Grille 5 classes avec upload + aperçu
5. Paramètres: Configuration IA + N8N + import/export données

DESIGN:
- Couleurs: --primary-color: #4f46e5, --secondary-color: #10b981
- Cartes avec shadow + hover effects
- Boutons avec icônes Font Awesome
- Formulaires avec validation visuelle
- Animations CSS subtiles

Include le CSS inline pour l'instant, on séparera après.
```

### **Prompt 2: Générateur LSU**
```
Développe le moteur de génération de commentaires LSU avec:

LOGIQUE:
- Templates de commentaires par niveau (insuffisant/fragile/satisfaisant/excellent)
- Phrases d'intro + points forts + encouragements
- Variables: {name}, {period}, {level}
- Sélection aléatoire dans les templates

INTEGRATION IA:
- Fonction async pour appel Ollama
- Prompt structuré: "Génère commentaire LSU pour {name}, niveau {level}..."
- Fallback local si IA non disponible
- Gestion erreurs + retry

TEMPLATES EXEMPLE:
```javascript
const templates = {
  excellent: {
    starters: ["{name} réalise un {period} remarquable.", ...],
    strengths: {
      participation: "en s'investissant pleinement",
      autonomie: "en faisant preuve d'autonomie exemplaire"
    },
    encouragements: ["Félicitations pour ce parcours!", ...]
  }
}
```

FONCTIONS:
- generateComment() : main function
- generateWithAI() : appel IA
- generateLocal() : fallback
- displayComment() : affichage résultat
```

### **Prompt 3: Gestion des Données**
```
Créé le système de gestion des données avec:

STUDENT MANAGER:
- Classe Student avec propriétés: firstName, lastName, level, birthDate, notes
- CRUD: addStudent(), updateStudent(), deleteStudent(), getStudents()
- Validation des données + gestion erreurs
- Sauvegarde automatique localStorage

DATA PERSISTENCE:
- saveData(key, data) : sauvegarde générique
- loadData(key) : chargement avec fallback
- exportData() : export JSON complet
- importData() : import avec validation

STRUCTURE DONNÉES:
```javascript
const dataStructure = {
  students: [
    {
      id: uuid,
      firstName: string,
      lastName: string,
      level: 'CP'|'CE1'|'CE2'|'CM1'|'CM2',
      birthDate: date,
      notes: string,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ],
  settings: {
    aiUrl: string,
    aiModel: string,
    n8nUrl: string,
    apiKey: string
  },
  stats: {
    generatedCount: number,
    lastExport: timestamp
  }
}
```

FEATURES:
- Auto-sauvegarde toutes les 30 secondes
- Import/export avec validation
- Migration de données entre versions
- Backup automatique avant modifications importantes
```

### **Prompt 4: Configuration Package.json**
```
Créé un package.json professionnel pour le projet LSU École du Cap:

SCRIPTS:
- "start": serveur de développement local
- "dev": mode développement avec watch
- "build": minification + optimisation production
- "deploy": déploiement GitHub Pages
- "test": tests automatisés (optionnel)

DEPENDENCIES:
- live-server: serveur local
- concurrently: scripts parallèles
- gh-pages: déploiement GitHub
- prettier: formatage code

CONFIGURATION:
- Nom: "lsu-ecole-cap"
- Version: "1.0.0"
- Description complète
- Keywords: ["lsu", "education", "école", "primaire"]
- Repository GitHub
- License MIT

EXEMPLE SCRIPT START:
```json
{
  "scripts": {
    "start": "live-server --port=3000 --open=index.html --no-css-inject",
    "dev": "concurrently \"live-server --port=3000\" \"npm run watch:css\"",
    "build": "npm run minify:css && npm run minify:js"
  }
}
```
```

### **Prompt 5: Tests et Déploiement**
```
Setup les tests et le déploiement pour LSU École du Cap:

TESTS:
- Tests unitaires pour générateur LSU
- Tests intégration pour CRUD élèves
- Tests UI avec Playwright (optionnel)
- Validation des données export/import

DÉPLOIEMENT:
- Configuration GitHub Pages
- Optimisation pour production
- Compression des assets
- Service Worker pour cache offline

MONITORING:
- Analytics simples (optionnel)
- Error tracking localStorage
- Performance metrics
- User feedback collection

GITHUB ACTIONS (optionnel):
```yaml
name: Deploy LSU École du Cap
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm ci && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

CHECKLIST PRODUCTION:
- ✅ Minification CSS/JS
- ✅ Optimisation images
- ✅ Tests cross-browser
- ✅ Documentation utilisateur
- ✅ Guide installation enseignants
```

---

## 🎯 **Prompt de Démarrage Rapide**

```
Bonjour Cursor ! Je veux créer un système LSU (Livret Scolaire Unique) pour l'École du Cap.

DEMANDE IMMÉDIATE:
1. Créé la structure de dossiers complète
2. Généré un index.html fonctionnel avec toutes les sections
3. Inclus le CSS et JS inline pour commencer
4. Ajoute un package.json basique
5. Créé un README.md avec les instructions

FONCTIONNALITÉS CRITIQUES:
- Générateur de commentaires avec IA + fallback local
- Gestion d'élèves avec localStorage
- Upload photos de classes
- Interface moderne responsive
- Export/import des données

START NOW: Commence par créer index.html avec l'interface complète, on optimisera après !
```

---

## 🚀 **Utilisation dans Cursor**

1. **Ouvrir Cursor**
2. **Ctrl+K** pour ouvrir le chat IA
3. **Copier/coller un des prompts ci-dessus**
4. **Suivre les instructions générées**
5. **Itérer avec des prompts spécifiques**

**Astuce**: Commencez par le "Prompt de Démarrage Rapide" puis utilisez les prompts spécifiques pour affiner chaque composant ! 🎯