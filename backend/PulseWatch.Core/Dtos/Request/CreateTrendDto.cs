using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Core.Dtos.Request
{
  public class CreateTrendDto
    {
        public string Keyword { get; set; }= string.Empty;
        public int CategoryId { get; set; }
    }
}
