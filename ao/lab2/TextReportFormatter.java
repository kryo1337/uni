import java.util.List;

public class TextReportFormatter implements ReportFormatter {
    @Override
    public String format(List<Shipment> shipments) {
        StringBuilder report = new StringBuilder();
        report.append("=== SHIPMENT REPORT (TEXT) ===\n");
        for (Shipment s : shipments) {
            report.append("ID: ").append(s.getId())
                  .append(", Status: ").append(s.getStatus())
                  .append(", Destination: ").append(s.getDestination()).append("\n");
        }
        return report.toString();
    }
}

