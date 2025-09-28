package hoangworthy.project.microservices.serviceprofile;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.kafka.support.converter.JsonMessageConverter;

@SpringBootApplication
public class ServiceProfileApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServiceProfileApplication.class, args);
    }
    
}
