package com.securitysaas.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.List;

@Data
@Document(collection = "ambientes")
public class Ambiente {
    @Id
    private String id;
    private String userId; // Quem é o criador/dono dessa sala
    private String nome;
    private String installKey; // Chave secreta usada pelo agente para se registrar
    private List<String> sitesBloqueados; 
    private Integer intervaloPing; 
}
