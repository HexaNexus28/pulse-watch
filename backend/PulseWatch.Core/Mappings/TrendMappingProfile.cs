using AutoMapper;
using PulseWatch.Core.Dtos.Response;
using PulseWatch.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Core.Mappings
{
   public class TrendMappingProfile : Profile
    {
        public TrendMappingProfile()
        {
            // Entity → DTO
            CreateMap<Trend, TrendResponseDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.CategoryId))
                .ForMember(dest => dest.Score, opt => opt.MapFrom(src => src.Score))
                .ForMember(dest => dest.Data, opt => opt.MapFrom(src => src.Data))
                .ForMember(dest => dest.GeneratedAt, opt => opt.MapFrom(src => src.GeneratedAt));
        }
    }
}
