import java.util.regex.Pattern;

public class UserValidator {

    public boolean isValidUsername(String username) {
        return username != null && username.length() >= 3;
    }

    public boolean isValidEmail(String email) {
        return Pattern.matches(".+@.+\\..+", email);
    }

    public boolean isValidPassword(String password) {
        return password != null && password.length() >= 8;
    }
}

