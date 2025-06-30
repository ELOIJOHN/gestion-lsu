#!/bin/bash

# LSU École du Cap - Script de Restauration
# Restauration depuis un backup

set -e

# Configuration
PROJECT_NAME="lsu-ecole-cap"
BACKUP_DIR="./backups"
RESTORE_DIR="./restore_temp"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonction pour afficher les messages
print_message() {
    echo -e "${GREEN}[RESTORE]${NC} $1"
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
    echo "Usage: $0 [OPTIONS] BACKUP_FILE"
    echo ""
    echo "Options:"
    echo "  -d, --dry-run       Simulation sans restaurer"
    echo "  -f, --force         Forcer la restauration"
    echo "  -p, --preview       Aperçu du contenu du backup"
    echo "  -v, --verify        Vérifier l'intégrité du backup"
    echo "  -h, --help          Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 backup.tar.gz              # Restauration normale"
    echo "  $0 -d backup.tar.gz           # Simulation"
    echo "  $0 -p backup.tar.gz           # Aperçu"
    echo "  $0 -v backup.tar.gz           # Vérification"
}

# Variables par défaut
DRY_RUN=false
FORCE=false
PREVIEW=false
VERIFY=false
BACKUP_FILE=""

# Parsing des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -p|--preview)
            PREVIEW=true
            shift
            ;;
        -v|--verify)
            VERIFY=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        -*)
            print_error "Option inconnue: $1"
            show_help
            exit 1
            ;;
        *)
            if [ -z "$BACKUP_FILE" ]; then
                BACKUP_FILE="$1"
            else
                print_error "Fichier de backup déjà spécifié: $BACKUP_FILE"
                exit 1
            fi
            shift
            ;;
    esac
done

# Vérifier que le fichier de backup est spécifié
if [ -z "$BACKUP_FILE" ]; then
    print_error "Fichier de backup non spécifié"
    show_help
    exit 1
fi

# Vérifier que le fichier existe
if [ ! -f "$BACKUP_FILE" ]; then
    # Chercher dans le répertoire de backup
    if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
    else
        print_error "Fichier de backup non trouvé: $BACKUP_FILE"
        print_info "Recherche dans: $BACKUP_DIR"
        if [ -d "$BACKUP_DIR" ]; then
            echo "Backups disponibles:"
            ls -la "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "Aucun backup trouvé"
        fi
        exit 1
    fi
fi

# Vérifier l'intégrité du backup
verify_backup() {
    local backup_file="$1"
    
    print_message "Vérification de l'intégrité: $backup_file"
    
    if ! tar -tzf "$backup_file" > /dev/null 2>&1; then
        print_error "Backup corrompu ou invalide: $backup_file"
        return 1
    fi
    
    print_info "Backup valide"
    return 0
}

# Aperçu du contenu du backup
preview_backup() {
    local backup_file="$1"
    
    print_message "Aperçu du contenu: $backup_file"
    
    if ! verify_backup "$backup_file"; then
        exit 1
    fi
    
    echo ""
    echo "Contenu du backup:"
    echo "=================="
    
    # Lister le contenu
    tar -tzf "$backup_file" | head -20
    
    local total_files=$(tar -tzf "$backup_file" | wc -l)
    echo "..."
    echo "Total: $total_files fichiers"
    
    # Informations sur le backup
    echo ""
    echo "Informations:"
    echo "============="
    echo "Taille: $(du -h "$backup_file" | cut -f1)"
    echo "Date de modification: $(stat -c %y "$backup_file")"
    
    # Chercher le fichier info associé
    local info_file=$(echo "$backup_file" | sed 's/\.tar\.gz$/.info/')
    if [ -f "$info_file" ]; then
        echo ""
        echo "Métadonnées:"
        echo "============"
        cat "$info_file"
    fi
}

# Créer un backup de sécurité
create_safety_backup() {
    print_message "Création d'un backup de sécurité..."
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local safety_backup="$BACKUP_DIR/${PROJECT_NAME}_safety_${timestamp}.tar.gz"
    
    # Créer le backup de sécurité
    tar -czf "$safety_backup" \
        --exclude=node_modules \
        --exclude=backups \
        --exclude=.git \
        --exclude=dist \
        --exclude=restore_temp \
        .
    
    if [ -f "$safety_backup" ]; then
        print_info "Backup de sécurité créé: $safety_backup"
        return 0
    else
        print_error "Échec de la création du backup de sécurité"
        return 1
    fi
}

# Restaurer le backup
restore_backup() {
    local backup_file="$1"
    
    print_message "Restauration depuis: $backup_file"
    
    # Vérifier l'intégrité
    if ! verify_backup "$backup_file"; then
        exit 1
    fi
    
    # Créer un backup de sécurité si pas en mode simulation
    if [ "$DRY_RUN" = false ]; then
        if ! create_safety_backup; then
            print_error "Impossible de créer le backup de sécurité"
            exit 1
        fi
    fi
    
    # Créer le répertoire temporaire
    if [ -d "$RESTORE_DIR" ]; then
        rm -rf "$RESTORE_DIR"
    fi
    mkdir -p "$RESTORE_DIR"
    
    # Extraire le backup
    print_info "Extraction du backup..."
    if [ "$DRY_RUN" = true ]; then
        print_info "Mode simulation - extraction simulée"
    else
        tar -xzf "$backup_file" -C "$RESTORE_DIR"
    fi
    
    # Lister les fichiers à restaurer
    print_info "Fichiers à restaurer:"
    if [ "$DRY_RUN" = true ]; then
        tar -tzf "$backup_file" | head -10
        echo "..."
        echo "Total: $(tar -tzf "$backup_file" | wc -l) fichiers"
    else
        ls -la "$RESTORE_DIR" | head -10
        echo "..."
        echo "Total: $(find "$RESTORE_DIR" -type f | wc -l) fichiers"
    fi
    
    # Demander confirmation si pas en mode force
    if [ "$FORCE" = false ] && [ "$DRY_RUN" = false ]; then
        echo ""
        print_warning "Cette opération va écraser les fichiers existants!"
        read -p "Êtes-vous sûr de vouloir continuer? (y/N): " -n 1 -r
        echo
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Restauration annulée"
            cleanup
            exit 0
        fi
    fi
    
    # Restaurer les fichiers
    if [ "$DRY_RUN" = false ]; then
        print_info "Restauration en cours..."
        
        # Copier les fichiers
        cp -r "$RESTORE_DIR"/* .
        
        print_info "Restauration terminée"
    else
        print_info "Mode simulation - restauration simulée"
    fi
}

# Nettoyer les fichiers temporaires
cleanup() {
    if [ -d "$RESTORE_DIR" ]; then
        rm -rf "$RESTORE_DIR"
        print_info "Fichiers temporaires nettoyés"
    fi
}

# Vérifier les conflits
check_conflicts() {
    local backup_file="$1"
    
    print_message "Vérification des conflits..."
    
    # Extraire temporairement pour vérifier
    local temp_dir=$(mktemp -d)
    tar -xzf "$backup_file" -C "$temp_dir"
    
    local conflicts=0
    
    # Vérifier les fichiers qui vont être écrasés
    for file in $(find "$temp_dir" -type f); do
        local relative_path=${file#$temp_dir/}
        if [ -f "$relative_path" ]; then
            echo "Conflit: $relative_path"
            ((conflicts++))
        fi
    done
    
    # Nettoyer
    rm -rf "$temp_dir"
    
    if [ $conflicts -gt 0 ]; then
        print_warning "$conflicts fichier(s) vont être écrasé(s)"
        return 1
    else
        print_info "Aucun conflit détecté"
        return 0
    fi
}

# Fonction principale
main() {
    echo "=========================================="
    echo "  🔄 LSU École du Cap - Restauration"
    echo "  Fichier: $BACKUP_FILE"
    echo "  Mode: $([ "$DRY_RUN" = true ] && echo "Simulation" || echo "Restauration")"
    echo "=========================================="
    echo ""
    
    # Actions selon les options
    if [ "$VERIFY" = true ]; then
        verify_backup "$BACKUP_FILE"
        exit $?
    fi
    
    if [ "$PREVIEW" = true ]; then
        preview_backup "$BACKUP_FILE"
        exit 0
    fi
    
    # Vérifier les conflits si pas en mode force
    if [ "$FORCE" = false ] && [ "$DRY_RUN" = false ]; then
        if ! check_conflicts "$BACKUP_FILE"; then
            print_warning "Utilisez -f pour forcer la restauration"
        fi
    fi
    
    # Restaurer
    restore_backup "$BACKUP_FILE"
    
    # Nettoyer
    cleanup
    
    echo ""
    echo "=========================================="
    echo "  ✅ Restauration terminée avec succès!"
    echo "=========================================="
    print_info "Fichier restauré: $BACKUP_FILE"
    if [ "$DRY_RUN" = true ]; then
        print_info "Mode simulation - aucun fichier modifié"
    fi
}

# Gestion des erreurs
trap 'print_error "Erreur lors de la restauration"; cleanup; exit 1' ERR

# Exécution
main "$@" 