using System;
using System.ComponentModel.DataAnnotations;

namespace MultiHospital.DTOs
{
    public class TreatmentRecordPostDto
    {
        [Required(ErrorMessage = "Patient ID is required.")]
        public int PatientID { get; set; }

        [Required(ErrorMessage = "Doctor ID is required.")]
        public int DoctorID { get; set; }

        [Required(ErrorMessage = "Appointment ID is required.")]
        public int AppointmentID { get; set; }

        [DataType(DataType.DateTime)]
        [Required(ErrorMessage = "Treatment date is required.")]
        [CustomDateValidation(ErrorMessage = "Treatment date cannot be in the future.")]
        public DateTime TreatmentDate { get; set; }

        [StringLength(500, ErrorMessage = "Description cannot be longer than 500 characters.")]
        public string Description { get; set; } = "";

        public bool IsVisibleToPatient { get; set; } = false; // Default to false

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
