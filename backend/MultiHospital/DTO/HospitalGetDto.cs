using System;
using System.Collections.Generic;

namespace MultiHospital.DTOs
{
    public class HospitalGetDto
    {
        public int HospitalID { get; set; } // Unique identifier for the hospital
        public string Name { get; set; } = null!; // Name of the hospital
        public string Address { get; set; } = null!; // Address of the hospital
        public string? Phone { get; set; } // Phone number of the hospital
        public string? Email { get; set; } // Email address of the hospital
        public DateTime CreatedAt { get; set; } // Record creation timestamp
        public DateTime UpdatedAt { get; set; } // Record update timestamp
        public string? ImageUrl { get; set; }


    }
}