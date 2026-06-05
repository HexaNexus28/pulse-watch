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
    public class NoteRepository : GenericRepository<Note>, INoteRepository
    {
        public NoteRepository(ApplicationDbContext context)
           : base(context)
        {
        }
    }
}
