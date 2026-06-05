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
    public class SummaryRepository : GenericRepository<Summary>,ISummaryRepository
    {
        public SummaryRepository(ApplicationDbContext context)
          : base(context)
        {
        }
        public async Task<IEnumerable<Summary>> GetSummariesByUserAsync(int UserId)
        {
            return await _dbSet
                .Include(u => u.User)
                .Where(u => u.UserId == UserId)
                .ToListAsync();
        }
    }
}
