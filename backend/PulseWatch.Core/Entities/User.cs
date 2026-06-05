using PulseWatch.Core.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PulseWatch.Core.Entities
{
    /// <summary>
    /// Entité représentant un utilisateur dans le système
    /// </summary>
    [Table("Users")]
    public class User
    {
        #region Base Properties
        [Key]
        [Required]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public bool IsActive { get; set; } = true;

        public string? RefreshToken { get; set; }

        public DateTime? RefreshTokenExpiryTime { get; set; }
        #endregion

        #region Relations
        public virtual ICollection<Category> Categories { get; set; } = new List<Category>();
        public virtual ICollection<Summary> Summaries { get; set; } = new List<Summary>();
        #endregion

        #region Constructor
        public User()
        {
            CreatedAt = DateTime.UtcNow;
        }
        #endregion




    }
}