namespace MultiHospital.Models
{
    public class DoctorGetDto
    {
        public int DoctorID { get; set; }
        public string Name { get; set; }
        public string? Specialization { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? HospitalName { get; set; }

        public int HospitalID { get; set; }
        public string? DepartmentName { get; set; }
        public string? ImageUrl { get; set; } // Base64 string for image
        public string? Degree { get; set; } // New field for degree
        public string? Experience { get; set; } // New field for experience
        public bool IsAvailable { get; set; } // New field for availability status
        public decimal? Fees { get; set; }
    }
}
