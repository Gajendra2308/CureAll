using System;
using System.ComponentModel.DataAnnotations;

namespace MultiHospital.DTOs
{
    public class TreatmentRecordGetDto
    {
        public int TreatmentRecordID { get; set; } // Unique identifier for the treatment record

        [Required(ErrorMessage = "Patient name is required.")]
        public string PatientName { get; set; } = ""; // Name of the patient

        [Required(ErrorMessage = "Doctor name is required.")]
        public string DoctorName { get; set; } = ""; // Name of the doctor

        public int AppointmentID { get; set; } // Appointment reference

        [DataType(DataType.DateTime)]
        [Required(ErrorMessage = "Treatment date is required.")]
        public DateTime TreatmentDate { get; set; } // Date of the treatment

        [StringLength(500, ErrorMessage = "Description cannot be longer than 500 characters.")]
        public string Description { get; set; } = ""; // Description of the treatment


        public bool IsVisibleToPatient { get; set; } // Visibility flag for the patient

        public DateTime CreatedAt { get; set; } // Record creation timestamp


        public DateTime UpdatedAt { get; set; } // Last update timestamp

        // Optional: Include billing information if available
        
    }

    // Billing DTO to include billing details
    public class BillingGetDto
    {
        public int BillingID { get; set; } // Unique identifier for the billing record
        public decimal Amount { get; set; } // Amount to be paid
        public bool IsPaid { get; set; } // Payment status
        public DateTime? PaymentDate { get; set; } // Date of payment
    }
}
