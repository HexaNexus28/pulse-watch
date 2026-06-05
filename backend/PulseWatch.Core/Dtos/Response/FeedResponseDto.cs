using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Core.Dtos.Response
{
    public class FeedResponseDto
    {
        public int Id { get; set; }
        public string URL { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int CategoryId { get; set; }
        public int? UserId { get; set; }
        public bool IsActive { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }
}
