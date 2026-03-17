package com.securitysaas.web.controller;

import com.securitysaas.domain.Ambiente;
import com.securitysaas.service.AmbienteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/ambiente")
public class AmbienteController {
    
    private final AmbienteService ambienteService;

    public AmbienteController(AmbienteService ambienteService) {
        this.ambienteService = ambienteService;
    }

    @GetMapping("/{id}/config")
    public ResponseEntity<Ambiente> getConfiguracao(@PathVariable String id) {
        Optional<Ambiente> config = ambienteService.obterConfiguracao(id);
        return config.map(ResponseEntity::ok)
                     .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/config")
    public ResponseEntity<Ambiente> salvarConfiguracao(@PathVariable String id, @RequestBody Ambiente ambiente) {
        ambiente.setId(id); // Garante update no document correto
        Ambiente salvo = ambienteService.salvarConfiguracao(ambiente);
        return ResponseEntity.ok(salvo);
    }
}
