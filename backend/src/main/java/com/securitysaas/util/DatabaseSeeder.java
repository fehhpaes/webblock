package com.securitysaas.util;

import com.securitysaas.domain.Ambiente;
import com.securitysaas.repository.AmbienteRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final AmbienteRepository ambienteRepository;

    public DatabaseSeeder(AmbienteRepository ambienteRepository) {
        this.ambienteRepository = ambienteRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (ambienteRepository.count() == 0) {
            System.out.println("Semeando banco de dados inicial (Mongoose)...");

            Ambiente ambiente = new Ambiente();
            ambiente.setId("amb_12345"); // ID que usamos no mock / front / agent
            ambiente.setUserId("admin-default-id");
            ambiente.setNome("Sede NY - Principal");
            ambiente.setIntervaloPing(60);
            ambiente.setSitesBloqueados(Arrays.asList("facebook.com", "bet365.com", "youtube.com"));
            ambiente.setInstallKey("WB-SEED-DEFAULT-KEY");

            ambienteRepository.save(ambiente);
            System.out.println("Ambiente padrão amb_12345 criado com sucesso no MongoDB.");
        }
    }
}
