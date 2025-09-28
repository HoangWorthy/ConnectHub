package hoangworthy.project.microservices.serviceauth.services.authentication;

import hoangworthy.project.microservices.serviceauth.dtos.AccountDto;
import hoangworthy.project.microservices.serviceauth.dtos.AccountDtoResponse;
import hoangworthy.project.microservices.serviceauth.entities.Account;
import hoangworthy.project.microservices.serviceauth.exceptions.AuthenticationFailedException;
import hoangworthy.project.microservices.serviceauth.exceptions.EmailAlreadyExistedException;
import hoangworthy.project.microservices.serviceauth.repositories.AccountRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class AuthenticationServiceImpl implements AuthenticationService {

    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuthEventPublisher authEventPublisher;

    @Override
    public AccountDtoResponse registerByEmail(AccountDto accountDto) {
        if (!accountRepository.existsByEmail(accountDto.getEmail())) {
            Account account = modelMapper.map(accountDto, Account.class);
            account.setPassword(passwordEncoder.encode(account.getPassword()));
            account = accountRepository.save(account);
            authEventPublisher.publishUserRegister(account.getId(), accountDto.getFullName());
            return modelMapper.map(account, AccountDtoResponse.class);
        } else throw new EmailAlreadyExistedException(accountDto.getEmail());
    }

    @Override
    public AccountDtoResponse loginByEmail(AccountDto accountDto) {
        if (accountRepository.existsByEmail(accountDto.getEmail())) {
            Account account = accountRepository.findByEmail(accountDto.getEmail());
            if (passwordEncoder.matches(accountDto.getPassword(), account.getPassword())) {
                return modelMapper.map(account, AccountDtoResponse.class);
            } else {
                throw new AuthenticationFailedException();
            }
        } else {
            throw new AuthenticationFailedException();
        }
    }
}
