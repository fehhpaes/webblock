package com.securitysaas.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "machines")
public class Machine {
    @Id
    private String id;
    private String ambienteId; // A sala ao qual este PC pertence
    private String hostname;   // Nome do Computador no Windows
    private LocalDateTime lastPing; // Última vez que avisou que estava online
    private String ipAddress;
    private String version;    // Versão do Agente
}
