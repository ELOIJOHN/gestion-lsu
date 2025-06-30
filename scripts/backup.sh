#!/bin/bash

# LSU École du Cap - Script de Backup
# Sauvegarde automatique des données

set -e

# Configuration
PROJECT_NAME="lsu-ecole-cap"
BACKUP_DIR="./backups"
DATA_DIR="./data"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
MAX_BACKUPS=10

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonction pour afficher les messages
print_message() {
    echo -e "${GREEN}[BACKUP]${NC} $1"
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
    echo "  -a, --auto          Backup automatique"
    echo "  -m, --manual        Backup manuel"
    echo "  -f, --full          Backup complet (avec node_modules)"
    echo "  -c, --clean         Nettoyer les anciens backups"
    echo "  -l, --list          Lister les backups existants"
    echo "  -r, --restore FILE  Restaurer depuis un backup"
    echo "  -h, --help          Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 -m              # Backup manuel"
    echo "  $0 -f              # Backup complet"
    echo "  $0 -l              # Lister les backups"
    echo "  $0 -r backup.tar.gz # Restaurer"
}

# Variables par défaut
BACKUP_TYPE="manual"
FULL_BACKUP=false
CLEAN_OLD=false
LIST_BACKUPS=false
RESTORE_FILE=""

# Parsing des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -a|--auto)
            BACKUP_TYPE="auto"
            shift
            ;;
        -m|--manual)
            BACKUP_TYPE="manual"
            shift
            ;;
        -f|--full)
            FULL_BACKUP=true
            shift
            ;;
        -c|--clean)
            CLEAN_OLD=true
            shift
            ;;
        -l|--list)
            LIST_BACKUPS=true
            shift
            ;;
        -r|--restore)
            RESTORE_FILE="$2"
            shift 2
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

# Créer le répertoire de backup
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        print_info "Répertoire de backup créé: $BACKUP_DIR"
    fi
}

# Lister les backups existants
list_backups() {
    print_message "Backups existants:"
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
        print_info "Aucun backup trouvé"
        return
    fi
    
    echo ""
    echo "Date                 Taille    Nom du fichier"
    echo "-----------------------------------------------"
    
    for backup in "$BACKUP_DIR"/*.tar.gz; do
        if [ -f "$backup" ]; then
            filename=$(basename "$backup")
            size=$(du -h "$backup" | cut -f1)
            date=$(stat -c %y "$backup" | cut -d' ' -f1,2 | sed 's/ /_/')
            echo "$date  $size    $filename"
        fi
    done
    
    echo ""
    print_info "Total: $(ls -1 $BACKUP_DIR/*.tar.gz 2>/dev/null | wc -l) backup(s)"
}

# Nettoyer les anciens backups
clean_old_backups() {
    print_message "Nettoyage des anciens backups..."
    
    if [ ! -d "$BACKUP_DIR" ]; then
        print_info "Aucun backup à nettoyer"
        return
    fi
    
    # Compter les backups existants
    backup_count=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)
    
    if [ "$backup_count" -gt "$MAX_BACKUPS" ]; then
        # Supprimer les plus anciens
        files_to_remove=$((backup_count - MAX_BACKUPS))
        print_info "Suppression de $files_to_remove backup(s) ancien(s)"
        
        ls -t "$BACKUP_DIR"/*.tar.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm
        
        print_info "Nettoyage terminé"
    else
        print_info "Pas de nettoyage nécessaire ($backup_count/$MAX_BACKUPS backups)"
    fi
}

# Créer un backup
create_backup() {
    print_message "Création du backup..."
    
    # Nom du fichier de backup
    if [ "$FULL_BACKUP" = true ]; then
        BACKUP_FILE="$BACKUP_DIR/${PROJECT_NAME}_full_${TIMESTAMP}.tar.gz"
        print_info "Backup complet"
    else
        BACKUP_FILE="$BACKUP_DIR/${PROJECT_NAME}_data_${TIMESTAMP}.tar.gz"
        print_info "Backup des données uniquement"
    fi
    
    # Créer le backup
    if [ "$FULL_BACKUP" = true ]; then
        # Backup complet
        tar -czf "$BACKUP_FILE" \
            --exclude=node_modules \
            --exclude=backups \
            --exclude=.git \
            --exclude=dist \
            --exclude=*.log \
            .
    else
        # Backup des données uniquement
        tar -czf "$BACKUP_FILE" \
            --exclude=node_modules \
            --exclude=backups \
            --exclude=.git \
            --exclude=dist \
            --exclude=*.log \
            --exclude=package-lock.json \
            --exclude=deploy \
            --exclude=scripts \
            --exclude=tests \
            .
    fi
    
    # Vérifier que le backup a été créé
    if [ -f "$BACKUP_FILE" ]; then
        size=$(du -h "$BACKUP_FILE" | cut -f1)
        print_info "Backup créé: $BACKUP_FILE ($size)"
        
        # Ajouter les métadonnées
        echo "Backup créé le $(date)" > "$BACKUP_DIR/${PROJECT_NAME}_${TIMESTAMP}.info"
        echo "Type: $([ "$FULL_BACKUP" = true ] && echo "Complet" || echo "Données")" >> "$BACKUP_DIR/${PROJECT_NAME}_${TIMESTAMP}.info"
        echo "Taille: $size" >> "$BACKUP_DIR/${PROJECT_NAME}_${TIMESTAMP}.info"
        echo "Version: $(node -p "require('./package.json').version" 2>/dev/null || echo "Inconnue")" >> "$BACKUP_DIR/${PROJECT_NAME}_${TIMESTAMP}.info"
        
    else
        print_error "Échec de la création du backup"
        exit 1
    fi
}

# Restaurer un backup
restore_backup() {
    if [ -z "$RESTORE_FILE" ]; then
        print_error "Fichier de backup non spécifié"
        exit 1
    fi
    
    if [ ! -f "$RESTORE_FILE" ]; then
        print_error "Fichier de backup non trouvé: $RESTORE_FILE"
        exit 1
    fi
    
    print_message "Restauration depuis: $RESTORE_FILE"
    print_warning "Cette opération va écraser les données existantes!"
    
    read -p "Êtes-vous sûr de vouloir continuer? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Restauration annulée"
        exit 0
    fi
    
    # Créer un backup de sauvegarde avant restauration
    print_info "Création d'un backup de sécurité..."
    create_backup
    
    # Restaurer
    print_info "Restauration en cours..."
    
    # Extraire dans un répertoire temporaire
    TEMP_DIR=$(mktemp -d)
    tar -xzf "$RESTORE_FILE" -C "$TEMP_DIR"
    
    # Copier les fichiers
    cp -r "$TEMP_DIR"/* .
    
    # Nettoyer
    rm -rf "$TEMP_DIR"
    
    print_info "Restauration terminée"
}

# Vérifier l'intégrité du backup
verify_backup() {
    local backup_file="$1"
    
    print_info "Vérification de l'intégrité: $backup_file"
    
    if tar -tzf "$backup_file" > /dev/null 2>&1; then
        print_info "Backup valide"
        return 0
    else
        print_error "Backup corrompu: $backup_file"
        return 1
    fi
}

# Fonction principale
main() {
    echo "=========================================="
    echo "  💾 LSU École du Cap - Gestionnaire de Backup"
    echo "  Type: $BACKUP_TYPE"
    echo "  Timestamp: $TIMESTAMP"
    echo "=========================================="
    echo ""
    
    # Créer le répertoire de backup
    create_backup_dir
    
    # Actions selon les options
    if [ "$LIST_BACKUPS" = true ]; then
        list_backups
        exit 0
    fi
    
    if [ -n "$RESTORE_FILE" ]; then
        restore_backup
        exit 0
    fi
    
    if [ "$CLEAN_OLD" = true ]; then
        clean_old_backups
    fi
    
    # Créer le backup
    create_backup
    
    # Vérifier l'intégrité
    verify_backup "$BACKUP_FILE"
    
    # Nettoyer les anciens backups si demandé
    if [ "$CLEAN_OLD" = true ]; then
        clean_old_backups
    fi
    
    echo ""
    echo "=========================================="
    echo "  ✅ Backup terminé avec succès!"
    echo "=========================================="
    print_info "Fichier: $BACKUP_FILE"
    print_info "Taille: $(du -h "$BACKUP_FILE" | cut -f1)"
    print_info "Type: $([ "$FULL_BACKUP" = true ] && echo "Complet" || echo "Données")"
}

# Gestion des erreurs
trap 'print_error "Erreur lors du backup"; exit 1' ERR

# Exécution
main "$@" 