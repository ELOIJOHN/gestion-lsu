#!/bin/bash

# LSU École du Cap - Script de Déploiement
# Déploiement automatique multi-environnement

set -e  # Arrêter en cas d'erreur

# Configuration
PROJECT_NAME="lsu-ecole-cap"
VERSION=$(node -p "require('./package.json').version")
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DEPLOY_DIR="./dist"
BACKUP_DIR="./backups"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonction pour afficher les messages
print_message() {
    echo -e "${GREEN}[DEPLOY]${NC} $1"
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

# Fonction d'aide
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --env ENV        Environnement (dev, staging, prod)"
    echo "  -t, --type TYPE      Type de déploiement (local, server, cloud)"
    echo "  -b, --backup         Créer un backup avant déploiement"
    echo "  -c, --clean          Nettoyer avant déploiement"
    echo "  -v, --version        Afficher la version"
    echo "  -h, --help           Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 -e dev -t local"
    echo "  $0 -e prod -t server -b -c"
    echo "  $0 -e staging -t cloud"
}

# Variables par défaut
ENVIRONMENT="dev"
DEPLOY_TYPE="local"
CREATE_BACKUP=false
CLEAN_BUILD=false

# Parsing des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -t|--type)
            DEPLOY_TYPE="$2"
            shift 2
            ;;
        -b|--backup)
            CREATE_BACKUP=true
            shift
            ;;
        -c|--clean)
            CLEAN_BUILD=true
            shift
            ;;
        -v|--version)
            echo "Version: $VERSION"
            exit 0
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validation des paramètres
validate_params() {
    case $ENVIRONMENT in
        dev|staging|prod)
            ;;
        *)
            print_error "Environnement invalide: $ENVIRONMENT"
            exit 1
            ;;
    esac
    
    case $DEPLOY_TYPE in
        local|server|cloud)
            ;;
        *)
            print_error "Type de déploiement invalide: $DEPLOY_TYPE"
            exit 1
            ;;
    esac
}

# Création de backup
create_backup() {
    if [ "$CREATE_BACKUP" = true ]; then
        print_message "Création du backup..."
        
        if [ ! -d "$BACKUP_DIR" ]; then
            mkdir -p "$BACKUP_DIR"
        fi
        
        BACKUP_FILE="$BACKUP_DIR/${PROJECT_NAME}_${ENVIRONMENT}_${TIMESTAMP}.tar.gz"
        
        tar -czf "$BACKUP_FILE" \
            --exclude=node_modules \
            --exclude=dist \
            --exclude=backups \
            --exclude=.git \
            .
        
        print_info "Backup créé: $BACKUP_FILE"
    fi
}

# Nettoyage
clean_build() {
    if [ "$CLEAN_BUILD" = true ]; then
        print_message "Nettoyage du build..."
        
        if [ -d "$DEPLOY_DIR" ]; then
            rm -rf "$DEPLOY_DIR"
            print_info "Dossier dist supprimé"
        fi
        
        if [ -d "node_modules" ]; then
            rm -rf node_modules
            print_info "node_modules supprimé"
        fi
        
        if [ -f "package-lock.json" ]; then
            rm package-lock.json
            print_info "package-lock.json supprimé"
        fi
    fi
}

# Build de l'application
build_application() {
    print_message "Build de l'application..."
    
    # Créer le dossier de déploiement
    mkdir -p "$DEPLOY_DIR"
    
    # Copier les fichiers essentiels
    cp -r index.html "$DEPLOY_DIR/"
    cp -r css "$DEPLOY_DIR/"
    cp -r js "$DEPLOY_DIR/"
    cp -r images "$DEPLOY_DIR/" 2>/dev/null || mkdir -p "$DEPLOY_DIR/images"
    cp -r data "$DEPLOY_DIR/" 2>/dev/null || mkdir -p "$DEPLOY_DIR/data"
    
    # Copier les fichiers de configuration
    cp package.json "$DEPLOY_DIR/"
    cp README.md "$DEPLOY_DIR/" 2>/dev/null || echo "# LSU École du Cap" > "$DEPLOY_DIR/README.md"
    
    # Créer le fichier de configuration d'environnement
    cat > "$DEPLOY_DIR/config.js" << EOF
// Configuration pour l'environnement: $ENVIRONMENT
window.LSU_CONFIG = {
    environment: '$ENVIRONMENT',
    version: '$VERSION',
    buildTime: '$TIMESTAMP',
    debug: $([ "$ENVIRONMENT" = "dev" ] && echo "true" || echo "false"),
    apiUrl: '$([ "$ENVIRONMENT" = "prod" ] && echo "https://api.lsu-ecole-cap.fr" || echo "http://localhost:3000")'
};
EOF
    
    # Minifier les fichiers CSS et JS en production
    if [ "$ENVIRONMENT" = "prod" ]; then
        print_info "Minification des assets..."
        # Ici on pourrait ajouter des outils de minification
        # Pour l'instant, on copie simplement
    fi
    
    print_info "Build terminé dans: $DEPLOY_DIR"
}

# Tests avant déploiement
run_tests() {
    print_message "Exécution des tests..."
    
    # Vérifier que les fichiers essentiels existent
    REQUIRED_FILES=("index.html" "js/app.js" "js/data-manager.js" "js/generator.js" "css/style.css")
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -f "$DEPLOY_DIR/$file" ]; then
            print_error "Fichier manquant: $file"
            exit 1
        fi
    done
    
    print_info "Tests de structure passés"
}

# Déploiement local
deploy_local() {
    print_message "Déploiement local..."
    
    # Démarrer le serveur local
    cd "$DEPLOY_DIR"
    
    print_info "Application déployée localement"
    print_info "Accédez à: http://localhost:3000"
    print_info "Appuyez sur Ctrl+C pour arrêter"
    
    # Démarrer live-server
    npx live-server --port=3000 --open=/index.html
}

# Déploiement serveur
deploy_server() {
    print_message "Déploiement serveur..."
    
    # Configuration du serveur (à adapter selon votre infrastructure)
    SERVER_HOST="your-server.com"
    SERVER_PATH="/var/www/lsu-ecole-cap"
    SERVER_USER="deploy"
    
    print_warning "Configuration serveur requise"
    print_info "Serveur: $SERVER_HOST"
    print_info "Chemin: $SERVER_PATH"
    print_info "Utilisateur: $SERVER_USER"
    
    # Exemple de commande de déploiement (à décommenter et adapter)
    # rsync -avz --delete "$DEPLOY_DIR/" "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/"
    
    print_info "Déploiement serveur terminé"
}

# Déploiement cloud
deploy_cloud() {
    print_message "Déploiement cloud..."
    
    # Configuration cloud (à adapter selon votre fournisseur)
    case $ENVIRONMENT in
        dev)
            CLOUD_URL="https://dev.lsu-ecole-cap.fr"
            ;;
        staging)
            CLOUD_URL="https://staging.lsu-ecole-cap.fr"
            ;;
        prod)
            CLOUD_URL="https://lsu-ecole-cap.fr"
            ;;
    esac
    
    print_warning "Configuration cloud requise"
    print_info "URL: $CLOUD_URL"
    
    # Exemple de déploiement cloud (à adapter)
    # - GitHub Pages
    # - Netlify
    # - Vercel
    # - AWS S3 + CloudFront
    
    print_info "Déploiement cloud terminé"
}

# Validation post-déploiement
validate_deployment() {
    print_message "Validation du déploiement..."
    
    # Vérifier que l'application est accessible
    if [ "$DEPLOY_TYPE" = "local" ]; then
        # Attendre que le serveur démarre
        sleep 3
        
        # Test de connectivité (optionnel)
        if command -v curl &> /dev/null; then
            if curl -s http://localhost:3000 > /dev/null; then
                print_info "Application accessible"
            else
                print_warning "Application non accessible"
            fi
        fi
    fi
    
    print_info "Validation terminée"
}

# Nettoyage post-déploiement
cleanup() {
    print_message "Nettoyage post-déploiement..."
    
    # Supprimer les fichiers temporaires
    if [ -f "deploy.tmp" ]; then
        rm deploy.tmp
    fi
    
    print_info "Nettoyage terminé"
}

# Fonction principale
main() {
    echo "=========================================="
    echo "  🚀 Déploiement LSU École du Cap"
    echo "  Version: $VERSION"
    echo "  Environnement: $ENVIRONMENT"
    echo "  Type: $DEPLOY_TYPE"
    echo "=========================================="
    echo ""
    
    # Validation des paramètres
    validate_params
    
    # Création de backup
    create_backup
    
    # Nettoyage
    clean_build
    
    # Build
    build_application
    
    # Tests
    run_tests
    
    # Déploiement selon le type
    case $DEPLOY_TYPE in
        local)
            deploy_local
            ;;
        server)
            deploy_server
            ;;
        cloud)
            deploy_cloud
            ;;
    esac
    
    # Validation
    validate_deployment
    
    # Nettoyage
    cleanup
    
    echo ""
    echo "=========================================="
    echo "  ✅ Déploiement terminé avec succès!"
    echo "=========================================="
    print_info "Version: $VERSION"
    print_info "Environnement: $ENVIRONMENT"
    print_info "Timestamp: $TIMESTAMP"
}

# Gestion des erreurs
trap 'print_error "Erreur lors du déploiement"; exit 1' ERR

# Exécution
main "$@" 