package org.example.formation_service.exception;

import lombok.Getter;

@Getter
public class AccessDeniedException extends RuntimeException {
    private final String code;
    private String requiredPlan;
    private Integer currentCount;
    private Integer limit;
    
    public AccessDeniedException(String code, String message) {
        super(message);
        this.code = code;
    }
    
    public AccessDeniedException(String code, String message, String requiredPlan) {
        super(message);
        this.code = code;
        this.requiredPlan = requiredPlan;
    }
    
    public AccessDeniedException(String code, String message, Integer currentCount, Integer limit) {
        super(message);
        this.code = code;
        this.currentCount = currentCount;
        this.limit = limit;
    }
}
