package com.securitysaas.web.controller;

import com.securitysaas.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthController authController;

    @Test
    public void testLoginAdminSuccess() {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@empresa.com");
        request.setPassword("admin123");

        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtUtil.generateAdminToken("admin@empresa.com")).thenReturn("mocked-jwt-token");

        ResponseEntity<AuthResponse> response = authController.loginAdmin(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("mocked-jwt-token", response.getBody().getToken());
    }

    @Test
    public void testLoginAdminFailure() {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@empresa.com");
        request.setPassword("wrong-password");

        // Utilizando matches com anyString() para capturar as entradas
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        ResponseEntity<AuthResponse> response = authController.loginAdmin(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }
}
