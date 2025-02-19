namespace MultiHospital.DTOs
{
    public class DepartmentGetDto
    {
        public int DepartmentID { get; set; }
        public string HospitalName { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string? ImageBase64 { get; set; } // Base64 string for API response
    }
}
