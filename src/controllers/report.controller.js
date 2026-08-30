import { JournalService } from "../services/journal.service.js";

export const ReportController = {
  // งบทดลอง — รวมเดบิต/เครดิตของทุกบัญชี
  async trialBalance(req, res) {
    try {
      const report = await JournalService.trialBalance();
      res.json(report);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
