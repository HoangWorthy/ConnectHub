package hoangworthy.project.microservices.eurukaserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class EurukaserverApplication {

    public static void main(String[] args) {
        SpringApplication.run(EurukaserverApplication.class, args);
    }

}
