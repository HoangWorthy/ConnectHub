package hoangworthy.project.microservices.serviceauth.exceptions;

public class EmailAlreadyExistedException extends RuntimeException{
    public EmailAlreadyExistedException(String message){
        super(message + " existed!");
    }
}
