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
    private String empresaId;
    private String nome;
    private List<String> sitesBloqueados; 
    private Integer intervaloPing; 
}
