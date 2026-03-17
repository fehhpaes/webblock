package com.securitysaas.web.controller;

import com.securitysaas.security.JwtUtil;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    // Senha 'admin123' em BCrypt gerada previamente
    private final String MOCK_ADMIN_HASH = "$2a$10$Txb52/Uyd/6SPOB2Q3CqG.kK1OofX.K6H6Wvj1rP9tN4gMlypC3pW";

    public AuthController(JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginAdmin(@RequestBody LoginRequest request) {
        // Validação da senha com BCrypt
        if ("admin@empresa.com".equals(request.getEmail()) && passwordEncoder.matches(request.getPassword(), MOCK_ADMIN_HASH)) {
            String token = jwtUtil.generateAdminToken(request.getEmail());
            return ResponseEntity.ok(new AuthResponse(token));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/agent")
    public ResponseEntity<AuthResponse> getAgentToken(@RequestBody AgentAuthRequest request) {
        // Mock: A chave para gerar o token do ambiente. No mundo ideal ficaria salva na Empresa/Ambiente
        if ("CHAVE-SECRETA-MUITO-SEGURA".equals(request.getInstallKey())) {
            String token = jwtUtil.generateAgentToken(request.getAmbienteId());
            return ResponseEntity.ok(new AuthResponse(token));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}

@Data
class LoginRequest {
    private String email;
    private String password;
}

@Data
class AgentAuthRequest {
    private String ambienteId;
    private String installKey;
}

@Data
class AuthResponse {
    private String token;
    public AuthResponse(String token) {
        this.token = token;
    }
}
