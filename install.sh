#!/bin/bash

# LSU École du Cap - Script d'installation
echo "🎓 Installation du système LSU École du Cap"
echo "=============================================="

# Vérification de Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ Python 3 détecté"

# Création de l'environnement virtuel
echo "📦 Création de l'environnement virtuel..."
python3 -m venv venv

# Activation de l'environnement virtuel
echo "🔧 Activation de l'environnement virtuel..."
source venv/bin/activate

# Installation des dépendances
echo "📚 Installation des dépendances..."
pip install --upgrade pip
pip install -r requirements.txt

# Création du fichier .env
if [ ! -f .env ]; then
    echo "⚙️  Création du fichier .env..."
    cp env_example.txt .env
    echo "📝 Veuillez modifier le fichier .env avec vos clés API"
fi

# Initialisation de la base de données
echo "🗄️  Initialisation de la base de données..."
python init_db.py

echo ""
echo "🎉 Installation terminée avec succès !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Modifiez le fichier .env avec vos clés API"
echo "2. Lancez l'application : python app.py"
echo "3. Accédez à http://localhost:5000"
echo ""
echo "🔐 Comptes de test créés :"
echo "   Admin: admin / admin123"
echo "   Enseignant: dupont.marie / enseignant123"
echo ""
echo "🚀 Pour lancer l'application :"
echo "   source venv/bin/activate"
echo "   python app.py" 