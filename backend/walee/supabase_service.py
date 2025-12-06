
import requests
from rest_framework import status
from django.conf import settings # Importation essentielle pour recuperer les variables

SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_ANON_KEY = settings.SUPABASE_ANON_KEY

# Importez vos variables d'environnement
# from config import SUPABASE_URL, SUPABASE_ANON_KEY 

# supabase_service.py
def proxy_to_supabase(request_method, table_name, request, pk=None, data=None,order_by=None):
    """
    Fonction générique pour proxy vers Supabase PostgREST
    
    Args:
        request_method: 'GET', 'POST', 'PATCH', 'DELETE'
        table_name: nom de la table Supabase ('organisations', 'type_organisations')
        request: objet request Django
        pk: ID pour les opérations sur un élément spécifique
        data: données pour POST/PATCH
        order_by: optionnel, pour trier les résultats (ex: 'name.asc' ou 'created_at.desc')
    """
    # Récupération du token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return {'error': "Token Bearer invalide ou manquant."}, status.HTTP_401_UNAUTHORIZED
    
    access_token = auth_header.split(' ', 1)[1].strip()
    
    # Construction des headers
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Construction de l'URL
    if pk:
        url = f"{SUPABASE_URL}/rest/v1/{table_name}?id=eq.{pk}"
    else:
        url = f"{SUPABASE_URL}/rest/v1/{table_name}"
    
    # Construction des paramètres de requête
    params = {}

    # Ajout de l'ordre si spécifié
    if order_by:
        # Supprimer .asc ou .desc si présent
        clean_order_by = order_by.replace('.asc', '').replace('.desc', '')
        # Déterminer la direction
        direction = 'asc' if '.asc' in order_by or '.desc' not in order_by else 'desc'
        params['order'] = f"{clean_order_by}.{direction}"
    
    # Ajouter les autres paramètres de la requête
    for key, value in request.GET.items():
        if key != 'order':  # Ne pas écraser le order qu'on a défini
            params[key] = value
    try:
        # Exécution de la requête
        if request_method in ['GET', 'DELETE']:
            response = requests.request(
                method=request_method, 
                url=url, 
                headers=headers, 
                params=params
            )
        else:  # POST, PATCH
            response = requests.request(
                method=request_method, 
                url=url, 
                headers=headers, 
                json=data,
                params=params
            )
        
        response.raise_for_status()
        
        # Pour DELETE, souvent pas de contenu
        if request_method == 'DELETE':
            return {"success": True}, status.HTTP_204_NO_CONTENT
            
        # Pour les autres méthodes, retourner le JSON
        return response.json(), response.status_code

    except requests.exceptions.HTTPError as e:
        try:
            error_details = response.json()
        except:
            error_details = {"detail": f"Erreur Supabase: {str(e)}"}
        return error_details, response.status_code
        
    except Exception as e:
        return {"detail": f"Erreur de proxy: {str(e)}"}, status.HTTP_500_INTERNAL_SERVER_ERROR