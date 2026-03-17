package com.securitysaas.web.controller;

import com.securitysaas.service.SseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/agent")
public class SseController {

    private final SseService sseService;

    public SseController(SseService sseService) {
        this.sseService = sseService;
    }

    @GetMapping(value = "/connect/{ambienteId}", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter connect(@PathVariable String ambienteId) {
        return sseService.addEmitter(ambienteId);
    }

    @PostMapping("/force-sync/{ambienteId}")
    public CompletableFuture<ResponseEntity<String>> forceSync(@PathVariable String ambienteId) {
        return CompletableFuture.supplyAsync(() -> {
            sseService.dispatchEventToAmbiente(ambienteId, "update", "SYNC_REQUIRED");
            return ResponseEntity.ok("Sinal disparado para as máquinas do ambiente " + ambienteId);
        });
    }
}
