package hoangworthy.project.microservices.serviceauth.controllers;

import hoangworthy.project.microservices.serviceauth.dtos.AccountDto;
import hoangworthy.project.microservices.serviceauth.dtos.AccountDtoResponse;
import hoangworthy.project.microservices.serviceauth.services.authentication.AuthenticationService;
import hoangworthy.project.microservices.utils.JwtUserDetails;
import hoangworthy.project.microservices.utils.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationService authenticationService;
    @Autowired
    private JwtUtil jwtUtil;
    private final long accessTokenAge;
    private final long refreshTokenAge;

    public AuthenticationController(@Value("${JWT_ACCESSEXPIRATION}") long accessTokenAge,
                                    @Value("${JWT_REFRESHEXPIRATION}") long refreshTokenAge) {
        this.accessTokenAge = accessTokenAge;
        this.refreshTokenAge = refreshTokenAge;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerByEmail(@Valid @RequestBody AccountDto account) {
        AccountDtoResponse accountDtoResponse = authenticationService.registerByEmail(account);
        JwtUserDetails jwtUserDetails = JwtUserDetails.builder()
                .accountId(accountDtoResponse.getId())
                .role(accountDtoResponse.getRole().toString())
                .build();
        ResponseCookie refreshCookie = ResponseCookie
                .from("RefreshToken", jwtUtil.generateRefreshToken(accountDtoResponse.getId()))
                .httpOnly(true)
                .secure(false)
                .sameSite("Strict")
                .maxAge(refreshTokenAge)
                .path("/")
                .build();
        ResponseCookie accessCookie = ResponseCookie
                .from("AccessToken", jwtUtil.generateAccessToken(jwtUserDetails))
                .httpOnly(true)
                .secure(false)
                .sameSite("Strict")
                .maxAge(accessTokenAge)
                .path("/")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString(), accessCookie.toString())
                .body(accountDtoResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginByEmail(@Valid @RequestBody AccountDto account) {
        AccountDtoResponse accountDtoResponse = authenticationService.loginByEmail(account);
        JwtUserDetails jwtUserDetails = JwtUserDetails.builder()
                .accountId(accountDtoResponse.getId())
                .role(accountDtoResponse.getRole().toString())
                .build();
        ResponseCookie refreshCookie = ResponseCookie
                .from("RefreshToken", jwtUtil.generateRefreshToken(accountDtoResponse.getId()))
                .httpOnly(true)
                .secure(false)
                .sameSite("Strict")
                .maxAge(refreshTokenAge)
                .path("/")
                .build();
        ResponseCookie accessCookie = ResponseCookie
                .from("AccessToken", jwtUtil.generateAccessToken(jwtUserDetails))
                .httpOnly(true)
                .secure(false)
                .sameSite("Strict")
                .maxAge(accessTokenAge)
                .path("/")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString(), accessCookie.toString())
                .body(accountDtoResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(name = "AccessToken") String accessToken,
                                    @CookieValue(name = "RefreshToken") String refreshToken) {
        ResponseCookie refreshCookie = ResponseCookie
                .from("RefreshToken", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Strict")
                .maxAge(0)
                .path("/")
                .build();
        ResponseCookie accessCookie = ResponseCookie
                .from("AccessToken", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Strict")
                .maxAge(0)
                .path("/")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString(), accessCookie.toString())
                .build();

    }
}
