import java.io.FileWriter;
import java.io.IOException;

public class ActivityLogger {

    public void logToFile(String message) {
        try (FileWriter writer = new FileWriter("user_log.txt", true)) {
            writer.write(message + "\n");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
