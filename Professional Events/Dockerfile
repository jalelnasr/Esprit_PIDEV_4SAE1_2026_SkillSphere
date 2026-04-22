FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY target/Professional_Events-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8087
ENTRYPOINT ["java", "-jar", "app.jar"]
