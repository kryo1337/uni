public class UserAccountManager {
    private UserValidator validator;
    private UserRepository repository;
    private EmailService emailService;
    private ActivityLogger logger;

    public UserAccountManager() {
        this.validator = new UserValidator();
        this.repository = new UserRepository();
        this.emailService = new EmailService();
        this.logger = new ActivityLogger();
    }

    public void createUser(String username, String email, String password) {
        if (!validator.isValidUsername(username) || !validator.isValidEmail(email) || !validator.isValidPassword(password)) {
            System.out.println("Invalid user data!");
            return;
        }

        repository.saveToDatabase(username, email, password);
        emailService.sendActivationEmail(email);
        logger.logToFile("User created: " + username);
    }
}
