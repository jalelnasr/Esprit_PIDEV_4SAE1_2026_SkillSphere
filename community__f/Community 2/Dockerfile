FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/Community-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", \
  "-Deureka.client.service-url.defaultZone=http://eureka-server:8761/eureka/", \
  "-Deureka.instance.hostname=community-service", \
  "-Deureka.instance.prefer-ip-address=true", \
  "-jar", "app.jar"]
