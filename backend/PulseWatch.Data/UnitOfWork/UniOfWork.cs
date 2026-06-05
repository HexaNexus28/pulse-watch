using Microsoft.EntityFrameworkCore.Storage;
using PulseWatch.Core.Interfaces.Repositories;
using PulseWatch.Data.Context;
using PulseWatch.Data.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Data.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private IDbContextTransaction? _transaction;

        // Repositories lazy loading
        private IUserRepository? _userRepository;
        private INoteRepository? _noteRepository;
        private ICategoryRepository? _categoryRepository;
        private ITrendRepository? _trendRepository;
        private IFeedRepository? _feedRepository;
        private ISummaryRepository? _summaryRepository;
        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
        }

        public IUserRepository Users
        {
            get
            {
                _userRepository ??= new UserRepository(_context);
                return _userRepository;
            }
        }

        public INoteRepository Notes
        {
            get
            {
                _noteRepository ??= new NoteRepository(_context);
                return _noteRepository;
            }
        }

        public ICategoryRepository Categories
        {
            get
            {
                _categoryRepository ??= new CategoryRepository(_context);
                return _categoryRepository;
            }
        }

        public IFeedRepository Feeds
        {
            get
            {
                _feedRepository ??= new FeedRepository(_context);
                return _feedRepository;
            }
        }

        public ITrendRepository Trends
        {
            get
            {
                _trendRepository ??= new TrendRepository(_context);
                return _trendRepository;
            }
        }
        public ISummaryRepository Summaries
        {
            get
            {
                _summaryRepository ??= new SummaryRepository(_context);
                return _summaryRepository;
            }

        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task BeginTransactionAsync()
        {
            _transaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.CommitAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public async Task RollbackTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                _transaction?.Dispose();
                _context.Dispose();
            }
        }
    }
}
