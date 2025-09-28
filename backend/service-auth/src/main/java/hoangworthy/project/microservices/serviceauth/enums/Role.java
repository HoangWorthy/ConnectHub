package hoangworthy.project.microservices.serviceauth.enums;

public enum Role {
    ADMIN("Admin"),
    MEMBER("Member");

    private final String role;

    Role(String value) {
        this.role = value;
    }

    @Override
    public String toString() {
        return role;
    }
}