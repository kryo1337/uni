import java.util.List;

public class JsonReportFormatter implements ReportFormatter {
    @Override
    public String format(List<Shipment> shipments) {
        StringBuilder report = new StringBuilder();
        report.append("{ \"shipments\": [");
        for (int i = 0; i < shipments.size(); i++) {
            Shipment s = shipments.get(i);
            report.append("{")
                  .append("\"id\": ").append("\"").append(s.getId()).append("\", ")
                  .append("\"status\": ").append("\"").append(s.getStatus()).append("\", ")
                  .append("\"destination\": ").append("\"").append(s.getDestination()).append("\"")
                  .append("}");
            if (i < shipments.size() - 1) report.append(", ");
        }
        report.append("]}");
        return report.toString();
    }
}

