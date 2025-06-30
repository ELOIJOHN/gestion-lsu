#!/bin/bash

# LSU École du Cap - Script de Configuration Automatique
# Ce script configure automatiquement l'environnement de développement

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_message() {
    echo -e "${GREEN}[LSU]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERREUR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# En-tête
echo "=========================================="
echo "  LSU École du Cap - Configuration"
echo "  Système de Gestion Intelligent"
echo "=========================================="
echo ""

# Vérification de Node.js
print_message "Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
print_info "Node.js version: $NODE_VERSION"

# Vérification de npm
print_message "Vérification de npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé."
    exit 1
fi

NPM_VERSION=$(npm --version)
print_info "npm version: $NPM_VERSION"

# Vérification de la version Node.js
NODE_MAJOR=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 14 ]; then
    print_warning "Node.js version 14+ recommandée. Version actuelle: $NODE_VERSION"
fi

# Nettoyage des installations précédentes
print_message "Nettoyage des installations précédentes..."
if [ -d "node_modules" ]; then
    rm -rf node_modules
    print_info "node_modules supprimé"
fi

if [ -f "package-lock.json" ]; then
    rm package-lock.json
    print_info "package-lock.json supprimé"
fi

# Installation des dépendances
print_message "Installation des dépendances..."
npm install

if [ $? -eq 0 ]; then
    print_info "Dépendances installées avec succès"
else
    print_error "Erreur lors de l'installation des dépendances"
    exit 1
fi

# Vérification de la structure des dossiers
print_message "Vérification de la structure des dossiers..."
DIRS=("css" "js" "images" "data" "docs")
for dir in "${DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_info "Dossier créé: $dir"
    fi
done

# Création des fichiers de configuration
print_message "Création des fichiers de configuration..."

# Fichier .gitignore
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOF
# Dépendances
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Fichiers de build
dist/
build/

# Fichiers de cache
.cache/
.parcel-cache/

# Fichiers de logs
logs/
*.log

# Fichiers temporaires
.tmp/
.temp/

# Fichiers système
.DS_Store
Thumbs.db

# Fichiers d'environnement
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Fichiers de sauvegarde
*.bak
*.backup

# Fichiers de données (optionnel)
data/*.json
!data/sample.json

# Fichiers de photos (optionnel)
images/photos/
!images/photos/.gitkeep
EOF
    print_info "Fichier .gitignore créé"
fi

# Fichier .editorconfig
if [ ! -f ".editorconfig" ]; then
    cat > .editorconfig << EOF
# EditorConfig pour LSU École du Cap
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.{js,jsx,ts,tsx}]
indent_size = 2

[*.{html,css,scss}]
indent_size = 2

[*.{json,yml,yaml}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
EOF
    print_info "Fichier .editorconfig créé"
fi

# Vérification d'Ollama (optionnel)
print_message "Vérification d'Ollama (IA locale)..."
if command -v ollama &> /dev/null; then
    OLLAMA_VERSION=$(ollama --version)
    print_info "Ollama installé: $OLLAMA_VERSION"
    
    # Test de connexion Ollama
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        print_info "Ollama est en cours d'exécution"
    else
        print_warning "Ollama n'est pas en cours d'exécution. Lancez 'ollama serve' pour l'activer"
    fi
else
    print_warning "Ollama n'est pas installé. Pour l'IA locale, installez-le depuis https://ollama.ai/"
fi

# Configuration des permissions
print_message "Configuration des permissions..."
chmod +x scripts/*.sh 2>/dev/null || true

# Test de l'application
print_message "Test de l'application..."
if [ -f "index.html" ]; then
    print_info "Fichier index.html trouvé"
else
    print_error "Fichier index.html manquant"
    exit 1
fi

# Vérification des modules JavaScript
JS_FILES=("js/app.js" "js/data-manager.js" "js/generator.js")
for file in "${JS_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_info "Module trouvé: $file"
    else
        print_warning "Module manquant: $file"
    fi
done

# Création d'un script de démarrage rapide
print_message "Création du script de démarrage..."
cat > start.sh << 'EOF'
#!/bin/bash
# Script de démarrage rapide pour LSU École du Cap

echo "🚀 Démarrage de LSU École du Cap..."
echo "📱 Application accessible sur: http://localhost:3000"
echo "🛑 Appuyez sur Ctrl+C pour arrêter"
echo ""

npm start
EOF

chmod +x start.sh
print_info "Script de démarrage créé: ./start.sh"

# Configuration terminée
echo ""
echo "=========================================="
echo "  ✅ Configuration terminée avec succès!"
echo "=========================================="
echo ""
print_message "Pour démarrer l'application:"
echo "  npm start"
echo "  ou"
echo "  ./start.sh"
echo ""
print_message "Pour le développement:"
echo "  npm run dev"
echo ""
print_message "Pour les tests:"
echo "  npm test"
echo ""
print_message "Documentation:"
echo "  npm run docs"
echo ""

# Vérification finale
print_message "Vérification finale de l'installation..."
if npm list --depth=0 > /dev/null 2>&1; then
    print_info "✅ Installation validée"
else
    print_error "❌ Problème avec l'installation"
    exit 1
fi

print_message "🎉 LSU École du Cap est prêt à être utilisé!"
print_info "Ouvrez http://localhost:3000 dans votre navigateur" 