package com.securitysaas.repository;

import com.securitysaas.domain.Ambiente;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AmbienteRepository extends MongoRepository<Ambiente, String> {
    List<Ambiente> findByEmpresaId(String empresaId);
}
