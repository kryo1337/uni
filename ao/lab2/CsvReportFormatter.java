import java.util.List;

public class CsvReportFormatter implements ReportFormatter {
    @Override
    public String format(List<Shipment> shipments) {
        StringBuilder report = new StringBuilder();
        report.append("id,status,destination\n");
        for (Shipment s : shipments) {
            report.append(s.getId()).append(",")
                  .append(s.getStatus()).append(",")
                  .append(s.getDestination()).append("\n");
        }
        return report.toString();
    }
}

