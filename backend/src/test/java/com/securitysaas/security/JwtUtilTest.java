package com.securitysaas.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

public class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    public void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secretString", "5B32A9C0Z1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567");
        ReflectionTestUtils.setField(jwtUtil, "adminExpiration", 7200000L);
        ReflectionTestUtils.setField(jwtUtil, "agentExpiration", 31536000000L);
        jwtUtil.init();
    }

    @Test
    public void testGenerateAndValidateAdminToken() {
        String token = jwtUtil.generateAdminToken("admin@empresa.com");
        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token));
        assertEquals("admin@empresa.com", jwtUtil.getSubject(token));
        assertEquals("ADMIN", jwtUtil.getRole(token));
    }

    @Test
    public void testGenerateAndValidateAgentToken() {
        String token = jwtUtil.generateAgentToken("amb_12345");
        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token));
        assertEquals("amb_12345", jwtUtil.getSubject(token));
        assertEquals("AGENT", jwtUtil.getRole(token));
    }

    @Test
    public void testInvalidToken() {
        assertFalse(jwtUtil.validateToken("token.invalido.123"));
    }
}
