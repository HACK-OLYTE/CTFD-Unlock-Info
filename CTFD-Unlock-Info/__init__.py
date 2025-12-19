from flask import Blueprint, render_template, jsonify
from CTFd.plugins import (
    register_plugin_assets_directory,
    register_plugin_script
)
from CTFd.models import Challenges, Solves
from CTFd.utils.user import get_current_user, get_current_team
from CTFd.utils.decorators import authed_only,admins_only
import json


def load(app):
    unlock_info_bp = Blueprint(
        'ctfd_unlock_info',
        __name__,
        static_folder='assets',
        template_folder='templates',
        url_prefix='/plugins/ctfd-unlock-info'
    )

    @unlock_info_bp.route('/api/unlock_info_all', methods=['GET'])
    @authed_only
    def unlock_info_all():
        user = get_current_user()
        team = get_current_team()
        if not user:
            return jsonify({})

        # Support team & user mode - Récupération correcte des solves
        if team:
            solves = Solves.query.filter_by(team_id=team.id).with_entities(Solves.challenge_id).all()
        else:
            solves = Solves.query.filter_by(user_id=user.id).with_entities(Solves.challenge_id).all()

        solved_ids = {s.challenge_id for s in solves}

        unlocked_by_map = {}
        
        # Tous les challenges non cachés
        all_challenges = Challenges.query.filter(Challenges.state != 'hidden').all()
        
        # Fonction pour vérifier si un challenge est déverrouillé
        def is_challenge_unlocked(challenge):
            # Si déjà résolu, il est forcément visible
            if challenge.id in solved_ids:
                return True
                
            # Vérifie les requirements
            try:
                reqs = None
                if challenge.requirements is None:
                    return True  # Pas de requirements = déverrouillé
                    
                if isinstance(challenge.requirements, str):
                    if not challenge.requirements.strip():
                        return True
                    reqs = json.loads(challenge.requirements)
                else:
                    reqs = challenge.requirements

                if isinstance(reqs, dict) and 'prerequisites' in reqs:
                    req_ids = reqs['prerequisites']
                    if not isinstance(req_ids, list) or not req_ids:
                        return True
                    
                    # Déverrouillé seulement si TOUTES les dépendances sont résolues
                    return all(req_id in solved_ids for req_id in req_ids)
                else:
                    return True  # Pas de prerequisites = déverrouillé
                    
            except Exception:
                return True  # En cas d'erreur, on considère comme déverrouillé
        
        # Détermine quels challenges sont réellement visibles à l'écran
        visible_challenges = []
        for challenge in all_challenges:
            if is_challenge_unlocked(challenge):
                visible_challenges.append(challenge)
        
        visible_challenge_ids = {c.id for c in visible_challenges}

        # Maintenant, on ne traite QUE les challenges visibles
        for challenge in visible_challenges:
            try:
                reqs = None
                
                if challenge.requirements is None:
                    continue
                    
                if isinstance(challenge.requirements, str):
                    if challenge.requirements.strip():
                        reqs = json.loads(challenge.requirements)
                    else:
                        continue
                else:
                    reqs = challenge.requirements

                if isinstance(reqs, dict) and 'prerequisites' in reqs:
                    req_ids = reqs['prerequisites']
                    
                    if not isinstance(req_ids, list) or not req_ids:
                        continue
                    
                    # SÉCURITÉ : Ne garde que les requirements de challenges VISIBLES
                    visible_req_ids = [int(req_id) for req_id in req_ids 
                        if isinstance(req_id, int) and req_id in visible_challenge_ids]
                    
                    if not visible_req_ids:
                        continue
                        
                    # Ne récupère que les noms des challenges visibles
                    req_challs = [c for c in visible_challenges if c.id in visible_req_ids]
                    req_names = [c.name for c in req_challs if c.name]
                    
                    if req_names:
                        unlocked_by_map[str(challenge.id)] = req_names
                            
            except Exception as e:
                continue

        return jsonify(unlocked_by_map)

    @app.route('/admin/plugins/ctfd-unlock-info')
    @admins_only
    def admin_unlock_info():
        return render_template('admin.html')

    app.register_blueprint(unlock_info_bp)
    register_plugin_assets_directory(app, base_path='/plugins/ctfd-unlock-info/assets')
    register_plugin_script("/plugins/ctfd-unlock-info/assets/inject-unlock-info.js")