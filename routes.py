"""
Routes principales du système LSU École du Cap
Gestion de toutes les fonctionnalités de l'application
"""

from flask import render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user, login_user, logout_user
from werkzeug.utils import secure_filename
from app import app, db
from models import User, Classe, Eleve, Matiere, Evaluation, Commentaire, Parametre
import os
import json
from datetime import datetime
import openai


# ===== ROUTES D'AUTHENTIFICATION =====

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Page de connexion"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password) and user.actif:
            login_user(user)
            flash('Connexion réussie !', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Identifiants incorrects ou compte inactif', 'error')
    
    return render_template('auth/login.html')


@app.route('/logout')
@login_required
def logout():
    """Déconnexion"""
    logout_user()
    flash('Vous avez été déconnecté', 'info')
    return redirect(url_for('index'))


# ===== ROUTES PRINCIPALES =====

@app.route('/dashboard')
@login_required
def dashboard():
    """Tableau de bord principal"""
    # Statistiques pour l'enseignant
    classes = Classe.query.filter_by(enseignant_id=current_user.id).all()
    total_eleves = sum(len(classe.eleves) for classe in classes)
    
    # Évaluations récentes
    evaluations_recentes = Evaluation.query.join(Classe).filter(
        Classe.enseignant_id == current_user.id
    ).order_by(Evaluation.date_evaluation.desc()).limit(5).all()
    
    return render_template('dashboard.html', 
                         classes=classes,
                         total_eleves=total_eleves,
                         evaluations_recentes=evaluations_recentes)


# ===== GESTION DES CLASSES =====

@app.route('/classes')
@login_required
def classes():
    """Liste des classes de l'enseignant"""
    classes_list = Classe.query.filter_by(
        enseignant_id=current_user.id
    ).order_by(Classe.nom).all()
    return render_template('classes/liste.html', classes=classes_list)


@app.route('/classes/nouvelle', methods=['GET', 'POST'])
@login_required
def nouvelle_classe():
    """Création d'une nouvelle classe"""
    if request.method == 'POST':
        nom = request.form.get('nom')
        annee_scolaire = request.form.get('annee_scolaire')
        
        # Vérification si la classe existe déjà
        classe_existante = Classe.query.filter_by(
            nom=nom, 
            annee_scolaire=annee_scolaire,
            enseignant_id=current_user.id
        ).first()
        
        if classe_existante:
            flash('Cette classe existe déjà pour cette année scolaire', 'error')
        else:
            nouvelle_classe = Classe(
                nom=nom,
                annee_scolaire=annee_scolaire,
                enseignant_id=current_user.id
            )
            db.session.add(nouvelle_classe)
            db.session.commit()
            flash('Classe créée avec succès !', 'success')
            return redirect(url_for('classes'))
    
    return render_template('classes/nouvelle.html')


@app.route('/classes/<int:classe_id>')
@login_required
def detail_classe(classe_id):
    """Détails d'une classe"""
    classe = Classe.query.get_or_404(classe_id)
    
    # Vérification des droits
    if classe.enseignant_id != current_user.id:
        flash('Accès non autorisé', 'error')
        return redirect(url_for('classes'))
    
    return render_template('classes/detail.html', classe=classe)


# ===== GESTION DES ÉLÈVES =====

@app.route('/eleves')
@login_required
def eleves():
    """Liste des élèves de l'enseignant"""
    eleves_list = Eleve.query.join(Classe).filter(
        Classe.enseignant_id == current_user.id
    ).order_by(Eleve.nom, Eleve.prenom).all()
    return render_template('eleves/liste.html', eleves=eleves_list)


@app.route('/eleves/nouveau', methods=['GET', 'POST'])
@login_required
def nouvel_eleve():
    """Ajout d'un nouvel élève"""
    if request.method == 'POST':
        nom = request.form.get('nom')
        prenom = request.form.get('prenom')
        date_naissance = datetime.strptime(
            request.form.get('date_naissance'), '%Y-%m-%d'
        ).date()
        classe_id = request.form.get('classe_id')
        observations = request.form.get('observations', '')
        
        # Vérification des droits sur la classe
        classe = Classe.query.get(classe_id)
        if not classe or classe.enseignant_id != current_user.id:
            flash('Classe non autorisée', 'error')
            return redirect(url_for('eleves'))
        
        nouvel_eleve = Eleve(
            nom=nom,
            prenom=prenom,
            date_naissance=date_naissance,
            classe_id=classe_id,
            observations=observations
        )
        db.session.add(nouvel_eleve)
        db.session.commit()
        flash('Élève ajouté avec succès !', 'success')
        return redirect(url_for('eleves'))
    
    classes = Classe.query.filter_by(enseignant_id=current_user.id).all()
    return render_template('eleves/nouveau.html', classes=classes)


@app.route('/eleves/<int:eleve_id>')
@login_required
def detail_eleve(eleve_id):
    """Détails d'un élève"""
    eleve = Eleve.query.get_or_404(eleve_id)
    
    # Vérification des droits
    if eleve.classe.enseignant_id != current_user.id:
        flash('Accès non autorisé', 'error')
        return redirect(url_for('eleves'))
    
    evaluations = Evaluation.query.filter_by(eleve_id=eleve_id).all()
    commentaires = Commentaire.query.filter_by(eleve_id=eleve_id).all()
    
    return render_template('eleves/detail.html', 
                         eleve=eleve,
                         evaluations=evaluations,
                         commentaires=commentaires)


# ===== GÉNÉRATEUR IA DE COMMENTAIRES =====

@app.route('/generateur')
@login_required
def generateur():
    """Page du générateur IA de commentaires"""
    eleves = Eleve.query.join(Classe).filter(
        Classe.enseignant_id == current_user.id
    ).order_by(Eleve.nom, Eleve.prenom).all()
    
    return render_template('generateur/index.html', eleves=eleves)


@app.route('/generateur/commentaire', methods=['POST'])
@login_required
def generer_commentaire():
    """Génération d'un commentaire par IA"""
    try:
        data = request.get_json()
        eleve_id = data.get('eleve_id')
        type_commentaire = data.get('type_commentaire')
        periode = data.get('periode')
        observations = data.get('observations', '')
        
        # Vérification des droits
        eleve = Eleve.query.get_or_404(eleve_id)
        if eleve.classe.enseignant_id != current_user.id:
            return jsonify({'error': 'Accès non autorisé'}), 403
        
        # Récupération des évaluations de l'élève
        evaluations = Evaluation.query.filter_by(
            eleve_id=eleve_id,
            periode=periode
        ).all()
        
        # Construction du prompt pour l'IA
        prompt = construire_prompt_ia(eleve, evaluations, type_commentaire, 
                                    observations, periode)
        
        # Appel à l'API OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Tu es un enseignant expérimenté qui rédige des commentaires d'évaluation pour le Livret Scolaire Unique. Tes commentaires sont bienveillants, précis et constructifs."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        commentaire_ia = response.choices[0].message.content
        
        # Sauvegarde du commentaire
        nouveau_commentaire = Commentaire(
            eleve_id=eleve_id,
            auteur_id=current_user.id,
            type_commentaire=type_commentaire,
            periode=periode,
            annee_scolaire=eleve.classe.annee_scolaire,
            contenu=commentaire_ia,
            version_ia="gpt-3.5-turbo",
            prompt_utilise=prompt
        )
        db.session.add(nouveau_commentaire)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'commentaire': commentaire_ia,
            'id_commentaire': nouveau_commentaire.id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def construire_prompt_ia(eleve, evaluations, type_commentaire, observations, 
                        periode):
    """Construction du prompt pour l'IA"""
    prompt = f"""
    Élève: {eleve.prenom} {eleve.nom} - Classe: {eleve.classe.nom}
    Période: {periode}
    Type de commentaire: {type_commentaire}
    
    Observations de l'enseignant: {observations}
    
    Évaluations de la période:
    """
    
    for eval in evaluations:
        prompt += f"- {eval.matiere.nom}: {eval.niveau}\n"
        if eval.commentaire:
            prompt += f"  Commentaire: {eval.commentaire}\n"
    
    prompt += f"""
    Génère un commentaire {type_commentaire} pour {eleve.prenom} {eleve.nom} 
    en te basant sur ces informations. Le commentaire doit être:
    - Bienveillant et encourageant
    - Précis sur les acquis et les difficultés
    - Constructif avec des pistes d'amélioration
    - Adapté au niveau de la classe {eleve.classe.nom}
    - Entre 3 et 5 phrases maximum
    """
    
    return prompt


# ===== GESTION DES PHOTOS =====

@app.route('/photos')
@login_required
def photos():
    """Gestion des photos de classe"""
    classes = Classe.query.filter_by(enseignant_id=current_user.id).all()
    return render_template('photos/index.html', classes=classes)


@app.route('/photos/upload', methods=['POST'])
@login_required
def upload_photo():
    """Upload d'une photo de classe"""
    if 'photo' not in request.files:
        flash('Aucun fichier sélectionné', 'error')
        return redirect(url_for('photos'))
    
    file = request.files['photo']
    classe_id = request.form.get('classe_id')
    
    if file.filename == '':
        flash('Aucun fichier sélectionné', 'error')
        return redirect(url_for('photos'))
    
    # Vérification des droits
    classe = Classe.query.get_or_404(classe_id)
    if classe.enseignant_id != current_user.id:
        flash('Accès non autorisé', 'error')
        return redirect(url_for('photos'))
    
    if file:
        filename = secure_filename(f"classe_{classe_id}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'photos', filename)
        file.save(filepath)
        
        # Mise à jour de la base de données
        classe.photo_classe = f"uploads/photos/{filename}"
        db.session.commit()
        
        flash('Photo uploadée avec succès !', 'success')
    
    return redirect(url_for('photos'))


# ===== PARAMÈTRES =====

@app.route('/parametres')
@login_required
def parametres():
    """Page des paramètres"""
    if current_user.role != 'admin':
        flash('Accès réservé aux administrateurs', 'error')
        return redirect(url_for('dashboard'))
    
    parametres_list = Parametre.query.all()
    return render_template('parametres/index.html', parametres=parametres_list)


@app.route('/parametres/modifier', methods=['POST'])
@login_required
def modifier_parametre():
    """Modification d'un paramètre"""
    if current_user.role != 'admin':
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    try:
        data = request.get_json()
        cle = data.get('cle')
        valeur = data.get('valeur')
        
        parametre = Parametre.query.filter_by(cle=cle).first()
        if parametre:
            parametre.set_valeur(valeur)
            db.session.commit()
            return jsonify({'success': True})
        else:
            return jsonify({'error': 'Paramètre non trouvé'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500 