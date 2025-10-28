import java.util.Arrays;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Shipment> shipments = Arrays.asList(
            new Shipment("SH001", "In Transit", "Warsaw"),
            new Shipment("SH002", "Delivered", "Krakow"),
            new Shipment("SH003", "Pending", "Gdansk")
        );

        System.out.println("=== TEXT FORMAT ===");
        ShipmentReportGenerator textGenerator = new ShipmentReportGenerator(new TextReportFormatter());
        System.out.println(textGenerator.generateReport(shipments));

        System.out.println("\n=== CSV FORMAT ===");
        ShipmentReportGenerator csvGenerator = new ShipmentReportGenerator(new CsvReportFormatter());
        System.out.println(csvGenerator.generateReport(shipments));

        System.out.println("\n=== JSON FORMAT ===");
        ShipmentReportGenerator jsonGenerator = new ShipmentReportGenerator(new JsonReportFormatter());
        System.out.println(jsonGenerator.generateReport(shipments));
    }
}

