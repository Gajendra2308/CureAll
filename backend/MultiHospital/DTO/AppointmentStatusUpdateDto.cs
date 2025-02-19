using System.ComponentModel.DataAnnotations;

namespace MultiHospital.Models
{
    public class AppointmentStatusUpdateDto
    {
        [Required(ErrorMessage = "New status is required.")]
        public AppointmentStatus NewStatus { get; set; }
    }
}
