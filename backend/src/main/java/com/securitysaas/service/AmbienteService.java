package com.securitysaas.service;

import com.securitysaas.domain.Ambiente;
import com.securitysaas.repository.AmbienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

    public List<Ambiente> listarAmbientesUsuario(String userId) {
        return ambienteRepository.findByUserId(userId);
    }

    public Ambiente criarAmbiente(String userId, String nome) {
        Ambiente novo = new Ambiente();
        novo.setUserId(userId);
        novo.setNome(nome);
        novo.setIntervaloPing(60);
        novo.setSitesBloqueados(java.util.Collections.emptyList());
        // Gera chave de instalação única para este ambiente
        novo.setInstallKey("WB-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase());
        return ambienteRepository.save(novo);
    }

    public Ambiente salvarConfiguracao(Ambiente ambiente) {
        Ambiente saved = ambienteRepository.save(ambiente);
        // Após salvar, dispara o evento pros Notebooks daquele ambiente
        sseService.dispatchEventToAmbiente(saved.getId(), "update", "Nova política disponível");
        return saved;
    }
}
