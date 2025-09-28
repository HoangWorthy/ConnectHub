package hoangworthy.project.microservices.serviceprofile.configs;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic profileUpdateEventTopic() {
        return new NewTopic("profile.user.event", 1, (short) 1);
    }
}
