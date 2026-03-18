package com.securitysaas.web.controller;

import com.securitysaas.domain.Ambiente;
import com.securitysaas.domain.User;
import com.securitysaas.repository.UserRepository;
import com.securitysaas.service.AmbienteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/ambiente")
public class AmbienteController {
    
    private final AmbienteService ambienteService;
    private final UserRepository userRepository;

    public AmbienteController(AmbienteService ambienteService, UserRepository userRepository) {
        this.ambienteService = ambienteService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || auth.getName() == null) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    @GetMapping("/meus")
    public ResponseEntity<List<Ambiente>> listarMeusAmbientes(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        return ResponseEntity.ok(ambienteService.listarAmbientesUsuario(user.getId()));
    }

    @PostMapping("/novo")
    public ResponseEntity<Ambiente> criarAmbiente(Authentication authentication, @RequestBody AmbienteRequest request) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Ambiente novo = ambienteService.criarAmbiente(user.getId(), request.getNome());
        return ResponseEntity.ok(novo);
    }

    @GetMapping("/{id}/config")
    public ResponseEntity<Ambiente> getConfiguracao(@PathVariable String id) {
        Optional<Ambiente> config = ambienteService.obterConfiguracao(id);
        return config.map(ResponseEntity::ok)
                     .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/config")
    public ResponseEntity<Ambiente> salvarConfiguracao(Authentication authentication, @PathVariable String id, @RequestBody Ambiente ambiente) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        // Verificar se usuário é dono
        Optional<Ambiente> existente = ambienteService.obterConfiguracao(id);
        if (existente.isPresent() && existente.get().getUserId().equals(user.getId())) {
            ambiente.setId(id);
            ambiente.setUserId(user.getId());
            Ambiente salvo = ambienteService.salvarConfiguracao(ambiente);
            return ResponseEntity.ok(salvo);
        }
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @GetMapping("/{id}/installkey")
    public ResponseEntity<?> getInstallKey(Authentication authentication, @PathVariable String id) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Ambiente> existente = ambienteService.obterConfiguracao(id);
        if (existente.isPresent() && existente.get().getUserId().equals(user.getId())) {
            return ResponseEntity.ok(java.util.Map.of("installKey", existente.get().getInstallKey()));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
}

class AmbienteRequest {
    private String nome;
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
}
