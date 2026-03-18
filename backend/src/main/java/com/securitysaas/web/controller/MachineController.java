package com.securitysaas.web.controller;

import com.securitysaas.domain.Machine;
import com.securitysaas.domain.Ambiente;
import com.securitysaas.domain.User;
import com.securitysaas.repository.MachineRepository;
import com.securitysaas.repository.UserRepository;
import com.securitysaas.service.AmbienteService;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/machine")
public class MachineController {

    private final MachineRepository machineRepository;
    private final AmbienteService ambienteService;
    private final UserRepository userRepository;

    public MachineController(MachineRepository machineRepository, AmbienteService ambienteService, UserRepository userRepository) {
        this.machineRepository = machineRepository;
        this.ambienteService = ambienteService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || auth.getName() == null) return null;
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    // Endpoint acessado pelo PAINEL ADMIN para listar as máquinas de uma sala
    @GetMapping("/ambiente/{ambienteId}")
    public ResponseEntity<List<Machine>> listarMaquinas(Authentication authentication, @PathVariable String ambienteId) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Ambiente> ambiente = ambienteService.obterConfiguracao(ambienteId);
        if (ambiente.isEmpty() || !ambiente.get().getUserId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(machineRepository.findByAmbienteId(ambienteId));
    }

    // Endpoint acessado pelo AGENTE DESKTOP para avisar que está vivo
    // Não requer JWT - valida usando installKey do Ambiente
    @PostMapping("/heartbeat")
    public ResponseEntity<?> heartbeat(@RequestBody HeartbeatRequest request) {
        // Validações básicas
        if (request.getAmbienteId() == null || request.getHostname() == null) {
            return ResponseEntity.badRequest().body("ambienteId e hostname são obrigatórios");
        }

        // Busca o Ambiente e valida a installKey
        Optional<Ambiente> optAmbiente = ambienteService.obterConfiguracao(request.getAmbienteId());
        if (optAmbiente.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ambiente não encontrado");
        }

        Ambiente ambiente = optAmbiente.get();
        String storedKey = ambiente.getInstallKey();
        if (storedKey != null && !storedKey.equals(request.getInstallKey())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Chave de instalação inválida");
        }

        // Busca ou cria a máquina pelo hostname no ambiente
        Machine machine = machineRepository
            .findByAmbienteIdAndHostname(request.getAmbienteId(), request.getHostname())
            .orElse(new Machine());

        machine.setAmbienteId(request.getAmbienteId());
        machine.setHostname(request.getHostname());
        machine.setLastPing(LocalDateTime.now());
        machine.setIpAddress(request.getIpAddress());
        machine.setVersion(request.getVersion());

        machineRepository.save(machine);
        return ResponseEntity.ok().build();
    }
}

@Data
class HeartbeatRequest {
    private String ambienteId;
    private String installKey;
    private String hostname;
    private String ipAddress;
    private String version;
}
