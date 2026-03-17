package com.securitysaas.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.Instant;

@Data
@Document(collection = "notebooks")
public class Notebook {
    @Id
    private String id;
    private String ambienteId;
    private String hostname;
    private String macAddress;
    private String agenteVersion;
    private Instant ultimoVisto;
}
