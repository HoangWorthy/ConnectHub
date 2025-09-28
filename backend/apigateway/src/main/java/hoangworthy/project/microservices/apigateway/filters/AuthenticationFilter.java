package hoangworthy.project.microservices.apigateway.filters;

import hoangworthy.project.microservices.apigateway.utils.JwtUserDetails;
import hoangworthy.project.microservices.apigateway.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;

    public AuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        if ("websocket".equalsIgnoreCase(request.getHeaders().getUpgrade()) ||
                request.getPath().toString().contains("/message/ws")) {
            return chain.filter(exchange);
        }
        HttpCookie accessCookie = request.getCookies().getFirst("AccessToken");
        if(accessCookie != null && !accessCookie.getValue().isEmpty()) {
            try {
                String token = accessCookie.getValue();
                if (jwtUtil.validateAccessToken(token)) {
                    JwtUserDetails jwtUserDetails = jwtUtil.extractUserFromAccess(token);
                    ServerHttpRequest modifiedRequest = exchange.getRequest()
                            .mutate()
                            .header("AccountId", jwtUserDetails.getAccountId().toString())
                            .header("Role", jwtUserDetails.getRole())
                            .build();
                    return chain.filter(exchange.mutate().request(modifiedRequest).build());
                }
            } catch (Exception e) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
        }
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -1; // Need to go through this filter first
    }
}
