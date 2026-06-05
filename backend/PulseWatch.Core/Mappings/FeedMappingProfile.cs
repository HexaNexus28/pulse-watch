using AutoMapper;
using PulseWatch.Core.Dtos.Request;
using PulseWatch.Core.Dtos.Response;
using PulseWatch.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PulseWatch.Core.Mappings
{
    public class FeedMappingProfile : Profile
    {
        public FeedMappingProfile()
        {
            // Entity → DTO
            CreateMap<Feed, FeedResponseDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.URL, opt => opt.MapFrom(src => src.URL))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.CategoryId, opt => opt.MapFrom(src => src.CategoryId))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => src.IsActive));

            // DTO → Entity (pour la création)
            CreateMap<CreateFeedDto, Feed>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(_ => true));
        }
    }
}
