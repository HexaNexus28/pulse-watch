using Microsoft.EntityFrameworkCore;
using PulseWatch.Core.Entities;
using PulseWatch.Core.Interfaces.Repositories;
using PulseWatch.Data.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Data.Repositories
{
    public class TrendRepository : GenericRepository<Trend>, ITrendRepository
    {
        public TrendRepository(ApplicationDbContext context)
          : base(context)
        {
        }
        public async Task<Trend?> GetTrendWithCategoryAsync(int trendId)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(t => t.Category)
                .FirstOrDefaultAsync(t => t.Id == trendId);
        }
        public async Task<IReadOnlyList<Trend?>> GetByCategoryAsync(int CategoryId)
        {
            return await _dbSet
                .AsNoTracking()
                .Where(t=>t.CategoryId == CategoryId).ToListAsync();
        }
    }
}
