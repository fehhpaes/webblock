package com.securitysaas.repository;

import com.securitysaas.domain.Notebook;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotebookRepository extends MongoRepository<Notebook, String> {
    List<Notebook> findByAmbienteId(String ambienteId);
}
