import { useState, useEffect } from "react";
import type { FundingOpportunity } from "@shared/schema";

const FAVORITES_KEY = "richat_funding_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);

  // Charger les favoris depuis localStorage au démarrage
  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFavorites(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.warn("Error parsing favorites from localStorage:", error);
        setFavorites([]);
      }
    }
  }, []);

  // Sauvegarder les favoris dans localStorage
  const saveFavorites = (newFavorites: number[]) => {
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  // Ajouter un appel aux favoris
  const addToFavorites = (opportunityId: number) => {
    const newFavorites = [...favorites, opportunityId];
    saveFavorites(newFavorites);
  };

  // Retirer un appel des favoris
  const removeFromFavorites = (opportunityId: number) => {
    const newFavorites = favorites.filter(id => id !== opportunityId);
    saveFavorites(newFavorites);
  };

  // Basculer le statut favori d'un appel
  const toggleFavorite = (opportunityId: number) => {
    if (favorites.includes(opportunityId)) {
      removeFromFavorites(opportunityId);
    } else {
      addToFavorites(opportunityId);
    }
  };

  // Vérifier si un appel est en favoris
  const isFavorite = (opportunityId: number) => {
    return favorites.includes(opportunityId);
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
  };
}