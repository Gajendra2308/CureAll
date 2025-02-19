using MultiHospital.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace MultiHospital.Context
{
    public class IdentityDatabaseContext : IdentityDbContext
    {
        public IdentityDatabaseContext(DbContextOptions<IdentityDatabaseContext> dbOptions) : base(dbOptions)
        {

        }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<Hospital> Hospitals { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Patient> Patients { get; set; } // Add DbSet for Patients


        public DbSet<Appointment> Appointments { get; set; } // Add DbSet for Appointments

        public DbSet<TreatmentRecord> TreatmentRecords { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Hospital - Department Relationship ✅ (Cascade Allowed)
            modelBuilder.Entity<Hospital>()
                .HasMany(h => h.Departments)
                .WithOne(d => d.Hospital)
                .HasForeignKey(d => d.HospitalID)
                .OnDelete(DeleteBehavior.Cascade);

            // Department - Doctor Relationship ✅ (Cascade Allowed)
            modelBuilder.Entity<Department>()
                .HasMany(d => d.Doctors)
                .WithOne(doc => doc.Department)
                .HasForeignKey(doc => doc.DepartmentID)
                .OnDelete(DeleteBehavior.Cascade);

            // ❌ Prevent Multiple Cascade Paths for Doctor
            modelBuilder.Entity<Doctor>()
                .HasOne(d => d.Hospital)
                .WithMany(h => h.Doctors)
                .HasForeignKey(d => d.HospitalID)
                .OnDelete(DeleteBehavior.NoAction); // ❌ Fix multiple cascade paths

            // Doctor - Appointment Relationship
            modelBuilder.Entity<Doctor>()
                .HasMany(d => d.Appointments)
                .WithOne(a => a.Doctor)
                .HasForeignKey(a => a.DoctorID)
                .OnDelete(DeleteBehavior.Cascade); // ❌ Prevent cascading conflicts

            // Patient - Appointment Relationship
            modelBuilder.Entity<Patient>()
                .HasMany(p => p.Appointments)
                .WithOne(a => a.Patient)
                .HasForeignKey(a => a.PatientID)
                .OnDelete(DeleteBehavior.Cascade);

            // TreatmentRecord - Appointment Relationship
            modelBuilder.Entity<TreatmentRecord>()
                .HasOne(tr => tr.Appointment)
                .WithOne(a => a.TreatmentRecord)
                .HasForeignKey<TreatmentRecord>(tr => tr.AppointmentID)
                .OnDelete(DeleteBehavior.NoAction);

            // Billing Configuration
       
        }





    }
}