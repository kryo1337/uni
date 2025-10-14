import java.io.FileWriter;
import java.io.IOException;

public class PdfReportGenerator {

    public void generatePdf(String filename, double totalSales, double averageSales) {
        System.out.println("Generating PDF report: " + filename);
        try (FileWriter writer = new FileWriter(filename)) {
            writer.write("Sales Report\n");
            writer.write("Total: " + totalSales + "\n");
            writer.write("Average: " + averageSales + "\n");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
