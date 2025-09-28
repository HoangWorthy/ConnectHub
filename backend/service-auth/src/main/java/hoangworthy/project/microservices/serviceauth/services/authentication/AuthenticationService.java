package hoangworthy.project.microservices.serviceauth.services.authentication;


import hoangworthy.project.microservices.serviceauth.dtos.AccountDto;
import hoangworthy.project.microservices.serviceauth.dtos.AccountDtoResponse;

public interface AuthenticationService {
    AccountDtoResponse registerByEmail(AccountDto account);
    AccountDtoResponse loginByEmail(AccountDto account);
}
