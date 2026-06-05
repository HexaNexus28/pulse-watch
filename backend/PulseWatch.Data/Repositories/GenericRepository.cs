using Microsoft.EntityFrameworkCore;
using PulseWatch.Core.Interfaces.Repositories;
using System.Linq.Expressions;
using PulseWatch.Data.Context;
namespace PulseWatch.Data.Repositories
{
    /// <summary>
    /// Implémentation générique du repository
    /// Fournit les opérations CRUD de base pour toute entité
    /// </summary>
    public class GenericRepository<T> : IGenericRepository<T> where
   T : class
    {
        protected readonly ApplicationDbContext _context;
        protected readonly DbSet<T> _dbSet;
        public GenericRepository(ApplicationDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }
        #region CREATE Operations
        /// <summary>
        /// Ajoute une nouvelle entité
        /// </summary>
        public async Task<T> AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            return entity;
        }
        /// <summary>
        /// Ajoute plusieurs entités
        /// </summary>
        public async Task AddRangeAsync(IEnumerable<T> entities)
        {
            await _dbSet.AddRangeAsync(entities);
        }
        #endregion
        #region READ Operations
        /// <summary>
        /// Récupère une entité par son ID
        /// </summary>
        public virtual async Task<T?> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }
        /// <summary>
        /// Récupère toutes les entités
        /// Attention : peut être lourd en mémoire pour grandes tables
 /// </summary>
 public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }
        /// <summary>
        /// Trouve des entités selon un prédicat
        /// Exemple : FindAsync(u => u.IsActive == true)
        /// </summary>
        public async Task<IEnumerable<T>>
       FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.Where(predicate).ToListAsync();
        }
        /// <summary>
        /// Récupère la première entité correspondant au prédicat
        /// </summary>
        public async Task<T?> FirstOrDefaultAsync(Expression<Func<T,
       bool>> predicate)
        {
            return await _dbSet.FirstOrDefaultAsync(predicate);
        }
        /// <summary>
        /// Vérifie si une entité existe selon le prédicat
        /// </summary>
        public async Task<bool> ExistsAsync(Expression<Func<T,
       bool>> predicate)
        {
            return await _dbSet.AnyAsync(predicate);
        }
        /// <summary>
        /// Compte les entités (avec prédicat optionnel)
        /// </summary>
        public async Task<int> CountAsync(Expression<Func<T, bool>>?
       predicate = null)
        {
            if (predicate == null)
                return await _dbSet.CountAsync();

            return await _dbSet.CountAsync(predicate);
        }
        /// <summary>
        /// Récupère les entités avec pagination
        /// </summary>
        public async Task<IEnumerable<T>> GetPagedAsync(int
       pageNumber, int pageSize)
        {
            return await _dbSet
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        }
        #endregion#region UPDATE Operations
        /// <summary>
        /// Met à jour une entité
        /// Note : L'entité doit être attachée au contexte
        /// </summary>
        public void Update(T entity)
        {
            _dbSet.Attach(entity);
            _context.Entry(entity).State = EntityState.Modified;
        }
        /// <summary>
        /// Met à jour plusieurs entités
        /// </summary>
        public void UpdateRange(IEnumerable<T> entities)
        {
            _dbSet.UpdateRange(entities);
        }
    
        /// <summary>
        /// Supprime une entité
        /// </summary>
        public void Remove(T entity)
        {
            if (_context.Entry(entity).State ==
           EntityState.Detached)
            {
                _dbSet.Attach(entity);
            }
            _dbSet.Remove(entity);
        }
        /// <summary>
        /// Supprime plusieurs entités
        /// </summary>
        public void RemoveRange(IEnumerable<T> entities)
        {
            _dbSet.RemoveRange(entities);
        }
      
        /// <summary>
        /// Sauvegarde les changements dans la base de données
        /// Retourne le nombre d'enregistrements affectés
        /// </summary>
        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public Task<(IEnumerable<T> items, int totalCount)> GetPagedAsync(int pageNumber, int pageSize, Expression<Func<T, bool>>? filter = null, Expression<Func<T, object>>? orderBy = null, bool ascending = true)
        {
            throw new NotImplementedException();
        }

        public Task<T?> GetWithIncludesAsync(Expression<Func<T, bool>> predicate, params string[] includeProperties)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<T>> FromSqlRawAsync(string sql, params object[] parameters)
        {
            throw new NotImplementedException();
        }
     
    }
}