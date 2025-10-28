import java.util.List;

public class ShipmentReportGenerator {
    private final ReportFormatter formatter;

    public ShipmentReportGenerator(ReportFormatter formatter) {
        this.formatter = formatter;
    }

    public String generateReport(List<Shipment> shipments) {
        return formatter.format(shipments);
    }
}
