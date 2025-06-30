# 🏫 LSU École du Cap - Gestionnaire Intelligent

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://johneloi.github.io/gestion-lsu/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-orange.svg)]()

## 📋 Description

**LSU École du Cap** est un système de gestion intelligent pour l'école primaire, spécialement conçu pour les enseignants du CP au CM2. Cette application web moderne facilite la gestion des élèves, la génération de commentaires d'évaluation LSU (Livret Scolaire Unique) et l'organisation des données pédagogiques.

## ✨ Fonctionnalités Principales

### 🎯 Gestion des Élèves
- **Ajout/Modification/Suppression** d'élèves
- **Recherche et filtrage** par classe
- **Import/Export** en CSV et JSON
- **Photos de classes** par niveau
- **Notes et observations** personnalisées

### 🤖 Générateur IA de Commentaires
- **Intégration IA locale** (Ollama)
- **Templates par niveau** (CP, CE1, CE2, CM1, CM2)
- **Points forts personnalisables**
- **Génération de variantes**
- **Sauvegarde automatique**

### 📊 Interface Moderne
- **Design responsive** Bootstrap 5
- **Navigation intuitive** avec sections dédiées
- **Notifications toast** en temps réel
- **Animations fluides** et transitions
- **Thème éducatif** professionnel

### 🔧 Paramètres Avancés
- **Configuration IA** (URL, modèle)
- **Intégration N8N** pour automatisation
- **Sauvegarde/restauration** complète
- **Export de données** multi-format

## 🚀 Démarrage Rapide

### Prérequis
- Navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Serveur web local (optionnel pour développement)

### Installation

1. **Cloner le dépôt**
```bash
git clone https://github.com/johneloi/gestion-lsu.git
cd gestion-lsu
```

2. **Lancer le serveur local**
```bash
# Avec Python
python3 -m http.server 3000

# Avec Node.js
npx serve .

# Avec PHP
php -S localhost:3000
```

3. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

### 🎯 Utilisation

1. **Ajouter des élèves** via le bouton "Ajouter un Élève"
2. **Générer des commentaires** dans la section Générateur
3. **Gérer les photos** de classes
4. **Exporter/Importer** les données selon vos besoins

## 🛠️ Technologies Utilisées

### Frontend
- **HTML5** - Structure sémantique
- **CSS3** - Styles modernes avec variables CSS
- **JavaScript (ES6+)** - Logique interactive
- **Bootstrap 5** - Framework UI responsive
- **Font Awesome** - Icônes professionnelles

### Backend & IA
- **Python** - Scripts utilitaires
- **Ollama** - IA locale pour génération
- **N8N** - Automatisation (optionnel)
- **SQLite** - Base de données locale

### Outils de Développement
- **Git** - Versioning
- **npm** - Gestion des dépendances
- **Docker** - Containerisation (optionnel)

## 📁 Structure du Projet

```
gestion-lsu/
├── 📄 index.html              # Page principale
├── 📁 css/
│   └── style.css              # Styles personnalisés
├── 📁 js/
│   ├── app.js                 # Application principale
│   ├── data-manager.js        # Gestion des données
│   └── generator.js           # Générateur IA
├── 📁 templates/              # Templates HTML
├── 📁 static/                 # Ressources statiques
├── 📁 scripts/                # Scripts utilitaires
├── 📁 deploy/                 # Configuration déploiement
├── 📁 tests/                  # Tests automatisés
├── 📄 package.json            # Configuration npm
├── 📄 requirements.txt        # Dépendances Python
└── 📄 README.md               # Documentation
```

## 🔧 Configuration

### IA Locale (Ollama)
1. Installer [Ollama](https://ollama.ai/)
2. Lancer le modèle : `ollama run mistral`
3. Configurer l'URL dans les paramètres : `http://localhost:11434/api/generate`

### N8N (Optionnel)
1. Installer N8N : `npm install -g n8n`
2. Configurer l'URL et webhook dans les paramètres
3. Créer des workflows d'automatisation

## 📊 Fonctionnalités Avancées

### Export/Import
- **Format CSV** : Compatible Excel/LibreOffice
- **Format JSON** : Structure complète des données
- **Validation** : Vérification des doublons
- **Backup** : Sauvegarde automatique

### Générateur IA
- **Templates** : Commentaires adaptés par niveau
- **Personnalisation** : Points forts et observations
- **Variantes** : Génération de multiples versions
- **Historique** : Sauvegarde des commentaires

### Interface
- **Responsive** : Adaptation mobile/tablette
- **Accessibilité** : Standards WCAG
- **Performance** : Chargement optimisé
- **UX** : Navigation intuitive

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment participer :

1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

### 🐛 Signaler un Bug
Utilisez l'onglet [Issues](https://github.com/johneloi/gestion-lsu/issues) pour signaler les bugs ou demander des fonctionnalités.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- **École du Cap** pour la confiance accordée
- **Bootstrap** pour le framework CSS
- **Font Awesome** pour les icônes
- **Ollama** pour l'IA locale
- **Communauté open source** pour les outils

## 📞 Support

- **Email** : support@ecole-cap.fr
- **GitHub** : [Issues](https://github.com/johneloi/gestion-lsu/issues)
- **Documentation** : [Wiki](https://github.com/johneloi/gestion-lsu/wiki)

---

<div align="center">

**Développé avec ❤️ pour l'éducation**

[![GitHub Pages](https://img.shields.io/badge/🌐%20Demo%20Live-GitHub%20Pages-brightgreen)](https://johneloi.github.io/gestion-lsu/)

</div> 