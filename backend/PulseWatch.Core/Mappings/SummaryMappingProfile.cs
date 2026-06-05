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
   public class SummaryMappingProfile :Profile
    {
        public SummaryMappingProfile() {
            CreateMap<Summary, SummaryResponseDto>()
                   .ForMember(dest => dest.TrendKeyword, opt => opt.MapFrom(src => src.Trend.Data)) ;
            CreateMap<CreateSummaryDto, Summary>();
            CreateMap<UpdateSummaryDto, Summary>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
