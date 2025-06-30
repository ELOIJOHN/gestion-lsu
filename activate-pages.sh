#!/bin/bash

# Script pour activer GitHub Pages sur le dépôt gestion-lsu
# Nécessite un token GitHub avec les permissions pages

REPO="ELOIJOHN/gestion-lsu"
TOKEN=${GITHUB_TOKEN}

if [ -z "$TOKEN" ]; then
    echo "❌ Erreur: Variable GITHUB_TOKEN non définie"
    echo "Pour activer GitHub Pages, vous devez:"
    echo "1. Aller sur https://github.com/settings/tokens"
    echo "2. Créer un token avec les permissions 'repo' et 'workflow'"
    echo "3. Exporter la variable: export GITHUB_TOKEN=votre_token"
    echo ""
    echo "Ou activer manuellement:"
    echo "1. Aller sur https://github.com/ELOIJOHN/gestion-lsu/settings/pages"
    echo "2. Sélectionner 'Deploy from a branch'"
    echo "3. Choisir la branche 'main' et le dossier '/'"
    echo "4. Cliquer sur 'Save'"
    exit 1
fi

echo "🚀 Activation de GitHub Pages pour $REPO..."

# Activer GitHub Pages
curl -X POST \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$REPO/pages \
  -d '{
    "source": {
      "branch": "main",
      "path": "/"
    }
  }'

if [ $? -eq 0 ]; then
    echo "✅ GitHub Pages activé avec succès!"
    echo "🌐 URL du site: https://eloijohn.github.io/gestion-lsu/"
    echo "⏱️  Le site sera disponible dans quelques minutes..."
    
    # Ouvrir le site
    sleep 5
    open "https://eloijohn.github.io/gestion-lsu/"
else
    echo "❌ Erreur lors de l'activation de GitHub Pages"
    echo "Veuillez activer manuellement via l'interface web"
fi 