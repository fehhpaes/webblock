package com.securitysaas.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class SseService {

    private final Map<String, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter addEmitter(String ambienteId) {
        SseEmitter emitter = new SseEmitter(0L); 
        
        emitters.computeIfAbsent(ambienteId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(ambienteId, emitter));
        emitter.onTimeout(() -> removeEmitter(ambienteId, emitter));
        emitter.onError((e) -> removeEmitter(ambienteId, emitter));

        return emitter;
    }

    private void removeEmitter(String ambienteId, SseEmitter emitter) {
        List<SseEmitter> ambienteEmitters = emitters.get(ambienteId);
        if (ambienteEmitters != null) {
            ambienteEmitters.remove(emitter);
        }
    }

    public void dispatchEventToAmbiente(String ambienteId, String eventName, Object eventData) {
        List<SseEmitter> ambienteEmitters = emitters.getOrDefault(ambienteId, List.of());
        
        for (SseEmitter emitter : ambienteEmitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(eventData));
            } catch (IOException e) {
                emitter.completeWithError(e);
                removeEmitter(ambienteId, emitter);
            }
        }
    }
}
