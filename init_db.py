"""
Script d'initialisation de la base de données LSU École du Cap
Crée les tables et ajoute des données de test
"""

from app import app, db
from models import User, Classe, Eleve, Matiere, Evaluation, Commentaire, Parametre
from werkzeug.security import generate_password_hash
from datetime import datetime, date
import json


def init_database():
    """Initialise la base de données avec les données de base"""
    
    with app.app_context():
        # Création des tables
        db.create_all()
        
        print("✅ Tables créées avec succès")
        
        # Vérification si les données existent déjà
        if User.query.first():
            print("⚠️  La base de données contient déjà des données")
            return
        
        # Création des utilisateurs
        print("👥 Création des utilisateurs...")
        
        admin = User(
            username='admin',
            email='admin@ecole-cap.fr',
            nom='Administrateur',
            prenom='Système',
            role='admin',
            actif=True
        )
        admin.set_password('admin123')
        db.session.add(admin)
        
        enseignant1 = User(
            username='dupont.marie',
            email='marie.dupont@ecole-cap.fr',
            nom='Dupont',
            prenom='Marie',
            role='enseignant',
            actif=True
        )
        enseignant1.set_password('enseignant123')
        db.session.add(enseignant1)
        
        enseignant2 = User(
            username='martin.pierre',
            email='pierre.martin@ecole-cap.fr',
            nom='Martin',
            prenom='Pierre',
            role='enseignant',
            actif=True
        )
        enseignant2.set_password('enseignant123')
        db.session.add(enseignant2)
        
        db.session.commit()
        print("✅ Utilisateurs créés")
        
        # Création des matières
        print("📚 Création des matières...")
        
        matieres = [
            {'nom': 'Français', 'code': 'FR', 'description': 'Langue française', 'cycle': 'Cycle 2'},
            {'nom': 'Mathématiques', 'code': 'MA', 'description': 'Mathématiques', 'cycle': 'Cycle 2'},
            {'nom': 'Histoire-Géographie', 'code': 'HG', 'description': 'Histoire et géographie', 'cycle': 'Cycle 3'},
            {'nom': 'Sciences', 'code': 'SC', 'description': 'Sciences et technologie', 'cycle': 'Cycle 3'},
            {'nom': 'Arts plastiques', 'code': 'AP', 'description': 'Arts plastiques', 'cycle': 'Cycle 2'},
            {'nom': 'Éducation musicale', 'code': 'EM', 'description': 'Éducation musicale', 'cycle': 'Cycle 2'},
            {'nom': 'EPS', 'code': 'EPS', 'description': 'Éducation physique et sportive', 'cycle': 'Cycle 2'},
            {'nom': 'Langues vivantes', 'code': 'LV', 'description': 'Langues vivantes', 'cycle': 'Cycle 2'},
        ]
        
        for matiere_data in matieres:
            matiere = Matiere(**matiere_data)
            db.session.add(matiere)
        
        db.session.commit()
        print("✅ Matières créées")
        
        # Création des classes
        print("🏫 Création des classes...")
        
        classe_cp = Classe(
            nom='CP',
            annee_scolaire='2024-2025',
            enseignant_id=enseignant1.id
        )
        db.session.add(classe_cp)
        
        classe_ce1 = Classe(
            nom='CE1',
            annee_scolaire='2024-2025',
            enseignant_id=enseignant1.id
        )
        db.session.add(classe_ce1)
        
        classe_ce2 = Classe(
            nom='CE2',
            annee_scolaire='2024-2025',
            enseignant_id=enseignant2.id
        )
        db.session.add(classe_ce2)
        
        classe_cm1 = Classe(
            nom='CM1',
            annee_scolaire='2024-2025',
            enseignant_id=enseignant2.id
        )
        db.session.add(classe_cm1)
        
        classe_cm2 = Classe(
            nom='CM2',
            annee_scolaire='2024-2025',
            enseignant_id=enseignant2.id
        )
        db.session.add(classe_cm2)
        
        db.session.commit()
        print("✅ Classes créées")
        
        # Création des élèves
        print("👶 Création des élèves...")
        
        eleves_cp = [
            {'nom': 'Dubois', 'prenom': 'Emma', 'date_naissance': date(2017, 3, 15), 'classe_id': classe_cp.id},
            {'nom': 'Leroy', 'prenom': 'Lucas', 'date_naissance': date(2017, 7, 22), 'classe_id': classe_cp.id},
            {'nom': 'Moreau', 'prenom': 'Chloé', 'date_naissance': date(2017, 1, 8), 'classe_id': classe_cp.id},
            {'nom': 'Simon', 'prenom': 'Hugo', 'date_naissance': date(2017, 11, 30), 'classe_id': classe_cp.id},
            {'nom': 'Michel', 'prenom': 'Léa', 'date_naissance': date(2017, 5, 12), 'classe_id': classe_cp.id},
        ]
        
        eleves_ce1 = [
            {'nom': 'Petit', 'prenom': 'Jules', 'date_naissance': date(2016, 9, 3), 'classe_id': classe_ce1.id},
            {'nom': 'Robert', 'prenom': 'Alice', 'date_naissance': date(2016, 12, 18), 'classe_id': classe_ce1.id},
            {'nom': 'Richard', 'prenom': 'Théo', 'date_naissance': date(2016, 4, 25), 'classe_id': classe_ce1.id},
            {'nom': 'Durand', 'prenom': 'Inès', 'date_naissance': date(2016, 8, 7), 'classe_id': classe_ce1.id},
            {'nom': 'Lefebvre', 'prenom': 'Adam', 'date_naissance': date(2016, 2, 14), 'classe_id': classe_ce1.id},
        ]
        
        eleves_ce2 = [
            {'nom': 'Garcia', 'prenom': 'Louise', 'date_naissance': date(2015, 6, 20), 'classe_id': classe_ce2.id},
            {'nom': 'David', 'prenom': 'Raphaël', 'date_naissance': date(2015, 10, 11), 'classe_id': classe_ce2.id},
            {'nom': 'Bertrand', 'prenom': 'Zoé', 'date_naissance': date(2015, 1, 28), 'classe_id': classe_ce2.id},
            {'nom': 'Roux', 'prenom': 'Nathan', 'date_naissance': date(2015, 7, 5), 'classe_id': classe_ce2.id},
            {'nom': 'Vincent', 'prenom': 'Camille', 'date_naissance': date(2015, 3, 17), 'classe_id': classe_ce2.id},
        ]
        
        eleves_cm1 = [
            {'nom': 'Fournier', 'prenom': 'Ethan', 'date_naissance': date(2014, 11, 8), 'classe_id': classe_cm1.id},
            {'nom': 'Morel', 'prenom': 'Jade', 'date_naissance': date(2014, 4, 30), 'classe_id': classe_cm1.id},
            {'nom': 'Girard', 'prenom': 'Louis', 'date_naissance': date(2014, 8, 15), 'classe_id': classe_cm1.id},
            {'nom': 'Andre', 'prenom': 'Nina', 'date_naissance': date(2014, 12, 3), 'classe_id': classe_cm1.id},
            {'nom': 'Lefevre', 'prenom': 'Paul', 'date_naissance': date(2014, 6, 22), 'classe_id': classe_cm1.id},
        ]
        
        eleves_cm2 = [
            {'nom': 'Mercier', 'prenom': 'Sofia', 'date_naissance': date(2013, 2, 9), 'classe_id': classe_cm2.id},
            {'nom': 'Dupuis', 'prenom': 'Antoine', 'date_naissance': date(2013, 9, 14), 'classe_id': classe_cm2.id},
            {'nom': 'Lambert', 'prenom': 'Mia', 'date_naissance': date(2013, 5, 26), 'classe_id': classe_cm2.id},
            {'nom': 'Bonnet', 'prenom': 'Gabriel', 'date_naissance': date(2013, 7, 19), 'classe_id': classe_cm2.id},
            {'nom': 'Francois', 'prenom': 'Eva', 'date_naissance': date(2013, 1, 31), 'classe_id': classe_cm2.id},
        ]
        
        all_eleves = eleves_cp + eleves_ce1 + eleves_ce2 + eleves_cm1 + eleves_cm2
        
        for eleve_data in all_eleves:
            eleve = Eleve(**eleve_data)
            db.session.add(eleve)
        
        db.session.commit()
        print("✅ Élèves créés")
        
        # Création de quelques évaluations de test
        print("📝 Création d'évaluations de test...")
        
        # Récupération des matières
        francais = Matiere.query.filter_by(code='FR').first()
        maths = Matiere.query.filter_by(code='MA').first()
        
        # Quelques évaluations pour les premiers élèves
        evaluations_test = [
            {
                'eleve_id': 1, 'matiere_id': francais.id, 'classe_id': classe_cp.id,
                'periode': 'P1', 'annee_scolaire': '2024-2025', 'niveau': 'Satisfaisant',
                'commentaire': 'Bonne progression en lecture'
            },
            {
                'eleve_id': 1, 'matiere_id': maths.id, 'classe_id': classe_cp.id,
                'periode': 'P1', 'annee_scolaire': '2024-2025', 'niveau': 'Très bien',
                'commentaire': 'Excellent en calcul mental'
            },
            {
                'eleve_id': 2, 'matiere_id': francais.id, 'classe_id': classe_cp.id,
                'periode': 'P1', 'annee_scolaire': '2024-2025', 'niveau': 'Fragile',
                'commentaire': 'Nécessite un soutien en lecture'
            },
            {
                'eleve_id': 6, 'matiere_id': francais.id, 'classe_id': classe_ce1.id,
                'periode': 'P1', 'annee_scolaire': '2024-2025', 'niveau': 'Satisfaisant',
                'commentaire': 'Bon niveau en expression écrite'
            },
        ]
        
        for eval_data in evaluations_test:
            evaluation = Evaluation(**eval_data)
            db.session.add(evaluation)
        
        db.session.commit()
        print("✅ Évaluations de test créées")
        
        # Création des paramètres système
        print("⚙️  Création des paramètres système...")
        
        parametres = [
            {
                'cle': 'ecole_nom',
                'valeur': 'École du Cap',
                'description': 'Nom de l\'établissement',
                'type_valeur': 'string'
            },
            {
                'cle': 'ecole_adresse',
                'valeur': '123 Rue de l\'École, 75000 Paris',
                'description': 'Adresse de l\'établissement',
                'type_valeur': 'string'
            },
            {
                'cle': 'annee_scolaire_courante',
                'valeur': '2024-2025',
                'description': 'Année scolaire en cours',
                'type_valeur': 'string'
            },
            {
                'cle': 'ia_active',
                'valeur': 'true',
                'description': 'Activation du générateur IA',
                'type_valeur': 'bool'
            },
            {
                'cle': 'max_eleves_par_classe',
                'valeur': '25',
                'description': 'Nombre maximum d\'élèves par classe',
                'type_valeur': 'int'
            },
        ]
        
        for param_data in parametres:
            parametre = Parametre(**param_data)
            db.session.add(parametre)
        
        db.session.commit()
        print("✅ Paramètres système créés")
        
        print("\n🎉 Initialisation terminée avec succès !")
        print("\n📋 Comptes de test créés :")
        print("   👤 Admin: admin / admin123")
        print("   👩‍🏫 Enseignant 1: dupont.marie / enseignant123")
        print("   👨‍🏫 Enseignant 2: martin.pierre / enseignant123")
        print("\n📊 Statistiques :")
        print(f"   🏫 Classes: {Classe.query.count()}")
        print(f"   👶 Élèves: {Eleve.query.count()}")
        print(f"   📚 Matières: {Matiere.query.count()}")
        print(f"   📝 Évaluations: {Evaluation.query.count()}")
        print(f"   ⚙️  Paramètres: {Parametre.query.count()}")


if __name__ == '__main__':
    init_database() 