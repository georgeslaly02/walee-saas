async function fetchCountries() {
    try {
        const response = await fetch("https://www.apicountries.com/countries");
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Erreur lors de la récupération des pays :", error);
        return [];
    }
}