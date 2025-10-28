public class Shipment {
    private String id;
    private String status;
    private String destination;

    public Shipment(String id, String status, String destination) {
        this.id = id;
        this.status = status;
        this.destination = destination;
    }

    public String getId() { return id; }
    public String getStatus() { return status; }
    public String getDestination() { return destination; }
}
