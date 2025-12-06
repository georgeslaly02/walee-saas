// entreprises-api.js

// Nous supposons que cette variable ou fonction est définie dans un fichier global utilitaire
const API_BASE_URL = 'http://localhost:8000/api/'; 


async function fetchTypeOrganisations() {
    try {
        const response = await fetch(`${API_BASE_URL}type-organisations/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        throw error;
    }
}

async function listEntreprises() {
    const response = await fetch(`${API_BASE_URL}organisations/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
        }
    });
    
    // Vous pouvez utiliser une fonction utilitaire pour gérer la réponse ici
    if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return response.json();
}
/* Crée une nouvelle entreprise */

async function createEntreprise(dataToSend) {
    console.log('Données envoyées pour création:', dataToSend);
    try {
        const token = localStorage.getItem('access_token');
        console.log("TOKEN JSON depuis localStorage:", token);
        if (dataToSend.autre_type_organisation == true) {
            // Creer le nouveau type organisation et recuperer son id
        }

        if (!token) {
            return {
                success: false,
                message: 'Non authentifié'
            };
        }
        
        const response = await fetch(`${API_BASE_URL}organisations/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });
        const responseData = await response.json();
        console.log("Donnees recu de response :", responseData);
        if (!response.ok) {
            console.log("ERREUR requete :", responseData);
            
            return {
                'success': false,
                "message": responseData.message || `Erreur HTTP: ${response.status}`
            };
        }
        return responseData;
    } catch (error) {
        console.log("ERREUR serveur :", error);
        return {
            'success': false,
            "message": error.message || 'Erreur lors de la création de l\'entreprise'
        };
    }
}

async function updateEntreprise(id, data) {
    const response = await fetch(`${API_BASE_URL}organisations/${id}/`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return response.json();
}

async function deleteEntreprise(id) {
    const response = await fetch(`${API_BASE_URL}organisations/${id}/`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return true; // Suppression réussie
}

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchTypeOrganisations,
        listEntreprises,
        createEntreprise,
        updateEntreprise,
        deleteEntreprise
    };
}