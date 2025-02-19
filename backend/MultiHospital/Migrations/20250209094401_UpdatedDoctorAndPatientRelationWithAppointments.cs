using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MultiHospital.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedDoctorAndPatientRelationWithAppointments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Doctors_DoctorID",
                table: "Appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Patients_PatientID",
                table: "Appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_Doctors_Hospitals_HospitalID",
                table: "Doctors");

            migrationBuilder.AddColumn<int>(
                name: "AppointmentID",
                table: "TreatmentRecords",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TreatmentRecordID",
                table: "Appointments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_TreatmentRecords_AppointmentID",
                table: "TreatmentRecords",
                column: "AppointmentID",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Doctors_DoctorID",
                table: "Appointments",
                column: "DoctorID",
                principalTable: "Doctors",
                principalColumn: "DoctorID");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Patients_PatientID",
                table: "Appointments",
                column: "PatientID",
                principalTable: "Patients",
                principalColumn: "PatientID");

            migrationBuilder.AddForeignKey(
                name: "FK_Doctors_Hospitals_HospitalID",
                table: "Doctors",
                column: "HospitalID",
                principalTable: "Hospitals",
                principalColumn: "HospitalID");

            migrationBuilder.AddForeignKey(
                name: "FK_TreatmentRecords_Appointments_AppointmentID",
                table: "TreatmentRecords",
                column: "AppointmentID",
                principalTable: "Appointments",
                principalColumn: "AppointmentID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Doctors_DoctorID",
                table: "Appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Patients_PatientID",
                table: "Appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_Doctors_Hospitals_HospitalID",
                table: "Doctors");

            migrationBuilder.DropForeignKey(
                name: "FK_TreatmentRecords_Appointments_AppointmentID",
                table: "TreatmentRecords");

            migrationBuilder.DropIndex(
                name: "IX_TreatmentRecords_AppointmentID",
                table: "TreatmentRecords");

            migrationBuilder.DropColumn(
                name: "AppointmentID",
                table: "TreatmentRecords");

            migrationBuilder.DropColumn(
                name: "TreatmentRecordID",
                table: "Appointments");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Doctors_DoctorID",
                table: "Appointments",
                column: "DoctorID",
                principalTable: "Doctors",
                principalColumn: "DoctorID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Patients_PatientID",
                table: "Appointments",
                column: "PatientID",
                principalTable: "Patients",
                principalColumn: "PatientID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Doctors_Hospitals_HospitalID",
                table: "Doctors",
                column: "HospitalID",
                principalTable: "Hospitals",
                principalColumn: "HospitalID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
