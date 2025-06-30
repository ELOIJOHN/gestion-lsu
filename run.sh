#!/bin/bash

# LSU École du Cap - Script de lancement
echo "🚀 Lancement du système LSU École du Cap"

# Vérification de l'environnement virtuel
if [ ! -d "venv" ]; then
    echo "❌ Environnement virtuel non trouvé. Lancez d'abord ./install.sh"
    exit 1
fi

# Activation de l'environnement virtuel
echo "🔧 Activation de l'environnement virtuel..."
source venv/bin/activate

# Vérification de la base de données
if [ ! -f "lsu_ecole_cap.db" ]; then
    echo "🗄️  Base de données non trouvée. Initialisation..."
    python init_db.py
fi

# Lancement de l'application
echo "🌐 Lancement de l'application..."
echo "📱 Accédez à http://localhost:5000"
echo "🛑 Appuyez sur Ctrl+C pour arrêter"
echo ""

python app.py 