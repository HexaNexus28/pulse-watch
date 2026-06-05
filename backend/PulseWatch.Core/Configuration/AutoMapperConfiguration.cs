using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using PulseWatch.Core.Mappings;

namespace PulseWatch.Core.Configuration
{
    /// <summary>
    /// Configuration centralisée d'AutoMapper
    /// </summary>
    public static class AutoMapperConfiguration
    {
        private static IMapper? _mapper;
        private static MapperConfiguration? _configuration;
        private static readonly object _lock = new object();

        /// <summary>
        /// Crée la configuration AutoMapper
        /// </summary>
        public static MapperConfiguration CreateConfiguration()
        {
            var configuration = new MapperConfiguration(cfg =>
            {
                // Ajouter tous les profils
                cfg.AddProfile<UserMappingProfile>();
                cfg.AddProfile<TrendMappingProfile>();

                // Ajouter automatiquement tous les profils de l'assembly
                cfg.AddMaps(typeof(AutoMapperConfiguration).Assembly);

                // Configuration des propriétés selon la version d'AutoMapper
                ConfigureMapperProperties(cfg);
            });

            // Valider la configuration en mode Debug
#if DEBUG
            try
            {
                configuration.AssertConfigurationIsValid();
            }
            catch (AutoMapperConfigurationException ex)
            {
                // Logger l'erreur mais ne pas faire crasher l'application en dev
                Console.WriteLine($"AutoMapper configuration warning: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"AutoMapper configuration warning: {ex.Message}");
            }
#endif

            _configuration = configuration;
            return configuration;
        }

        /// <summary>
        /// Configure les propriétés spécifiques à la version d'AutoMapper
        /// </summary>
        internal static void ConfigureMapperProperties(IMapperConfigurationExpression cfg)
        {
            // Utiliser la réflexion pour vérifier si les propriétés existent
            var configType = cfg.GetType();

            // Vérifier et définir AllowNullCollections si disponible
            var allowNullCollectionsProperty = configType.GetProperty("AllowNullCollections");
            if (allowNullCollectionsProperty != null && allowNullCollectionsProperty.CanWrite)
            {
                try
                {
                    allowNullCollectionsProperty.SetValue(cfg, true);
                }
                catch (Exception ex)
                {
                    // Logger si nécessaire
                    System.Diagnostics.Debug.WriteLine($"Could not set AllowNullCollections: {ex.Message}");
                }
            }

            // Vérifier et définir AllowNullDestinationValues si disponible
            var allowNullDestValuesProperty = configType.GetProperty("AllowNullDestinationValues");
            if (allowNullDestValuesProperty != null && allowNullDestValuesProperty.CanWrite)
            {
                try
                {
                    allowNullDestValuesProperty.SetValue(cfg, true);
                }
                catch (Exception ex)
                {
                    // Logger si nécessaire
                    System.Diagnostics.Debug.WriteLine($"Could not set AllowNullDestinationValues: {ex.Message}");
                }
            }
        }

        /// <summary>
        /// Obtient une instance du mapper (singleton thread-safe)
        /// </summary>
        public static IMapper GetMapper()
        {
            if (_mapper == null)
            {
                lock (_lock)
                {
                    if (_mapper == null)
                    {
                        var configuration = _configuration ?? CreateConfiguration();
                        _mapper = configuration.CreateMapper();
                    }
                }
            }
            return _mapper;
        }

        /// <summary>
        /// Crée un nouveau mapper (nouvelle instance)
        /// </summary>
        public static IMapper CreateMapper()
        {
            var configuration = CreateConfiguration();
            return configuration.CreateMapper();
        }

        /// <summary>
        /// Valide la configuration (à appeler dans les tests)
        /// </summary>
        public static void ValidateConfiguration()
        {
            var configuration = _configuration ?? CreateConfiguration();
            ValidateConfiguration(configuration);
        }

        /// <summary>
        /// Valide une configuration spécifique
        /// </summary>
        public static void ValidateConfiguration(MapperConfiguration config)
        {
            try
            {
                config.AssertConfigurationIsValid();
            }
            catch (AutoMapperConfigurationException ex)
            {
                throw new InvalidOperationException($"La configuration AutoMapper est invalide: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Erreur lors de la validation de la configuration AutoMapper: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Réinitialise la configuration (utile pour les tests)
        /// </summary>
        public static void Reset()
        {
            lock (_lock)
            {
                _mapper = null;
                _configuration = null;
            }
        }
    }

    /// <summary>
    /// Extension pour l'injection de dépendances (si vous utilisez un conteneur DI)
    /// </summary>
    public static class AutoMapperServiceCollectionExtensions
    {
        /// <summary>
        /// Ajoute AutoMapper au conteneur de services (pour ASP.NET Core)
        /// </summary>
        public static IServiceCollection AddAutoMapperConfiguration(this IServiceCollection services)
        {
            var configuration = AutoMapperConfiguration.CreateConfiguration();

            // Enregistrer la configuration comme singleton
            services.AddSingleton(configuration);

            // Enregistrer le mapper comme singleton
            services.AddSingleton<IMapper>(provider =>
            {
                var config = provider.GetRequiredService<MapperConfiguration>();
                return new Mapper(config);
            });

            // Valider la configuration au démarrage
#if DEBUG
            try
            {
                configuration.AssertConfigurationIsValid();
            }
            catch (Exception ex)
            {
                // En développement, logger l'avertissement mais ne pas faire crasher
                Console.WriteLine($"AutoMapper configuration warning at startup: {ex.Message}");
            }
#endif

            return services;
        }

        /// <summary>
        /// Ajoute AutoMapper avec des profils personnalisés
        /// </summary>
        public static IServiceCollection AddAutoMapperConfiguration(this IServiceCollection services, params Assembly[] assemblies)
        {
            var configuration = new MapperConfiguration(cfg =>
            {
                cfg.AddMaps(assemblies);
                AutoMapperConfiguration.ConfigureMapperProperties(cfg);
            });

            services.AddSingleton(configuration);
            services.AddSingleton<IMapper>(provider => new Mapper(configuration));

            return services;
        }
    }
}