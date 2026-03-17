package com.securitysaas.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "empresas")
public class Empresa {
    @Id
    private String id;
    private String nome;
    private String cnpj;
}
