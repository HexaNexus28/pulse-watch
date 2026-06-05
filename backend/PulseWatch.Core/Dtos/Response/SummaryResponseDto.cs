using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Core.Dtos.Response
{
  public class SummaryResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int TrendId { get; set; }
        public string TrendKeyword { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }

    }
}
