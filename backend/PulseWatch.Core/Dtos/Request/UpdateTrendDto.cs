using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Core.Dtos.Request
{
    public class UpdateTrendDto
    {
        public string? Keyword { get; set; }
        public int? CategoryId { get; set; }
    }
}
