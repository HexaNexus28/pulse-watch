using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Core.Interfaces.Repositories
{
    // <summary>
    /// Interface pour le pattern Unit of Work
    /// Coordonne le travail de plusieurs repositories
    /// </summary>
    public interface IUnitOfWork : IDisposable
    {
        IUserRepository Users { get; }
        ICategoryRepository Categories { get; }
        INoteRepository Notes { get; }

        ITrendRepository Trends { get; }

        IFeedRepository Feeds { get; }
        ISummaryRepository Summaries { get; }

        Task<int> SaveChangesAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }

}
