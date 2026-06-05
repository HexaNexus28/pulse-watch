using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Core.Interfaces.Repositories
{
    /// <summary>
    /// Interface générique pour les opérations CRUD de base
    /// Implémente le pattern Repository
    /// </summary>
    /// <typeparam name="T">Type de l'entité</typeparam>
    public interface IGenericRepository<T> where T : class
    {
        // ========== CREATE Operations ==========

        /// <summary>
        /// Ajoute une nouvelle entité de manière asynchrone
        /// </summary>
        /// <param name="entity">L'entité à ajouter</param>
        /// <returns>L'entité ajoutée avec son ID généré</returns>
        Task<T> AddAsync(T entity);
        /// <summary>
        /// Ajoute plusieurs entités en une seule opération
        /// </summary>
        /// <param name="entities">Collection d'entités àajouter</param>
        Task AddRangeAsync(IEnumerable<T> entities);
        // ========== READ Operations ==========

        /// <summary>
        /// Récupère une entité par son ID
        /// </summary>
        /// <param name="id">ID de l'entité</param>
        /// <returns>L'entité ou null si non trouvée</returns>
        Task<T?> GetByIdAsync(int id);
        /// <summary>
        /// Récupère toutes les entités
        /// ATTENTION : À utiliser avec précaution sur de grandes tables
         /// </summary>
         /// <returns>Collection de toutes les entités</returns>
         Task<IEnumerable<T>> GetAllAsync();
        /// <summary>
        /// Trouve des entités selon un prédicat
        /// Exemple : FindAsync(u => u.IsActive == true)
        /// </summary>
        /// <param name="predicate">Expression de filtrage</param>
        /// <returns>Collection des entités correspondantes</returns>
         Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>>
        predicate);
        /// <summary>
        /// Récupère la première entité correspondant au prédicat
        /// </summary>
        /// <param name="predicate">Expression de filtrage</param>
        /// <returns>La première entité ou null</returns>
        Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>>
       predicate);
        /// <summary>
        /// Vérifie si une entité existe selon le prédicat
        /// Plus performant que GetByX() != null
        /// </summary>
        /// <param name="predicate">Expression de filtrage</param>
        /// <returns>True si existe, False sinon</returns>
        Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate);
        /// <summary>
        /// Compte le nombre d'entités (avec filtre optionnel)
        /// </summary>
        /// <param name="predicate">Expression de filtrage optionnelle</param>
         /// <returns>Le nombre d'entités</returns>
         Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null);
 // ========== READ with Pagination ==========

 /// <summary>
 /// Récupère une page d'entités
 /// </summary>
 /// <param name="pageNumber">Numéro de page (commence à 1)</param>
 /// <param name="pageSize">Nombre d'éléments par page</param>
 /// <returns>Collection paginée</returns>
 Task<IEnumerable<T>> GetPagedAsync(int pageNumber, int pageSize);
        /// <summary>
        /// Récupère une page avec filtrage et tri
        /// </summary>
        /// <param name="pageNumber">Numéro de page</param>
        /// <param name="pageSize">Taille de page</param>
        /// <param name="filter">Filtre optionnel</param>
        /// <param name="orderBy">Expression de tri</param>
        /// <param name="ascending">Tri ascendant (true) ou descendant(false)</param>
 Task<(IEnumerable<T> items, int totalCount)> GetPagedAsync(
 int pageNumber,
 int pageSize,
 Expression<Func<T, bool>>? filter = null,
 Expression<Func<T, object>>? orderBy = null,
 bool ascending = true);
        // ========== UPDATE Operations ==========
        /// <summary>
        /// Met à jour une entité
        /// NOTE : L'entité doit être attachée au contexte
        /// </summary>
        /// <param name="entity">L'entité modifiée</param>
        void Update(T entity);
        /// <summary>
        /// Met à jour plusieurs entités
        /// </summary>
        /// <param name="entities">Collection d'entités modifiées</param>
 void UpdateRange(IEnumerable<T> entities);
        // ========== DELETE Operations ==========

        /// <summary>
        /// Supprime une entité
        /// </summary>
        /// <param name="entity">L'entité à supprimer</param>
        void Remove(T entity);
        /// <summary>
        /// Supprime plusieurs entités
        /// </summary>
        /// <param name="entities">Collection d'entités à supprimer</param>
 void RemoveRange(IEnumerable<T> entities);
        // ========== SAVE Operations ==========

        /// <summary>
        /// Sauvegarde tous les changements en base de données
        /// IMPORTANT : Doit être appelé après Add/Update/Remove
        /// </summary>
        /// <returns>Le nombre d'enregistrements affectés</returns>
        Task<int> SaveChangesAsync();
        // ========== Advanced Operations ==========

        /// <summary>
        /// Récupère une entité avec ses relations (eager loading)
        /// </summary>
        /// <param name="predicate">Condition de filtrage</param>
        /// <param name="includeProperties">Propriétés à inclure (ex: "Role,Permissions")</param>
 Task<T?> GetWithIncludesAsync(
 Expression<Func<T, bool>> predicate,
 params string[] includeProperties);
        /// <summary>
        /// Exécute une requête SQL brute
        /// À utiliser avec prudence!
        /// </summary>
        /// <param name="sql">Requête SQL</param>
        /// <param name="parameters">Paramètres SQL</param>
        Task<IEnumerable<T>> FromSqlRawAsync(string sql, params
       object[] parameters);
    }
}
