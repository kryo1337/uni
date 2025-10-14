import java.util.List;

public class SalesReport {
    private SalesCalculator calculator;
    private PdfReportGenerator pdfGenerator;
    private EmailSender emailSender;

    public SalesReport(List<Double> sales) {
        this.calculator = new SalesCalculator(sales);
        this.pdfGenerator = new PdfReportGenerator();
        this.emailSender = new EmailSender();
    }

    public double calculateTotalSales() {
        return calculator.calculateTotalSales();
    }

    public double calculateAverageSales() {
        return calculator.calculateAverageSales();
    }

    public void generatePdf(String filename) {
        pdfGenerator.generatePdf(filename, calculateTotalSales(), calculateAverageSales());
    }

    public void sendReportByEmail(String email, String filename) {
        emailSender.sendReportByEmail(email, filename);
    }
}
