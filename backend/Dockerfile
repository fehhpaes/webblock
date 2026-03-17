# Estágio de Build (Usa Maven otimizado com cache)
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copia apenas os arquivos de dependência primeiro (para usar cache do Docker)
COPY pom.xml .
# Baixa as dependências offline (isso acelera builds subsequentes)
RUN mvn dependency:go-offline -B

# Copia o código-fonte restante
COPY src ./src

# Compila e empacota a aplicação, pulando testes para deploy mais rápido
RUN mvn clean package -DskipTests

# Estágio de Run (Imagem menor e focada apenas em execução JRE)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Variáveis padrão que podem ser sobrescritas pelo Render/Docker
ENV PORT=8080
ENV MONGO_URI="mongodb://localhost:27017/securitysaas"
ENV CORS_ORIGINS="*"
ENV JWT_SECRET="chaveMestreAleatoriaParaORenderSubirPorQualquerAmbiente12345"

# Copia o .jar gerado lá do estágio de build
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Informa a porta esperada (Apenas para documentação interna do Docker)
EXPOSE 8080

# Inicia o Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
