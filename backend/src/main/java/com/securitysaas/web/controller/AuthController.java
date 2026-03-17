package com.securitysaas.web.controller;

import com.securitysaas.domain.User;
import com.securitysaas.repository.UserRepository;
import com.securitysaas.security.JwtUtil;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public AuthController(JwtUtil jwtUtil, PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body("E-mail e senha são obrigatórios.");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Este e-mail já está em uso.");
        }

        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(newUser);

        return ResponseEntity.ok("Usuário cadastrado com sucesso.");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginAdmin(@RequestBody LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                String token = jwtUtil.generateAdminToken(user.getEmail());
                return ResponseEntity.ok(new AuthResponse(token));
            }
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
