const reminderModel = require("../models/reminderModel");
const sendEmail = require("../utils/sendEmail");

const notificationService = {
  async checkAndSendReminders() {
    console.log("Checking for due reminders...");
    try {
      const dueReminders = await reminderModel.findAllDueReminders();
      if (dueReminders.length === 0) {
        console.log("No due reminders found.");
        return;
      }
      console.log(
        `Found ${dueReminders.length} due reminders. Sending notifications...`
      );
      for (const reminder of dueReminders) {
        const vehicleName = reminder.vehicleNickname || reminder.vehicleModel;
        const subject = `Lembrete de Manutenção: ${reminder.service_type} para ${vehicleName}`;
        let message = `Olá, ${reminder.userName}!\n\n`;
        message += `Este é um lembrete para o serviço de "${reminder.service_type}" do seu veículo ${vehicleName}.\n\n`;
        if (reminder.date_threshold) {
          message += `Data agendada: ${new Date(
            reminder.date_threshold
          ).toLocaleDateString()}.\n`;
        }
        if (reminder.mileage_threshold) {
          message += `Quilometragem alvo: ${reminder.mileage_threshold} km. (Quilometragem atual: ${reminder.current_mileage} km)\n`;
        }
        message += `\nAtenciosamente,\nEquipe Auto Assistance`;
        await sendEmail({
          email: reminder.userEmail,
          subject,
          message,
        });
        console.log(
          `Notification sent for reminder ID: ${reminder.reminderId} to ${reminder.userEmail}`
        );
      }
    } catch (error) {
      console.error("Error sending reminder notifications:", error);
    }
  },
};

module.exports = notificationService;