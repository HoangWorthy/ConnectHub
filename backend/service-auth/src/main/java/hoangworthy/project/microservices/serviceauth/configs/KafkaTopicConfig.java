package hoangworthy.project.microservices.serviceauth.configs;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic authUserEventTopic() {
        return new NewTopic("auth.user.event", 1, (short) 1);
    }

}
