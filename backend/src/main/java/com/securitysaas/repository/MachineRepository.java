package com.securitysaas.repository;

import com.securitysaas.domain.Machine;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MachineRepository extends MongoRepository<Machine, String> {
    List<Machine> findByAmbienteId(String ambienteId);
    Optional<Machine> findByAmbienteIdAndHostname(String ambienteId, String hostname);
}
