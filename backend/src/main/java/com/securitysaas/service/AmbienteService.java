package com.securitysaas.service;

import com.securitysaas.domain.Ambiente;
import com.securitysaas.repository.AmbienteRepository;
import org.springframework.stereotype.Service;
import com.securitysaas.service.SseService;

import java.util.Optional;

@Service
public class AmbienteService {

    private final AmbienteRepository ambienteRepository;
    private final SseService sseService;

    public AmbienteService(AmbienteRepository ambienteRepository, SseService sseService) {
        this.ambienteRepository = ambienteRepository;
        this.sseService = sseService;
    }

    public Optional<Ambiente> obterConfiguracao(String id) {
        return ambienteRepository.findById(id);
    }

    public Ambiente salvarConfiguracao(Ambiente ambiente) {
        Ambiente saved = ambienteRepository.save(ambiente);
        // Após salvar, dispara o evento pros Notebooks daquele ambiente
        sseService.dispatchEventToAmbiente(saved.getId(), "update", "Nova política disponível");
        return saved;
    }
}
