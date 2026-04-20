package org.example.formation_service.web.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
@Slf4j
public class FileUploadController {

    @Value("${file.upload.dir:src/main/resources/static/uploads/images}")
    private String uploadDir;

    @PostMapping("/video")
    public ResponseEntity<Map<String, String>> uploadVideo(@RequestParam("file") MultipartFile file) {
        log.info("Video upload request received - filename: {}, size: {}, contentType: {}", 
            file.getOriginalFilename(), file.getSize(), file.getContentType());
        
        try {
            if (file.isEmpty()) {
                log.error("File is empty");
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("video/")) {
                log.error("Invalid content type: {}", contentType);
                return ResponseEntity.badRequest().body(Map.of("error", "Only video files are allowed"));
            }

            // Create videos directory
            Path uploadPath = Paths.get(uploadDir).getParent().resolve("videos").toAbsolutePath();
            log.info("Upload path: {}", uploadPath);
            
            if (!Files.exists(uploadPath)) {
                log.info("Creating upload directory: {}", uploadPath);
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : ".mp4";
            String filename = UUID.randomUUID().toString() + extension;

            Path filePath = uploadPath.resolve(filename);
            log.info("Saving file to: {}", filePath);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/videos/" + filename;
            
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("filename", filename);
            response.put("size", String.valueOf(file.getSize()));
            
            log.info("✅ Video uploaded successfully: {} at {}", filename, filePath);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error uploading video", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to upload video: " + e.getMessage()));
        }
    }

    @PostMapping("/pdf")
    public ResponseEntity<Map<String, String>> uploadPdf(@RequestParam("file") MultipartFile file) {
        log.info("PDF upload request received - filename: {}, size: {}, contentType: {}", 
            file.getOriginalFilename(), file.getSize(), file.getContentType());
        
        try {
            if (file.isEmpty()) {
                log.error("File is empty");
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.equals("application/pdf")) {
                log.error("Invalid content type: {}", contentType);
                return ResponseEntity.badRequest().body(Map.of("error", "Only PDF files are allowed"));
            }

            // Create pdfs directory
            Path uploadPath = Paths.get(uploadDir).getParent().resolve("pdfs").toAbsolutePath();
            log.info("Upload path: {}", uploadPath);
            
            if (!Files.exists(uploadPath)) {
                log.info("Creating upload directory: {}", uploadPath);
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String filename = UUID.randomUUID().toString() + ".pdf";

            Path filePath = uploadPath.resolve(filename);
            log.info("Saving file to: {}", filePath);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/pdfs/" + filename;
            
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("filename", filename);
            response.put("size", String.valueOf(file.getSize()));
            
            log.info("✅ PDF uploaded successfully: {} at {}", filename, filePath);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error uploading PDF", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to upload PDF: " + e.getMessage()));
        }
    }

    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        log.info("Upload request received - filename: {}, size: {}, contentType: {}", 
            file.getOriginalFilename(), file.getSize(), file.getContentType());
        
        try {
            // Validation
            if (file.isEmpty()) {
                log.error("File is empty");
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                log.error("Invalid content type: {}", contentType);
                return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
            }

            // Créer le dossier si nécessaire (chemin absolu)
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
            log.info("Upload path: {}", uploadPath);
            
            if (!Files.exists(uploadPath)) {
                log.info("Creating upload directory: {}", uploadPath);
                Files.createDirectories(uploadPath);
            }

            // Générer un nom unique
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : ".jpg";
            String filename = UUID.randomUUID().toString() + extension;

            // Sauvegarder le fichier
            Path filePath = uploadPath.resolve(filename);
            log.info("Saving file to: {}", filePath);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Retourner l'URL
            String fileUrl = "/uploads/images/" + filename;
            
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("filename", filename);
            
            log.info("✅ Image uploaded successfully: {} at {}", filename, filePath);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error uploading image", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        }
    }
}
