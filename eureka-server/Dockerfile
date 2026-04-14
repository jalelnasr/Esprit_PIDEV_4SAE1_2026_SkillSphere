FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY target/eureka-server-1.0.0.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]
