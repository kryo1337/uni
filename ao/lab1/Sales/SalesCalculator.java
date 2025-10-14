import java.util.List;

public class SalesCalculator {
    private List<Double> sales;

    public SalesCalculator(List<Double> sales) {
        this.sales = sales;
    }

    public double calculateTotalSales() {
        double sum = 0;
        for (Double sale : sales) {
            sum += sale;
        }
        return sum;
    }

    public double calculateAverageSales() {
        return calculateTotalSales() / sales.size();
    }
}

