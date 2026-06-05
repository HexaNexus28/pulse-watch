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
    public class FeedRepository : GenericRepository<Feed>, IFeedRepository
    {
        public FeedRepository(ApplicationDbContext context)
           : base(context)
        {
        }
        public async Task<IEnumerable<Feed>> GetFeedsByCategoryAsync(int CategoryId)
        {
            return await _dbSet
                .Include(u => u.Category)
                .Where(u => u.CategoryId == CategoryId)
                .ToListAsync();
        }
        public async Task<bool> IsUrlUniqueAsync(string url)
        {
            var query = await _dbSet.FirstOrDefaultAsync(u => u.URL == url);

            

            return query==null;
        }
        

    }
}
