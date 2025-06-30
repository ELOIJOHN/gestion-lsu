"""
Modèles de données pour le système LSU École du Cap
Définit toutes les entités de la base de données
"""

from app import db
from flask_login import UserMixin
from datetime import datetime
import json


class User(UserMixin, db.Model):
    """Modèle utilisateur pour les enseignants"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default='enseignant')  # admin, enseignant
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    actif = db.Column(db.Boolean, default=True)
    
    # Relations
    classes = db.relationship('Classe', backref='enseignant', lazy=True)
    commentaires = db.relationship('Commentaire', backref='auteur', lazy=True)

    def set_password(self, password):
        """Hash du mot de passe"""
        from werkzeug.security import generate_password_hash
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Vérification du mot de passe"""
        from werkzeug.security import check_password_hash
        return check_password_hash(self.password_hash, password)


class Classe(db.Model):
    """Modèle pour les classes (CP à CM2)"""
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(50), nullable=False)  # CP, CE1, CE2, CM1, CM2
    annee_scolaire = db.Column(db.String(9), nullable=False)  # 2024-2025
    enseignant_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    photo_classe = db.Column(db.String(255))  # Chemin vers la photo
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relations
    eleves = db.relationship('Eleve', backref='classe', lazy=True)
    evaluations = db.relationship('Evaluation', backref='classe', lazy=True)


class Eleve(db.Model):
    """Modèle pour les élèves"""
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    date_naissance = db.Column(db.Date, nullable=False)
    classe_id = db.Column(db.Integer, db.ForeignKey('classe.id'), nullable=False)
    photo = db.Column(db.String(255))  # Chemin vers la photo
    observations = db.Column(db.Text)  # Observations générales
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relations
    evaluations = db.relationship('Evaluation', backref='eleve', lazy=True)
    commentaires = db.relationship('Commentaire', backref='eleve', lazy=True)


class Matiere(db.Model):
    """Modèle pour les matières scolaires"""
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(10), unique=True, nullable=False)  # FR, MA, HG, etc.
    description = db.Column(db.Text)
    cycle = db.Column(db.String(10))  # Cycle 1, 2, 3
    actif = db.Column(db.Boolean, default=True)
    
    # Relations
    evaluations = db.relationship('Evaluation', backref='matiere', lazy=True)


class Evaluation(db.Model):
    """Modèle pour les évaluations"""
    id = db.Column(db.Integer, primary_key=True)
    eleve_id = db.Column(db.Integer, db.ForeignKey('eleve.id'), nullable=False)
    matiere_id = db.Column(db.Integer, db.ForeignKey('matiere.id'), nullable=False)
    classe_id = db.Column(db.Integer, db.ForeignKey('classe.id'), nullable=False)
    periode = db.Column(db.String(20), nullable=False)  # P1, P2, P3, P4
    annee_scolaire = db.Column(db.String(9), nullable=False)
    niveau = db.Column(db.String(20))  # Insuffisant, Fragile, Satisfaisant, Très bien
    commentaire = db.Column(db.Text)
    date_evaluation = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Compétences spécifiques (stockées en JSON)
    competences = db.Column(db.Text)  # JSON des compétences évaluées
    
    def get_competences(self):
        """Récupère les compétences en format dict"""
        if self.competences:
            return json.loads(self.competences)
        return {}
    
    def set_competences(self, competences_dict):
        """Définit les compétences en format JSON"""
        self.competences = json.dumps(competences_dict)


class Commentaire(db.Model):
    """Modèle pour les commentaires générés par IA"""
    id = db.Column(db.Integer, primary_key=True)
    eleve_id = db.Column(db.Integer, db.ForeignKey('eleve.id'), nullable=False)
    auteur_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type_commentaire = db.Column(db.String(50), nullable=False)  # bulletin, livret, observation
    periode = db.Column(db.String(20), nullable=False)
    annee_scolaire = db.Column(db.String(9), nullable=False)
    contenu = db.Column(db.Text, nullable=False)
    version_ia = db.Column(db.String(20))  # Version de l'IA utilisée
    prompt_utilise = db.Column(db.Text)  # Prompt utilisé pour la génération
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    modifie = db.Column(db.Boolean, default=False)  # Si modifié manuellement


class Parametre(db.Model):
    """Modèle pour les paramètres du système"""
    id = db.Column(db.Integer, primary_key=True)
    cle = db.Column(db.String(100), unique=True, nullable=False)
    valeur = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    type_valeur = db.Column(db.String(20), default='string')  # string, int, bool, json
    date_modification = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_valeur(self):
        """Récupère la valeur selon son type"""
        if self.type_valeur == 'int':
            return int(self.valeur)
        elif self.type_valeur == 'bool':
            return self.valeur.lower() == 'true'
        elif self.type_valeur == 'json':
            return json.loads(self.valeur)
        return self.valeur
    
    def set_valeur(self, valeur):
        """Définit la valeur selon son type"""
        if isinstance(valeur, (dict, list)):
            self.valeur = json.dumps(valeur)
            self.type_valeur = 'json'
        elif isinstance(valeur, bool):
            self.valeur = str(valeur).lower()
            self.type_valeur = 'bool'
        elif isinstance(valeur, int):
            self.valeur = str(valeur)
            self.type_valeur = 'int'
        else:
            self.valeur = str(valeur)
            self.type_valeur = 'string'
        self.date_modification = datetime.utcnow() 