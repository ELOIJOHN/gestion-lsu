#!/bin/bash

# LSU École du Cap - Script de Démarrage
# Script d'initialisation pour le conteneur Docker

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonction pour afficher les messages
print_message() {
    echo -e "${GREEN}[STARTUP]${NC} $1"
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

# Variables d'environnement
NODE_ENV=${NODE_ENV:-production}
LSU_ENVIRONMENT=${LSU_ENVIRONMENT:-prod}
PORT=${PORT:-3000}

print_message "Démarrage de LSU École du Cap..."
print_info "Environnement: $LSU_ENVIRONMENT"
print_info "Port: $PORT"

# Vérifier les prérequis
check_prerequisites() {
    print_message "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js non trouvé"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        print_error "npm non trouvé"
        exit 1
    fi
    
    # Vérifier les fichiers essentiels
    REQUIRED_FILES=("package.json" "index.html" "js/app.js")
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Fichier manquant: $file"
            exit 1
        fi
    done
    
    print_info "Prérequis vérifiés"
}

# Initialiser l'application
initialize_app() {
    print_message "Initialisation de l'application..."
    
    # Créer les répertoires nécessaires
    mkdir -p \
        /app/data \
        /app/static/uploads/photos \
        /app/logs \
        /app/backups \
        /app/temp
    
    # Définir les permissions
    chmod -R 755 /app/data
    chmod -R 755 /app/static/uploads
    chmod -R 755 /app/logs
    chmod -R 755 /app/backups
    chmod -R 755 /app/temp
    
    # Créer le fichier de configuration d'environnement
    cat > /app/config.js << EOF
// Configuration automatique pour l'environnement: $LSU_ENVIRONMENT
window.LSU_CONFIG = {
    environment: '$LSU_ENVIRONMENT',
    version: '$(node -p "require('./package.json').version")',
    buildTime: '$(date -u +"%Y-%m-%dT%H:%M:%SZ")',
    debug: $([ "$LSU_ENVIRONMENT" = "dev" ] && echo "true" || echo "false"),
    apiUrl: '$([ "$LSU_ENVIRONMENT" = "prod" ] && echo "https://api.lsu-ecole-cap.fr" || echo "http://localhost:3000")',
    port: $PORT
};
EOF
    
    print_info "Application initialisée"
}

# Vérifier la base de données
check_database() {
    print_message "Vérification de la base de données..."
    
    # Attendre que la base de données soit prête (si applicable)
    if [ -n "$DB_HOST" ]; then
        print_info "Attente de la base de données..."
        
        # Boucle d'attente pour la base de données
        for i in {1..30}; do
            if nc -z "$DB_HOST" "${DB_PORT:-5432}" 2>/dev/null; then
                print_info "Base de données accessible"
                break
            fi
            
            if [ $i -eq 30 ]; then
                print_warning "Base de données non accessible après 30 tentatives"
            else
                print_info "Tentative $i/30..."
                sleep 2
            fi
        done
    else
        print_info "Aucune base de données externe configurée"
    fi
}

# Exécuter les migrations (si applicable)
run_migrations() {
    print_message "Exécution des migrations..."
    
    # Ici on pourrait exécuter des migrations de base de données
    # Pour l'instant, on initialise juste les données locales
    
    # Créer le fichier de données initial si nécessaire
    if [ ! -f "/app/data/lsu_data.json" ]; then
        cat > /app/data/lsu_data.json << EOF
{
  "eleves": [],
  "commentaires": [],
  "photos": [],
  "settings": {
    "ai": {
      "enabled": true,
      "provider": "ollama",
      "model": "llama2",
      "url": "http://localhost:11434",
      "apiKey": ""
    },
    "backup": {
      "auto": true,
      "interval": 86400,
      "maxBackups": 10
    },
    "security": {
      "sessionTimeout": 3600,
      "maxLoginAttempts": 5
    }
  },
  "statistics": {
    "totalEleves": 0,
    "totalCommentaires": 0,
    "lastBackup": null
  }
}
EOF
        print_info "Données initiales créées"
    fi
    
    print_info "Migrations terminées"
}

# Vérifier les services externes
check_external_services() {
    print_message "Vérification des services externes..."
    
    # Vérifier Ollama (IA locale)
    if [ "$LSU_ENVIRONMENT" = "prod" ]; then
        print_info "Vérification d'Ollama..."
        
        if nc -z localhost 11434 2>/dev/null; then
            print_info "Ollama accessible"
        else
            print_warning "Ollama non accessible - IA locale désactivée"
        fi
    fi
    
    # Vérifier les autres services si nécessaire
    print_info "Services externes vérifiés"
}

# Démarrer l'application
start_application() {
    print_message "Démarrage de l'application..."
    
    # Variables d'environnement pour l'application
    export NODE_ENV=$NODE_ENV
    export LSU_ENVIRONMENT=$LSU_ENVIRONMENT
    export PORT=$PORT
    
    # Démarrer l'application selon l'environnement
    case $LSU_ENVIRONMENT in
        dev)
            print_info "Mode développement"
            exec npm run dev
            ;;
        staging)
            print_info "Mode staging"
            exec npm start
            ;;
        prod)
            print_info "Mode production"
            exec npm start
            ;;
        *)
            print_warning "Environnement inconnu, démarrage en mode production"
            exec npm start
            ;;
    esac
}

# Gestion des signaux
handle_signals() {
    print_message "Arrêt de l'application..."
    
    # Sauvegarder les données si nécessaire
    if [ -f "/app/data/lsu_data.json" ]; then
        cp /app/data/lsu_data.json /app/backups/lsu_data_backup_$(date +%Y%m%d_%H%M%S).json
        print_info "Sauvegarde créée"
    fi
    
    # Nettoyer les fichiers temporaires
    rm -rf /app/temp/*
    
    print_info "Application arrêtée proprement"
    exit 0
}

# Configuration des signaux
trap handle_signals SIGTERM SIGINT

# Fonction principale
main() {
    echo "=========================================="
    echo "  🚀 LSU École du Cap - Démarrage"
    echo "  Environnement: $LSU_ENVIRONMENT"
    echo "  Port: $PORT"
    echo "=========================================="
    echo ""
    
    # Vérifications et initialisation
    check_prerequisites
    initialize_app
    check_database
    run_migrations
    check_external_services
    
    # Démarrer l'application
    start_application
}

# Exécution
main "$@" 